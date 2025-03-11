import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Alert, Button } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { FaShoppingBag, FaCalendarAlt, FaMapMarkerAlt, FaPhone, FaEnvelope, FaCreditCard, FaMoneyBill, FaInfoCircle, FaCheckCircle } from 'react-icons/fa';
import supabase from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';
import '../styles/OrderConfirmation.css';

const OrderConfirmationPage = () => {
    const { orderId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [order, setOrder] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [statusRefreshCount, setStatusRefreshCount] = useState(0);

    useEffect(() => {
        if (user && orderId) {
            fetchOrderDetails();
        } else {
            setLoading(false);
        }
    }, [user, orderId, statusRefreshCount]);

    // Set up a timer to refresh the order status every 5 seconds for up to 30 seconds
    useEffect(() => {
        if (!order) return;

        // Only set up the refresh timer if the order is in "pending" status
        if (order.status === 'pending') {
            const timer = setTimeout(() => {
                // Increment the refresh counter to trigger a re-fetch
                if (statusRefreshCount < 6) { // Limit to 6 refreshes (30 seconds)
                    setStatusRefreshCount(prev => prev + 1);
                }
            }, 5000); // Refresh every 5 seconds

            return () => clearTimeout(timer);
        }
    }, [order, statusRefreshCount]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);

            // Fetch order details
            const { data: orderData, error: orderError } = await supabase
                .from('cx_orders')
                .select('*')
                .eq('id', orderId)
                .eq('user_id', user.id.toString())
                .single();

            if (orderError) {
                throw orderError;
            }

            if (!orderData) {
                throw new Error('Order not found');
            }

            setOrder(orderData);

            // Fetch order items
            const { data: itemsData, error: itemsError } = await supabase
                .from('cx_order_items')
                .select(`
                    *,
                    restaurants:restaurant_id (
                        id,
                        name
                    )
                `)
                .eq('order_id', orderId);

            if (itemsError) {
                throw itemsError;
            }

            setOrderItems(itemsData || []);

        } catch (err) {
            console.error('Error fetching order details:', err);
            setError('Failed to load order details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return <Badge bg="warning">Pending</Badge>;
            case 'approved':
                return <Badge bg="success">Approved</Badge>;
            case 'processing':
                return <Badge bg="info">Processing</Badge>;
            case 'delivered':
                return <Badge bg="success">Delivered</Badge>;
            case 'cancelled':
                return <Badge bg="danger">Cancelled</Badge>;
            default:
                return <Badge bg="secondary">{status}</Badge>;
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getPaymentMethodIcon = (method) => {
        switch (method) {
            case 'credit_card':
                return <FaCreditCard className="payment-icon" />;
            case 'cash':
                return <FaMoneyBill className="payment-icon" />;
            default:
                return null;
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

    if (!user) {
        return (
            <Container className="my-4">
                <Alert variant="warning">
                    Please <Button variant="link" className="p-0" onClick={() => navigate('/login')}>sign in</Button> to view your order details.
                </Alert>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="my-4">
                <Alert variant="danger">
                    {error}
                </Alert>
            </Container>
        );
    }

    if (!order) {
        return (
            <Container className="my-4">
                <Alert variant="warning">
                    Order not found. <Button variant="link" className="p-0" onClick={() => navigate('/order-history')}>View your order history</Button>
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="my-4 order-confirmation-container">
            <div className="confirmation-header">
                <FaCheckCircle className="confirmation-icon" />
                <h1>Order Confirmed!</h1>
                <p>Your order has been placed successfully.</p>
            </div>

            <Card className="order-details-card">
                <Card.Header className="bg-primary text-white">
                    <div className="d-flex justify-content-between align-items-center">
                        <h3 className="mb-0">Order #{order.order_number}</h3>
                        <div className="d-flex align-items-center">
                            {getStatusBadge(order.status)}
                            <span className="ms-3 order-date">
                                <FaCalendarAlt className="me-2" />
                                {formatDate(order.created_at)}
                            </span>
                        </div>
                    </div>
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col md={6}>
                            <div className="detail-section">
                                <h5>Order Items</h5>
                                <div className="order-items-list">
                                    {orderItems.map((item, index) => (
                                        <div key={index} className="order-detail-item">
                                            <div className="item-info">
                                                <div className="item-name">
                                                    <span className="quantity">{item.quantity}x</span> {item.item_name}
                                                </div>
                                                <div className="restaurant-name">
                                                    {item.restaurants?.name || 'Restaurant'}
                                                </div>
                                            </div>
                                            <div className="item-price">
                                                ${parseFloat(item.subtotal).toFixed(2)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="price-summary">
                                    <div className="price-row">
                                        <span>Subtotal</span>
                                        <span>${parseFloat(order.subtotal).toFixed(2)}</span>
                                    </div>
                                    <div className="price-row">
                                        <span>Tax (12%)</span>
                                        <span>${parseFloat(order.tax).toFixed(2)}</span>
                                    </div>
                                    <div className="price-row total">
                                        <span>Total</span>
                                        <span>${parseFloat(order.total).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </Col>

                        <Col md={6}>
                            <div className="detail-section">
                                <h5>Delivery Information</h5>
                                <div className="delivery-details">
                                    <div className="detail-row">
                                        <FaMapMarkerAlt className="detail-icon" />
                                        <div className="detail-text">
                                            <strong>Address:</strong><br />
                                            {order.delivery_address}<br />
                                            {order.delivery_city}, {order.delivery_province} {order.delivery_postal_code}
                                        </div>
                                    </div>

                                    <div className="detail-row">
                                        <FaPhone className="detail-icon" />
                                        <div className="detail-text">
                                            <strong>Phone:</strong><br />
                                            {order.contact_phone}
                                        </div>
                                    </div>

                                    <div className="detail-row">
                                        <FaEnvelope className="detail-icon" />
                                        <div className="detail-text">
                                            <strong>Email:</strong><br />
                                            {order.contact_email}
                                        </div>
                                    </div>

                                    <div className="detail-row">
                                        {getPaymentMethodIcon(order.payment_method)}
                                        <div className="detail-text">
                                            <strong>Payment Method:</strong><br />
                                            {order.payment_method === 'credit_card' ? 'Credit Card' : 'Cash on Delivery'}
                                        </div>
                                    </div>

                                    {order.special_instructions && (
                                        <div className="detail-row">
                                            <FaInfoCircle className="detail-icon" />
                                            <div className="detail-text">
                                                <strong>Special Instructions:</strong><br />
                                                {order.special_instructions}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <div className="confirmation-actions">
                <Button
                    variant="outline-primary"
                    className="me-3"
                    onClick={() => navigate('/restaurants')}
                >
                    Continue Shopping
                </Button>
                <Button
                    variant="primary"
                    onClick={() => navigate('/order-history')}
                >
                    View Order History
                </Button>
            </div>
        </Container>
    );
};

export default OrderConfirmationPage; 