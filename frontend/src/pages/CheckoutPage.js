import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert, ListGroup, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaCheck, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { getUserCart } from '../utils/supabase';
import supabase from '../utils/supabase';

const CheckoutPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [orderNumber, setOrderNumber] = useState(null);
    const [orderStatus, setOrderStatus] = useState('pending');
    const [orderId, setOrderId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        paymentMethod: 'credit-card'
    });

    // Fetch cart items on component mount
    useEffect(() => {
        if (!user) {
            navigate('/login', { state: { from: '/checkout' } });
            return;
        }
        fetchCartItems();
    }, [user, navigate]);

    const fetchCartItems = async () => {
        try {
            setLoading(true);
            const { success, data, error } = await getUserCart(user.id);

            if (!success || error) {
                throw new Error(error || 'Failed to fetch cart items');
            }

            if (!data || data.length === 0) {
                navigate('/cart');
                return;
            }

            setCartItems(data);

            // Pre-fill email from user account
            if (user?.email) {
                setFormData(prev => ({
                    ...prev,
                    email: user.email
                }));
            }
        } catch (err) {
            console.error('Error fetching cart for checkout:', err);
            setError('Failed to load cart items. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const calculateSubtotal = () => {
        return cartItems.reduce((total, item) => {
            const price = parseFloat(item.price || item.item_price || 0);
            return total + (price * item.quantity);
        }, 0);
    };

    const calculateFlatFee = () => {
        return 5.00; // $5 flat fee on all orders
    };

    const calculateTax = () => {
        return calculateSubtotal() * 0.12; // 12% tax (GST + PST)
    };

    const calculateDeliveryFee = () => {
        return 5.99; // Fixed delivery fee
    };

    const calculateTotal = () => {
        return calculateSubtotal() + calculateTax() + calculateDeliveryFee() + calculateFlatFee();
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            setError(null);

            // Validate form
            const requiredFields = ['fullName', 'email', 'phone', 'address', 'city', 'postalCode'];
            for (const field of requiredFields) {
                if (!formData[field]) {
                    throw new Error(`Please enter your ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
                }
            }

            console.log('Processing order with form data:', formData);
            console.log('Cart items:', cartItems);

            // Generate random order number
            const orderNumber = Math.floor(100000 + Math.random() * 900000).toString();

            // Try creating the order with the absolute minimum fields
            try {
                console.log('Attempting to create order with minimally required fields');

                // Calculate values but combine into fields we know exist in the schema
                const itemsSubtotal = calculateSubtotal();
                const flatFee = calculateFlatFee(); // Still calculate for display
                // Include flat fee in the subtotal for database storage since flat_fee column doesn't exist
                const subtotalWithFlatFee = itemsSubtotal + flatFee;
                const tax = calculateTax();
                // Total includes delivery fee too
                const total = calculateTotal();

                console.log('Order calculations:', {
                    items_subtotal: itemsSubtotal,
                    flat_fee: flatFee,
                    subtotal_with_flat_fee: subtotalWithFlatFee,
                    tax: tax,
                    total: total
                });

                // Create order with customer information and financial details
                const orderObject = {
                    user_id: user.id,
                    order_number: orderNumber,
                    status: 'pending',

                    // Financial information
                    subtotal: subtotalWithFlatFee, // Include flat fee in subtotal
                    tax: tax,
                    total: total,

                    // Customer information
                    customer_name: formData.fullName,
                    customer_email: formData.email,
                    customer_phone: formData.phone,
                    delivery_address: formData.address,
                    city: formData.city,
                    postal_code: formData.postalCode,
                    payment_method: formData.paymentMethod,

                    // Timestamps
                    created_at: new Date().toISOString()
                };

                console.log('Creating order with:', orderObject);

                const { data: orderData, error: orderError } = await supabase
                    .from('orders')
                    .insert(orderObject)
                    .select()
                    .single();

                if (orderError) {
                    console.error('Order creation failed:', orderError);
                    throw new Error(`Could not create order: ${orderError.message}`);
                }

                console.log('Order created successfully:', orderData);

                // Create order items
                const orderItems = cartItems.map(item => ({
                    order_id: orderData.id,
                    restaurant_id: item.restaurant_id,
                    item_name: item.item_name,
                    price: parseFloat(item.price || item.item_price || 0),
                    quantity: item.quantity
                }));

                console.log('Creating order items:', orderItems);

                const { error: itemsError } = await supabase
                    .from('order_items')
                    .insert(orderItems);

                if (itemsError) {
                    console.error('Failed to create order items:', itemsError);
                    throw new Error(`Failed to create order items: ${itemsError.message}`);
                }

                // Clear the cart
                const { error: clearError } = await supabase
                    .from('cart_items')
                    .delete()
                    .eq('user_id', user.id);

                if (clearError) {
                    console.error('Failed to clear cart:', clearError);
                }

                // Set success state
                setOrderNumber(orderNumber);
                setOrderId(orderData.id);
                setOrderStatus('pending');
                setOrderPlaced(true);

                // Store customer info in session storage for reference
                sessionStorage.setItem('lastOrderCustomerInfo', JSON.stringify({
                    fullName: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    city: formData.city,
                    postalCode: formData.postalCode,
                    paymentMethod: formData.paymentMethod
                }));

                // Set up status change timers
                console.log('Setting up automatic status updates for order:', orderData.id);

                // Update to "approved" after 30 seconds
                setTimeout(async () => {
                    try {
                        console.log(`Updating order ${orderData.id} status to "approved"`);
                        const { error: approveError } = await supabase
                            .from('orders')
                            .update({
                                status: 'approved',
                                updated_at: new Date().toISOString()
                            })
                            .eq('id', orderData.id);

                        if (approveError) {
                            console.error('Error updating order to approved:', approveError);
                        } else {
                            console.log(`Order ${orderData.id} status updated to "approved" successfully`);

                            // Update to "delivered" 30 seconds after approval
                            setTimeout(async () => {
                                try {
                                    console.log(`Updating order ${orderData.id} status to "delivered"`);
                                    const { error: deliverError } = await supabase
                                        .from('orders')
                                        .update({
                                            status: 'delivered',
                                            updated_at: new Date().toISOString(),
                                            delivery_date: new Date().toISOString()
                                        })
                                        .eq('id', orderData.id);

                                    if (deliverError) {
                                        console.error('Error updating order to delivered:', deliverError);
                                    } else {
                                        console.log(`Order ${orderData.id} status updated to "delivered" successfully`);
                                    }
                                } catch (err) {
                                    console.error('Error in delivery status update:', err);
                                }
                            }, 30000); // 30 seconds for delivery after approval
                        }
                    } catch (err) {
                        console.error('Error in approval status update:', err);
                    }
                }, 30000); // 30 seconds for approval

            } catch (err) {
                console.error('Order creation process error:', err);
                throw err;
            }
        } catch (err) {
            console.error('Checkout error:', err);
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    // Function to check and update order status
    const checkOrderStatus = async (id) => {
        if (!id) return;

        try {
            const { data, error } = await supabase
                .from('orders')
                .select('status')
                .eq('id', id)
                .single();

            if (error) {
                console.error('Error checking order status:', error);
                return;
            }

            if (data && data.status !== orderStatus) {
                console.log(`Order status changed from ${orderStatus} to ${data.status}`);
                setOrderStatus(data.status);
            }
        } catch (err) {
            console.error('Error in status check:', err);
        }
    };

    // Set up status polling if order is placed
    useEffect(() => {
        if (!orderPlaced || !orderId) return;

        // Check status immediately
        checkOrderStatus(orderId);

        // Set up interval to check status every 10 seconds
        const statusInterval = setInterval(() => {
            checkOrderStatus(orderId);
        }, 10000);

        return () => clearInterval(statusInterval);
    }, [orderPlaced, orderId, orderStatus]);

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </Container>
        );
    }

    if (orderPlaced) {
        // Helper function to get status badge
        const getStatusBadge = (status) => {
            switch (status) {
                case 'pending':
                    return <Badge bg="warning" className="px-3 py-2 fs-6">Pending</Badge>;
                case 'approved':
                    return <Badge bg="info" className="px-3 py-2 fs-6">Approved</Badge>;
                case 'delivered':
                    return <Badge bg="success" className="px-3 py-2 fs-6">Delivered</Badge>;
                default:
                    return <Badge bg="secondary" className="px-3 py-2 fs-6">{status}</Badge>;
            }
        };

        // Helper function to get status message
        const getStatusMessage = (status) => {
            switch (status) {
                case 'pending':
                    return "Your order is being processed. It will be approved shortly.";
                case 'approved':
                    return "Your order has been approved and is being prepared for delivery.";
                case 'delivered':
                    return "Your order has been delivered. Enjoy your meal!";
                default:
                    return "Your order status is being updated.";
            }
        };

        return (
            <Container className="py-5">
                <Card className="shadow-sm text-center p-5">
                    <Card.Body>
                        <div className="mb-4">
                            <span className="bg-success text-white p-3 rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                                <FaCheck size={40} />
                            </span>
                        </div>
                        <h1 className="mb-3">Thank You For Your Order!</h1>
                        <p className="text-muted mb-4">Your order has been placed successfully.</p>

                        <div className="border p-4 mb-4">
                            <h3>Order #: {orderNumber}</h3>
                            <p className="mb-3">We've sent a confirmation email to {formData.email}</p>

                            <div className="d-flex justify-content-center align-items-center mb-2">
                                <span className="me-2">Status:</span> {getStatusBadge(orderStatus)}
                            </div>
                            <p className="text-muted">{getStatusMessage(orderStatus)}</p>

                            {orderStatus === 'pending' && (
                                <div className="d-flex justify-content-center mt-3">
                                    <Spinner size="sm" animation="border" className="me-2" />
                                    <span>Your order will be approved in a few seconds...</span>
                                </div>
                            )}
                        </div>

                        <div className="mt-4">
                            <p>Your order will be delivered to:</p>
                            <p className="fw-bold mb-4">{formData.address}, {formData.city}, {formData.postalCode}</p>

                            <Button variant="primary" as={Link} to="/restaurants" className="me-2">
                                Continue Shopping
                            </Button>
                            <Button variant="outline-secondary" as={Link} to="/orders">
                                View My Orders
                            </Button>
                        </div>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <h1 className="mb-4">Checkout</h1>

            {error && (
                <Alert variant="danger">{error}</Alert>
            )}

            <Row>
                <Col lg={8}>
                    <Card className="shadow-sm mb-4">
                        <Card.Body>
                            <h3 className="mb-4">Delivery Information</h3>
                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Full Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Email</Form.Label>
                                            <Form.Control
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3">
                                    <Form.Label>Phone Number</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Delivery Address</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>City</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Postal Code</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="postalCode"
                                                value={formData.postalCode}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <h3 className="mt-4 mb-3">Payment Method</h3>
                                <Form.Group className="mb-4">
                                    <div className="border rounded p-3 mb-2">
                                        <Form.Check
                                            type="radio"
                                            id="credit-card"
                                            name="paymentMethod"
                                            value="credit-card"
                                            checked={formData.paymentMethod === 'credit-card'}
                                            onChange={handleInputChange}
                                            label="Credit Card"
                                            className="fs-5"
                                        />
                                    </div>
                                    <div className="border rounded p-3 mb-2">
                                        <Form.Check
                                            type="radio"
                                            id="cash"
                                            name="paymentMethod"
                                            value="cash"
                                            checked={formData.paymentMethod === 'cash'}
                                            onChange={handleInputChange}
                                            label="Cash on Delivery"
                                            className="fs-5"
                                        />
                                    </div>
                                </Form.Group>

                                <div className="d-flex justify-content-between mt-4">
                                    <Button
                                        variant="outline-secondary"
                                        as={Link}
                                        to="/cart"
                                        className="d-flex align-items-center"
                                    >
                                        <FaArrowLeft className="me-2" /> Back to Cart
                                    </Button>
                                    <Button
                                        variant="success"
                                        type="submit"
                                        size="lg"
                                        disabled={submitting}
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
                                            'Place Order'
                                        )}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={4}>
                    <Card className="shadow-sm mb-4">
                        <Card.Header className="bg-light">
                            <h3 className="mb-0">Order Summary</h3>
                        </Card.Header>
                        <Card.Body>
                            <ListGroup variant="flush">
                                {cartItems.map(item => {
                                    const price = parseFloat(item.price || item.item_price || 0);
                                    return (
                                        <ListGroup.Item key={item.id} className="px-0 py-2">
                                            <div className="d-flex justify-content-between">
                                                <div>
                                                    <span className="fw-bold me-2">{item.quantity}x</span>
                                                    <span>{item.item_name}</span>
                                                </div>
                                                <div className="fw-bold">
                                                    ${(price * item.quantity).toFixed(2)}
                                                </div>
                                            </div>
                                        </ListGroup.Item>
                                    );
                                })}
                            </ListGroup>

                            <hr className="my-3" />

                            <div className="d-flex justify-content-between mb-2">
                                <span>Subtotal:</span>
                                <span>${calculateSubtotal().toFixed(2)}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span>Flat Fee:</span>
                                <span>${calculateFlatFee().toFixed(2)}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span>Tax (12% GST + PST):</span>
                                <span>${calculateTax().toFixed(2)}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-3">
                                <span>Delivery Fee:</span>
                                <span>${calculateDeliveryFee().toFixed(2)}</span>
                            </div>

                            <div className="d-flex justify-content-between fw-bold fs-5 mt-3 pt-3 border-top">
                                <span>Total:</span>
                                <span>${calculateTotal().toFixed(2)}</span>
                            </div>
                        </Card.Body>
                    </Card>

                    <Card className="shadow-sm mb-4 bg-light">
                        <Card.Body>
                            <h5 className="mb-3">About Your Order</h5>
                            <p className="mb-1">• Estimated delivery time: 30-45 minutes</p>
                            <p className="mb-1">• We accept credit cards and cash on delivery</p>
                            <p className="mb-0">• Orders can be tracked in your account</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default CheckoutPage; 