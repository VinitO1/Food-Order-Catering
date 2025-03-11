import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Spinner, Alert, Table } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import supabase from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';

const CartPage = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        console.log("Auth state in CartPage:", { user });
    }, [user]);

    useEffect(() => {
        const loadCartItems = async () => {
            // Check if user exists and has an id property
            if (user) {
                console.log("User is authenticated:", user);
                await fetchCartItems();
            } else {
                console.log("No authenticated user found");
                setLoading(false);
            }
        };

        loadCartItems();
    }, [user]);

    const fetchCartItems = async () => {
        try {
            setLoading(true);
            console.log("Starting cart items fetch");

            if (!user || !user.id) {
                console.error("No authenticated user found");
                setLoading(false);
                return;
            }

            // Ensure user ID is a string
            const userIdStr = user.id.toString();
            console.log("Using user ID for cart fetch:", userIdStr);

            const { data, error } = await supabase
                .from('cart_items')
                .select(`
                    *,
                    restaurants:restaurant_id (
                        id,
                        name
                    )
                `)
                .eq('user_id', userIdStr);

            if (error) {
                console.error("Error fetching cart items:", error);
                throw new Error(`Error fetching cart items: ${error.message}`);
            }

            console.log("Cart items fetched successfully:", data);
            setCartItems(data || []);
        } catch (err) {
            console.error('Error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const removeFromCart = async (itemId) => {
        try {
            const { error } = await supabase
                .from('cart_items')
                .delete()
                .eq('id', itemId);

            if (error) {
                throw new Error(`Error removing item: ${error.message}`);
            }

            // Update local state
            setCartItems(cartItems.filter(item => item.id !== itemId));

            setMessage({
                type: 'success',
                text: 'Item removed from cart'
            });

            setTimeout(() => {
                setMessage(null);
            }, 3000);
        } catch (err) {
            console.error('Error:', err);
            setMessage({
                type: 'danger',
                text: `Error removing item: ${err.message}`
            });
        }
    };

    const updateQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) return;

        try {
            const { error } = await supabase
                .from('cart_items')
                .update({ quantity: newQuantity })
                .eq('id', itemId);

            if (error) {
                throw new Error(`Error updating quantity: ${error.message}`);
            }

            // Update local state
            setCartItems(cartItems.map(item =>
                item.id === itemId ? { ...item, quantity: newQuantity } : item
            ));
        } catch (err) {
            console.error('Error:', err);
            setMessage({
                type: 'danger',
                text: `Error updating quantity: ${err.message}`
            });
        }
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => {
            return total + (parseFloat(item.price) * item.quantity);
        }, 0).toFixed(2);
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

    if (!user || !user.id) {
        return (
            <Container className="my-4">
                <Alert variant="warning">
                    Please sign in to view your cart
                </Alert>
                <Link to="/login" className="btn btn-primary">
                    Sign In
                </Link>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="my-4">
                <Alert variant="danger">
                    {error}
                </Alert>
                <Link to="/restaurants" className="btn btn-primary">
                    Back to Restaurants
                </Link>
            </Container>
        );
    }

    return (
        <Container className="my-4">
            <h1 className="mb-4">Your Cart</h1>

            {message && (
                <Alert variant={message.type} className="mb-3">
                    {message.text}
                </Alert>
            )}

            {cartItems.length === 0 ? (
                <div>
                    <Alert variant="info">Your cart is empty</Alert>
                    <Link to="/restaurants" className="btn btn-primary">
                        Browse Restaurants
                    </Link>
                </div>
            ) : (
                <Card>
                    <Card.Body>
                        <Table responsive>
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Restaurant</th>
                                    <th>Price</th>
                                    <th>Quantity</th>
                                    <th>Subtotal</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cartItems.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.item_name}</td>
                                        <td>{item.restaurants?.name || 'Unknown Restaurant'}</td>
                                        <td>${parseFloat(item.price).toFixed(2)}</td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <Button
                                                    variant="outline-secondary"
                                                    size="sm"
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                >
                                                    -
                                                </Button>
                                                <span className="mx-2">{item.quantity}</span>
                                                <Button
                                                    variant="outline-secondary"
                                                    size="sm"
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                >
                                                    +
                                                </Button>
                                            </div>
                                        </td>
                                        <td>${(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
                                        <td>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => removeFromCart(item.id)}
                                            >
                                                Remove
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan="4" className="text-end fw-bold">Total:</td>
                                    <td className="fw-bold">${calculateTotal()}</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </Table>

                        <div className="d-flex justify-content-end mt-4">
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={() => {
                                    console.log('Navigating to checkout page...');
                                    navigate('/checkout');
                                }}
                                className="me-2"
                            >
                                Proceed to Checkout
                            </Button>
                    
                        </div>
                    </Card.Body>
                </Card>
            )}
        </Container>
    );
};

export default CartPage;