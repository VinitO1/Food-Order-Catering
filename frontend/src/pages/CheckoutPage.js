import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaCreditCard, FaMoneyBillWave, FaPaypal, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import supabase from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Checkout.css';

const CheckoutPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [cartItems, setCartItems] = useState([]);

    const [formData, setFormData] = useState({
        delivery_address: '',
        delivery_city: '',
        delivery_province: '',
        delivery_postal_code: '',
        contact_phone: '',
        contact_email: user?.email || '',
        payment_method: 'credit_card',
        special_instructions: ''
    });

    // Constants for tax calculation
    const TAX_RATE = 0.12; // 12% tax rate

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        fetchCartItems();
    }, [user, navigate]);

    const fetchCartItems = async () => {
        try {
            setLoading(true);

            const { data: cartData, error: cartError } = await supabase
                .from('cart_items')
                .select(`
                    *,
                    restaurants:restaurant_id (
                        id,
                        name
                    )
                `)
                .eq('user_id', user.id.toString());

            if (cartError) throw cartError;

            if (!cartData || cartData.length === 0) {
                navigate('/cart');
                return;
            }

            setCartItems(cartData);
        } catch (err) {
            console.error('Error fetching cart items:', err);
            setError('Failed to load cart items');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const calculateSubtotal = () => {
        return cartItems.reduce((total, item) => {
            return total + (parseFloat(item.price) * item.quantity);
        }, 0);
    };

    const calculateTax = () => {
        return calculateSubtotal() * TAX_RATE;
    };

    const calculateTotal = () => {
        return calculateSubtotal() + calculateTax();
    };

    const generateOrderNumber = () => {
        const timestamp = new Date().getTime();
        const random = Math.floor(Math.random() * 1000);
        return `ORD-${timestamp}-${random}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            setError('Please sign in to complete your order');
            return;
        }

        if (cartItems.length === 0) {
            setError('Your cart is empty');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            console.log("Submitting order with user:", user);
            console.log("User ID:", user.id);
            console.log("User ID as string:", user.id.toString());

            // Get the current user ID from Supabase
            const { data: authData, error: authError } = await supabase.auth.getSession();
            if (authError) {
                throw new Error(`Error getting authenticated user session: ${authError.message}`);
            }

            console.log("Auth session data from Supabase:", authData);
            const userId = authData.session?.user?.id || user.id;
            console.log("Using user ID:", userId);

            const subtotal = calculateSubtotal();
            const tax = calculateTax();
            const total = calculateTotal();
            const orderNumber = generateOrderNumber();

            const orderData = {
                user_id: userId.toString(),
                order_number: orderNumber,
                subtotal,
                tax,
                total,
                delivery_address: formData.delivery_address,
                delivery_city: formData.delivery_city,
                delivery_province: formData.delivery_province,
                delivery_postal_code: formData.delivery_postal_code,
                contact_phone: formData.contact_phone,
                contact_email: formData.contact_email,
                payment_method: formData.payment_method,
                special_instructions: formData.special_instructions || null,
                status: 'pending'
            };

            console.log("Inserting order with data:", orderData);

            // Create order in cx_orders table
            const { data: insertedOrder, error: orderError } = await supabase
                .from('cx_orders')
                .insert([orderData])
                .select();

            if (orderError) {
                console.error("Error creating order:", orderError);
                throw orderError;
            }

            console.log("Order created successfully:", insertedOrder);

            if (!insertedOrder || insertedOrder.length === 0) {
                throw new Error("Order was created but no data was returned");
            }

            const orderId = insertedOrder[0].id;

            // Set a timeout to automatically change the order status from "pending" to "approved" after 15 seconds
            setTimeout(async () => {
                try {
                    console.log(`Automatically approving order ${orderId} after 15 seconds`);
                    const { error: updateError } = await supabase
                        .from('cx_orders')
                        .update({ status: 'approved' })
                        .eq('id', orderId);

                    if (updateError) {
                        console.error(`Error approving order ${orderId}:`, updateError);
                    } else {
                        console.log(`Order ${orderId} automatically approved`);
                    }
                } catch (err) {
                    console.error(`Error in auto-approval for order ${orderId}:`, err);
                }
            }, 15000); // 15 seconds

            // Create order items in cx_order_items table
            const orderItems = cartItems.map(item => ({
                order_id: orderId,
                restaurant_id: item.restaurant_id,
                menu_item_id: item.menu_item_id,
                item_name: item.item_name,
                quantity: item.quantity,
                price: parseFloat(item.price),
                subtotal: parseFloat(item.price) * item.quantity
            }));

            console.log("Inserting order items:", orderItems);

            const { error: itemsError } = await supabase
                .from('cx_order_items')
                .insert(orderItems);

            if (itemsError) {
                console.error("Error creating order items:", itemsError);
                throw itemsError;
            }

            console.log("Order items created successfully");

            // Clear cart after successful order
            console.log("Clearing cart for user:", userId);
            const { error: clearCartError } = await supabase
                .from('cart_items')
                .delete()
                .eq('user_id', userId.toString());

            if (clearCartError) {
                console.error('Error clearing cart:', clearCartError);
                // Continue anyway, not critical
            } else {
                console.log("Cart cleared successfully");
            }

            setSuccess(true);
            setCartItems([]);

            // Reset form
            setFormData({
                delivery_address: '',
                delivery_city: '',
                delivery_province: '',
                delivery_postal_code: '',
                contact_phone: '',
                contact_email: user?.email || '',
                payment_method: 'credit_card',
                special_instructions: ''
            });

            // Scroll to top to show success message
            window.scrollTo(0, 0);

            // Store the order ID for the confirmation page
            console.log("Storing order ID in session storage:", orderId);
            sessionStorage.setItem('lastOrderId', orderId);

            // Redirect to order confirmation after a delay
            setTimeout(() => {
                console.log("Redirecting to order confirmation page");
                navigate(`/order-confirmation/${orderId}`);
            }, 2000);

        } catch (err) {
            console.error('Error placing order:', err);
            setError(`Failed to place your order: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </Container>
        );
    }

    if (cartItems.length === 0 && !loading) {
        return (
            <Container className="my-4">
                <Alert variant="info">
                    Your cart is empty. Please add items to your cart before checkout.
                </Alert>
                <Button variant="primary" onClick={() => navigate('/restaurants')}>
                    Browse Restaurants
                </Button>
            </Container>
        );
    }

    return (
        <Container className="my-4 checkout-container">
            <h1 className="text-center mb-4">Checkout</h1>

            {error && (
                <Alert variant="danger" className="mb-4">
                    {error}
                </Alert>
            )}

            {success && (
                <Alert variant="success" className="mb-4">
                    Your order has been placed successfully! Redirecting to order confirmation...
                </Alert>
            )}

            <Row>
                <Col lg={8}>
                    <Card className="mb-4 checkout-form-card">
                        <Card.Header className="bg-primary text-white">
                            <h3 className="mb-0">Delivery Information</h3>
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleSubmit}>
                                <Row className="mb-3">
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Delivery Address</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="delivery_address"
                                                value={formData.delivery_address}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="Street address"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>City</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="delivery_city"
                                                value={formData.delivery_city}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Province</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="delivery_province"
                                                value={formData.delivery_province}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Postal Code</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="delivery_postal_code"
                                                value={formData.delivery_postal_code}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Phone Number</Form.Label>
                                            <Form.Control
                                                type="tel"
                                                name="contact_phone"
                                                value={formData.contact_phone}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="Your contact number"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Email</Form.Label>
                                            <Form.Control
                                                type="email"
                                                name="contact_email"
                                                value={formData.contact_email}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="Your email address"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Special Instructions</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                name="special_instructions"
                                                value={formData.special_instructions}
                                                onChange={handleInputChange}
                                                placeholder="Any special delivery instructions or dietary requirements"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <h4 className="mb-3">Payment Method</h4>
                                <Row className="mb-4">
                                    <Col md={12}>
                                        <div className="payment-methods">
                                            <Form.Check
                                                type="radio"
                                                id="credit_card"
                                                name="payment_method"
                                                value="credit_card"
                                                checked={formData.payment_method === 'credit_card'}
                                                onChange={handleInputChange}
                                                label={
                                                    <span className="payment-method-label">
                                                        <FaCreditCard className="payment-icon" /> Credit Card
                                                    </span>
                                                }
                                                className="payment-method-option"
                                            />

                                            <Form.Check
                                                type="radio"
                                                id="paypal"
                                                name="payment_method"
                                                value="paypal"
                                                checked={formData.payment_method === 'paypal'}
                                                onChange={handleInputChange}
                                                label={
                                                    <span className="payment-method-label">
                                                        <FaPaypal className="payment-icon" /> PayPal
                                                    </span>
                                                }
                                                className="payment-method-option"
                                            />

                                            <Form.Check
                                                type="radio"
                                                id="cash"
                                                name="payment_method"
                                                value="cash"
                                                checked={formData.payment_method === 'cash'}
                                                onChange={handleInputChange}
                                                label={
                                                    <span className="payment-method-label">
                                                        <FaMoneyBillWave className="payment-icon" /> Cash on Delivery
                                                    </span>
                                                }
                                                className="payment-method-option"
                                            />
                                        </div>
                                    </Col>
                                </Row>

                                <div className="d-grid">
                                    <Button
                                        variant="primary"
                                        type="submit"
                                        size="lg"
                                        disabled={submitting || cartItems.length === 0}
                                    >
                                        {submitting ? (
                                            <>
                                                <Spinner
                                                    as="span"
                                                    animation="border"
                                                    size="sm"
                                                    role="status"
                                                    aria-hidden="true"
                                                    className="me-2"
                                                />
                                                Processing...
                                            </>
                                        ) : (
                                            `Place Order - $${calculateTotal().toFixed(2)}`
                                        )}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={4}>
                    <Card className="mb-4 order-summary-card">
                        <Card.Header className="bg-primary text-white">
                            <h3 className="mb-0">Order Summary</h3>
                        </Card.Header>
                        <Card.Body>
                            <ListGroup variant="flush" className="order-items">
                                {cartItems.map((item, index) => (
                                    <ListGroup.Item key={index} className="order-item">
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div>
                                                <div className="item-name">{item.item_name}</div>
                                                <div className="item-restaurant">{item.restaurants?.name || 'Restaurant'}</div>
                                                <div className="item-quantity">Qty: {item.quantity}</div>
                                            </div>
                                            <div className="item-price">
                                                ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                                            </div>
                                        </div>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>

                            <div className="price-summary">
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Subtotal:</span>
                                    <span>${calculateSubtotal().toFixed(2)}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Tax (12%):</span>
                                    <span>${calculateTax().toFixed(2)}</span>
                                </div>
                                <div className="d-flex justify-content-between total-row">
                                    <span>Total:</span>
                                    <span>${calculateTotal().toFixed(2)}</span>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>

                    <Card className="delivery-info-card">
                        <Card.Body>
                            <h5 className="mb-3">Delivery Information</h5>
                            <div className="info-item">
                                <FaMapMarkerAlt className="info-icon" />
                                <div>
                                    <h6>Delivery Area</h6>
                                    <p>We deliver throughout the Greater Vancouver area.</p>
                                </div>
                            </div>

                            <div className="info-item">
                                <FaPhone className="info-icon" />
                                <div>
                                    <h6>Contact Us</h6>
                                    <p>For order inquiries, please call us at (604) 123-4567.</p>
                                </div>
                            </div>

                            <div className="info-item mb-0">
                                <FaEnvelope className="info-icon" />
                                <div>
                                    <h6>Email</h6>
                                    <p className="mb-0">orders@indianfooddelivery.com</p>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default CheckoutPage; 