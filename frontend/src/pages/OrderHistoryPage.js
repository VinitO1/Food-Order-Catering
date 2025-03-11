import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Alert, Accordion, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaShoppingBag, FaCalendarAlt, FaMapMarkerAlt, FaPhone, FaEnvelope, FaCreditCard, FaMoneyBill, FaInfoCircle, FaSync } from 'react-icons/fa';
import supabase from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';
import '../styles/OrderHistory.css';

const OrderHistoryPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [orders, setOrders] = useState([]);
    const [orderItems, setOrderItems] = useState({});
    const [autoRefresh, setAutoRefresh] = useState(false);

    useEffect(() => {
        if (user) {
            fetchOrders();
        } else {
            setLoading(false);
        }
    }, [user]);

    // Set up auto-refresh timer
    useEffect(() => {
        if (!autoRefresh) return;

        const timer = setInterval(() => {
            refreshOrders();
        }, 10000); // Refresh every 10 seconds

        return () => clearInterval(timer);
    }, [autoRefresh, user]);

    const fetchOrders = async () => {
        try {
            setLoading(true);

            const { data, error } = await supabase
                .from('cx_orders')
                .select('*')
                .eq('user_id', user.id.toString())
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }

            setOrders(data || []);

            // Fetch order items for each order
            if (data && data.length > 0) {
                await fetchOrderItems(data.map(order => order.id));
            }

        } catch (err) {
            console.error('Error fetching orders:', err);
            setError('Failed to load your order history. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const refreshOrders = async () => {
        if (!user) return;

        try {
            setRefreshing(true);

            const { data, error } = await supabase
                .from('cx_orders')
                .select('*')
                .eq('user_id', user.id.toString())
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }

            setOrders(data || []);

            // Fetch order items for each order
            if (data && data.length > 0) {
                await fetchOrderItems(data.map(order => order.id));
            }

        } catch (err) {
            console.error('Error refreshing orders:', err);
            // Don't set error state to avoid disrupting the UI during refresh
        } finally {
            setRefreshing(false);
        }
    };

    const fetchOrderItems = async (orderIds) => {
        try {
            const { data, error } = await supabase
                .from('cx_order_items')
                .select(`
                    *,
                    restaurants:restaurant_id (
                        id,
                        name
                    )
                `)
                .in('order_id', orderIds);

            if (error) {
                throw error;
            }

            // Group items by order_id
            const itemsByOrder = {};
            data.forEach(item => {
                if (!itemsByOrder[item.order_id]) {
                    itemsByOrder[item.order_id] = [];
                }
                itemsByOrder[item.order_id].push(item);
            });

            setOrderItems(itemsByOrder);
        } catch (err) {
            console.error('Error fetching order items:', err);
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
                    Please <Button variant="link" className="p-0" onClick={() => navigate('/login')}>sign in</Button> to view your order history.
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="my-4 order-history-container">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="mb-0">Order History</h1>
                <div className="d-flex align-items-center">
                    <Button
                        variant="outline-primary"
                        className="me-3"
                        onClick={refreshOrders}
                        disabled={refreshing}
                    >
                        {refreshing ? (
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                            />
                        ) : (
                            <FaSync />
                        )}
                        <span className="ms-2">Refresh</span>
                    </Button>
                    <div className="form-check form-switch">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="autoRefreshSwitch"
                            checked={autoRefresh}
                            onChange={() => setAutoRefresh(!autoRefresh)}
                        />
                        <label className="form-check-label" htmlFor="autoRefreshSwitch">
                            Auto-refresh
                        </label>
                    </div>
                </div>
            </div>

            {error && (
                <Alert variant="danger" className="mb-4">
                    {error}
                </Alert>
            )}

            {loading ? (
                <div className="d-flex justify-content-center my-5">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            ) : orders.length === 0 ? (
                <Alert variant="info">
                    You haven't placed any orders yet. <Button variant="link" className="p-0" onClick={() => navigate('/restaurants')}>Browse restaurants</Button> to place an order.
                </Alert>
            ) : (
                <Row>
                    <Col lg={12}>
                        <Accordion defaultActiveKey="0" className="order-accordion">
                            {orders.map((order, index) => (
                                <Accordion.Item eventKey={index.toString()} key={order.id} className="order-item">
                                    <Accordion.Header>
                                        <div className="order-header">
                                            <div className="order-info">
                                                <div className="order-number">
                                                    <FaShoppingBag className="order-icon" />
                                                    Order #{order.order_number}
                                                </div>
                                                <div className="order-date">
                                                    <FaCalendarAlt className="order-icon" />
                                                    {formatDate(order.created_at)}
                                                </div>
                                            </div>
                                            <div className="order-status-price">
                                                <div className="order-status">
                                                    {getStatusBadge(order.status)}
                                                </div>
                                                <div className="order-total">
                                                    ${parseFloat(order.total).toFixed(2)}
                                                </div>
                                            </div>
                                        </div>
                                    </Accordion.Header>
                                    <Accordion.Body>
                                        <div className="order-details">
                                            <Row>
                                                <Col md={6}>
                                                    <div className="detail-section">
                                                        <h5>Order Items</h5>
                                                        <div className="order-items-list">
                                                            {orderItems[order.id]?.map((item, itemIndex) => (
                                                                <div key={itemIndex} className="order-detail-item">
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

                                            <div className="order-actions mt-3">
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    onClick={() => navigate(`/order-confirmation/${order.id}`)}
                                                >
                                                    View Details
                                                </Button>

                                                {order.status === 'pending' && (
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        className="ms-2"
                                                        onClick={async () => {
                                                            if (window.confirm('Are you sure you want to cancel this order?')) {
                                                                try {
                                                                    const { error } = await supabase
                                                                        .from('cx_orders')
                                                                        .update({ status: 'cancelled' })
                                                                        .eq('id', order.id)
                                                                        .eq('user_id', user.id.toString());

                                                                    if (error) throw error;

                                                                    // Refresh orders
                                                                    fetchOrders();
                                                                    alert('Order cancelled successfully');
                                                                } catch (err) {
                                                                    console.error('Error cancelling order:', err);
                                                                    alert('Failed to cancel order. Please try again.');
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        Cancel Order
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </Accordion.Body>
                                </Accordion.Item>
                            ))}
                        </Accordion>
                    </Col>
                </Row>
            )}
        </Container>
    );
};

export default OrderHistoryPage; 