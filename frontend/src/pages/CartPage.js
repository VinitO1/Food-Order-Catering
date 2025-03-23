import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Table, Image, Accordion } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserCart, updateCartItemQuantity, removeFromCart } from '../utils/supabase';
import { FaTrash, FaMinus, FaPlus, FaShoppingCart, FaBug } from 'react-icons/fa';

const CartPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [updatingItemId, setUpdatingItemId] = useState(null);
    const [groupedItems, setGroupedItems] = useState({});
    const [debugData, setDebugData] = useState('');
    const [showDebug, setShowDebug] = useState(false);

    useEffect(() => {
        console.log('CartPage - Current user:', user);
        fetchCartItems();
    }, [user]);

    const fetchCartItems = async () => {
        try {
            setLoading(true);

            if (!user) {
                console.log('No authenticated user, redirecting to login');
                setError('Please log in to view your cart');
                setTimeout(() => navigate('/login'), 2000);
                return;
            }

            console.log('Fetching cart items for user:', user.id);
            const { success, data, error } = await getUserCart(user.id);

            if (!success || error) {
                throw new Error(error || 'Failed to fetch cart items');
            }

            console.log('Cart items fetched:', data);
            setDebugData(JSON.stringify(data, null, 2));
            setCartItems(data);

            // Group items by restaurant
            const grouped = {};
            data.forEach(item => {
                const restaurantId = item.restaurant_id;
                if (!grouped[restaurantId]) {
                    grouped[restaurantId] = {
                        restaurant: item.restaurants || {
                            id: item.restaurant_id,
                            name: `Restaurant ${item.restaurant_id}`,
                            image_url: null
                        },
                        items: []
                    };
                }
                grouped[restaurantId].items.push(item);
            });

            console.log('Grouped cart items:', grouped);
            setGroupedItems(grouped);
            setError(null);
        } catch (err) {
            console.error('Error fetching cart:', err);
            setError(err.message);
            setDebugData(JSON.stringify(err, null, 2));
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateQuantity = async (cartItemId, currentQuantity, increment) => {
        try {
            setUpdatingItemId(cartItemId);
            const newQuantity = increment ? currentQuantity + 1 : Math.max(1, currentQuantity - 1);

            if (newQuantity === currentQuantity) {
                setUpdatingItemId(null);
                return;
            }

            console.log(`Updating cart item ${cartItemId} to quantity ${newQuantity}`);
            const { success, data, error } = await updateCartItemQuantity(cartItemId, newQuantity);

            if (!success || error) {
                throw new Error(error || 'Failed to update item quantity');
            }

            // Update local state for item quantity
            setCartItems(currentItems =>
                currentItems.map(item =>
                    item.id === cartItemId ? { ...item, quantity: newQuantity } : item
                )
            );

            // Update grouped items as well
            setGroupedItems(current => {
                const updated = { ...current };
                Object.keys(updated).forEach(restaurantId => {
                    updated[restaurantId].items = updated[restaurantId].items.map(item =>
                        item.id === cartItemId ? { ...item, quantity: newQuantity } : item
                    );
                });
                return updated;
            });

            setMessage({ type: 'success', text: 'Quantity updated' });
        } catch (err) {
            console.error('Error updating quantity:', err);
            setMessage({ type: 'danger', text: err.message });
        } finally {
            setUpdatingItemId(null);
            // Clear message after 3 seconds
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const handleRemoveItem = async (cartItemId) => {
        try {
            setUpdatingItemId(cartItemId);
            console.log(`Removing item ${cartItemId} from cart`);

            const { success, error } = await removeFromCart(cartItemId);

            if (!success || error) {
                throw new Error(error || 'Failed to remove item from cart');
            }

            // Update UI by removing the item
            const updatedItems = cartItems.filter(item => item.id !== cartItemId);
            setCartItems(updatedItems);

            // Update grouped items
            setGroupedItems(current => {
                const updated = { ...current };
                Object.keys(updated).forEach(restaurantId => {
                    updated[restaurantId].items = updated[restaurantId].items.filter(item => item.id !== cartItemId);
                    // Remove restaurant entry if no items left
                    if (updated[restaurantId].items.length === 0) {
                        delete updated[restaurantId];
                    }
                });
                return updated;
            });

            setMessage({ type: 'success', text: 'Item removed from cart' });
        } catch (err) {
            console.error('Error removing item:', err);
            setMessage({ type: 'danger', text: err.message });
        } finally {
            setUpdatingItemId(null);
            // Clear message after 3 seconds
            setTimeout(() => setMessage(null), 3000);
        }
    };

    // Calculate total price using price or item_price depending on what's available
    const calculateTotalPrice = (items) => {
        return items.reduce((total, item) => {
            const price = parseFloat(item.price || item.item_price || 0);
            return total + (price * item.quantity);
        }, 0).toFixed(2);
    };

    // Calculate tax (12% GST + PST)
    const calculateTax = (subtotal) => {
        return (parseFloat(subtotal) * 0.12).toFixed(2);
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

    if (error) {
        return (
            <Container className="py-5">
                <Alert variant="danger">
                    {error}
                </Alert>
                <Link to="/" className="btn btn-primary mt-3">
                    Return to Home
                </Link>

                <Button
                    variant="link"
                    onClick={() => setShowDebug(!showDebug)}
                    className="mt-3 text-decoration-none"
                >
                    <FaBug className="me-1" />
                    {showDebug ? 'Hide Debug Info' : 'Show Debug Info'}
                </Button>

                {showDebug && (
                    <div className="mt-3 border p-3 bg-light">
                        <h5>Debug Information:</h5>
                        <pre className="small" style={{ whiteSpace: 'pre-wrap' }}>
                            {debugData}
                        </pre>
                    </div>
                )}
            </Container>
        );
    }

    if (cartItems.length === 0) {
        return (
            <Container className="py-5">
                <Card className="text-center p-5 shadow">
                    <Card.Body>
                        <FaShoppingCart size={50} className="text-muted mb-3" />
                        <h2>Your cart is empty</h2>
                        <p className="text-muted">Explore our restaurants to add delicious items to your cart</p>
                        <Button variant="primary" as={Link} to="/restaurants">
                            Browse Restaurants
                        </Button>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <h1 className="mb-4">Your Cart</h1>

            {message && (
                <Alert variant={message.type} className="mb-4">
                    {message.text}
                </Alert>
            )}

            {Object.keys(groupedItems).map(restaurantId => (
                <Card key={restaurantId} className="mb-4 shadow-sm">
                    <Card.Header className="bg-light">
                        <div className="d-flex align-items-center">
                            {groupedItems[restaurantId].restaurant.image_url && (
                                <Image
                                    src={groupedItems[restaurantId].restaurant.image_url}
                                    alt={groupedItems[restaurantId].restaurant.name}
                                    width={40}
                                    height={40}
                                    className="me-3 rounded"
                                />
                            )}
                            <h5 className="mb-0">
                                <Link to={`/restaurants/${restaurantId}`}>
                                    {groupedItems[restaurantId].restaurant.name}
                                </Link>
                            </h5>
                        </div>
                    </Card.Header>
                    <Card.Body>
                        <Table responsive borderless>
                            <thead>
                                <tr>
                                    <th style={{ width: '40%' }}>Item</th>
                                    <th style={{ width: '20%' }}>Price</th>
                                    <th style={{ width: '25%' }}>Quantity</th>
                                    <th style={{ width: '15%' }}>Total</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {groupedItems[restaurantId].items.map(item => {
                                    // Use price or item_price depending on what's available
                                    const itemPrice = parseFloat(item.price || item.item_price || 0);

                                    return (
                                        <tr key={item.id}>
                                            <td>
                                                <div className="d-flex flex-column">
                                                    <strong>{item.item_name}</strong>
                                                </div>
                                            </td>
                                            <td>${itemPrice.toFixed(2)}</td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <Button
                                                        variant="outline-secondary"
                                                        size="sm"
                                                        className="p-1"
                                                        onClick={() => handleUpdateQuantity(item.id, item.quantity, false)}
                                                        disabled={updatingItemId === item.id || item.quantity <= 1}
                                                    >
                                                        <FaMinus />
                                                    </Button>
                                                    <span className="mx-3">{item.quantity}</span>
                                                    <Button
                                                        variant="outline-secondary"
                                                        size="sm"
                                                        className="p-1"
                                                        onClick={() => handleUpdateQuantity(item.id, item.quantity, true)}
                                                        disabled={updatingItemId === item.id}
                                                    >
                                                        <FaPlus />
                                                    </Button>
                                                    {updatingItemId === item.id && (
                                                        <Spinner animation="border" size="sm" className="ms-2" />
                                                    )}
                                                </div>
                                            </td>
                                            <td>${(itemPrice * item.quantity).toFixed(2)}</td>
                                            <td>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleRemoveItem(item.id)}
                                                    disabled={updatingItemId === item.id}
                                                >
                                                    <FaTrash />
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan="3" className="text-end"><strong>Subtotal:</strong></td>
                                    <td colSpan="2"><strong>${calculateTotalPrice(groupedItems[restaurantId].items)}</strong></td>
                                </tr>
                            </tfoot>
                        </Table>
                    </Card.Body>
                </Card>
            ))}

            <Card className="shadow-sm mb-4">
                <Card.Body>
                    <Row>
                        <Col md={6}>
                            <Link to="/restaurants" className="btn btn-outline-secondary">
                                Continue Shopping
                            </Link>
                            <Button
                                variant="link"
                                onClick={() => setShowDebug(!showDebug)}
                                className="ms-2 text-decoration-none"
                            >
                                <FaBug className="me-1" />
                                {showDebug ? 'Hide Debug Info' : 'Show Debug Info'}
                            </Button>
                        </Col>
                        <Col md={6} className="text-end">
                            <div className="mb-3">
                                <div className="d-flex justify-content-end mb-2">
                                    <strong className="me-3">Subtotal:</strong>
                                    <span>${calculateTotalPrice(cartItems)}</span>
                                </div>
                                <div className="d-flex justify-content-end mb-2">
                                    <strong className="me-3">Estimated Tax (12%):</strong>
                                    <span>${calculateTax(calculateTotalPrice(cartItems))}</span>
                                </div>
                                <div className="d-flex justify-content-end">
                                    <strong className="me-3">Estimated Total:</strong>
                                    <span className="fs-4">${(parseFloat(calculateTotalPrice(cartItems)) + parseFloat(calculateTax(calculateTotalPrice(cartItems)))).toFixed(2)}</span>
                                </div>
                            </div>
                            <Button
                                variant="success"
                                size="lg"
                                onClick={() => navigate('/checkout')}
                                disabled={cartItems.length === 0}
                            >
                                Proceed to Checkout
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {showDebug && (
                <Accordion defaultActiveKey="0" className="mb-4">
                    <Accordion.Item eventKey="0">
                        <Accordion.Header>Debug Data</Accordion.Header>
                        <Accordion.Body>
                            <pre className="small" style={{ whiteSpace: 'pre-wrap' }}>
                                {debugData}
                            </pre>
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>
            )}
        </Container>
    );
};

export default CartPage;