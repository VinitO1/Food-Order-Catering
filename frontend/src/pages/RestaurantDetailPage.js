import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, Tabs, Tab, Badge, ListGroup, Image } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaShoppingCart, FaStar, FaRegStar } from 'react-icons/fa';
import supabase, { fetchRestaurant, fetchMenuItems, addToCart, RESTAURANT_MENU_TABLES } from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';

// Default images for restaurants based on their ID
const DEFAULT_IMAGES = {
    1: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070',
    2: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070',
    3: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=2074',
    4: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=2070',
    5: 'https://images.unsplash.com/photo-1585937421612-70a008356c36?q=80&w=2036',
    6: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=2070',
    7: 'https://images.unsplash.com/photo-1690303587192-e4a51ff1c1e5?q=80&w=2070',
    8: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=2074',
    9: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=2025',
    10: 'https://images.unsplash.com/photo-1615398562477-8572aa0a4c48?q=80&w=2069',
};

// Default cuisine type (since it's missing from the database)
const DEFAULT_CUISINE = 'Indian';

const RestaurantDetailPage = () => {
    const { id } = useParams();
    const [restaurant, setRestaurant] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [menuCategories, setMenuCategories] = useState([]);
    const [menuItemsByCategory, setMenuItemsByCategory] = useState({});
    const [activeCategory, setActiveCategory] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cart, setCart] = useState([]);
    const [cartMessage, setCartMessage] = useState(null);

    // Use the useAuth hook
    const { user } = useAuth();

    // Fetch user's cart when user changes
    useEffect(() => {
        if (user) {
            fetchUserCart(user.id);
        }
    }, [user]);

    const fetchUserCart = async (userId) => {
        try {
            // Ensure user ID is a string
            const userIdStr = userId.toString();

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
                return;
            }

            setCart(data || []);
        } catch (err) {
            // Silently handle error
        }
    };

    useEffect(() => {
        const fetchRestaurantData = async () => {
            try {
                setLoading(true);
                console.log('Fetching restaurant data for ID:', id);

                // Fetch restaurant details
                const { data: restaurantData, error: restaurantError } = await fetchRestaurant(id);

                if (restaurantError) {
                    console.error('Error fetching restaurant:', restaurantError);
                    throw new Error(`Error fetching restaurant: ${restaurantError.message}`);
                }

                if (!restaurantData) {
                    throw new Error('Restaurant not found');
                }

                // Process restaurant data with default values for missing fields
                const processedRestaurant = {
                    ...restaurantData,
                    // Add default image if missing
                    image_url: DEFAULT_IMAGES[restaurantData.id] || 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=2074',
                    // Add default cuisine type if missing
                    cuisine_type: restaurantData.cuisine_type || DEFAULT_CUISINE,
                    // Convert province to shorter form if it's British Columbia
                    province: restaurantData.province === 'British Columbia' ? 'BC' : restaurantData.province,
                    // Ensure catering_available is a boolean
                    catering_available: restaurantData.catering_available === 'true' || restaurantData.catering_available === true
                };

                console.log('Restaurant data processed:', processedRestaurant);
                setRestaurant(processedRestaurant);

                // Fetch menu items
                const { menuItems, categories, itemsByCategory, error: menuError } = await fetchMenuItems(id);

                if (menuError) {
                    console.error('Error fetching menu items:', menuError);
                    throw new Error(`Error fetching menu items: ${menuError.message}`);
                }

                console.log('Menu items fetched:', menuItems.length, 'items in', categories.length, 'categories');

                setMenuItems(menuItems);
                setMenuCategories(categories);
                setMenuItemsByCategory(itemsByCategory);

                // Set default active category
                if (categories.length > 0) {
                    const preferredCategories = ['Starters', 'Main Course', 'Appetizers'];
                    const matchingCategory = preferredCategories.find(cat => categories.includes(cat)) || categories[0];
                    setActiveCategory(matchingCategory);
                }

            } catch (err) {
                console.error('Error fetching restaurant data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchRestaurantData();
        }
    }, [id]);

    // Check if there's a selected category in sessionStorage
    useEffect(() => {
        if (menuCategories.length > 0) {
            const savedCategory = sessionStorage.getItem('activeCategory');
            if (savedCategory && menuCategories.includes(savedCategory)) {
                setActiveCategory(savedCategory);
            } else {
                // Find "Starters" or "Main Course" or fallback to first category
                const preferredCategories = ['Starters', 'Main Course', 'Appetizers'];
                const matchingCategory = preferredCategories.find(cat => menuCategories.includes(cat)) || menuCategories[0];
                setActiveCategory(matchingCategory);
            }

            // Clear the sessionStorage after using it
            sessionStorage.removeItem('activeCategory');
        }
    }, [menuCategories]);

    const handleAddToCart = async (item) => {
        try {
            // Check if user is logged in
            if (!user) {
                setCartMessage({
                    type: 'warning',
                    text: 'Please sign in to add items to your cart'
                });
                return;
            }

            // Get current session before adding to cart
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                setCartMessage({
                    type: 'warning',
                    text: 'Your session has expired. Please sign in again to add items to your cart.'
                });
                return;
            }

            // Add to cart using our updated utility function
            const { success, data, error, message } = await addToCart(item, user.id, restaurant.id);

            if (!success || error) {
                throw new Error(error);
            }

            // Update local cart state
            const newCartItem = {
                ...data,
                restaurants: { name: restaurant.name }
            };

            // Check if item is already in cart (to avoid duplicates in UI)
            const itemExists = cart.some(cartItem => cartItem.id === data.id);
            if (!itemExists) {
                setCart([...cart, newCartItem]);
            } else {
                // Update existing item
                setCart(cart.map(cartItem =>
                    cartItem.id === data.id
                        ? { ...cartItem, quantity: cartItem.quantity + 1 }
                        : cartItem
                ));
            }

            setCartMessage({
                type: 'success',
                text: message || `Added ${item.name} to cart from ${restaurant.name}`
            });

            // Clear message after 3 seconds
            setTimeout(() => {
                setCartMessage(null);
            }, 3000);
        } catch (err) {
            setCartMessage({
                type: 'danger',
                text: `Error adding to cart: ${err.message}`
            });
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

    if (!restaurant) {
        return (
            <Container className="my-4">
                <Alert variant="warning">
                    Restaurant not found
                </Alert>
                <Link to="/restaurants" className="btn btn-primary">
                    Back to Restaurants
                </Link>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <Link to="/restaurants" className="btn btn-outline-secondary mb-3">
                &larr; Back to Restaurants
            </Link>

            {/* Restaurant Header */}
            <Card className="mb-4 shadow-sm">
                <Card.Body>
                    <Row>
                        <Col md={4}>
                            <Image
                                src={restaurant.image_url}
                                alt={restaurant.name}
                                fluid
                                className="restaurant-image rounded"
                                style={{ maxHeight: '250px', objectFit: 'cover' }}
                            />
                        </Col>
                        <Col md={8}>
                            <div className="d-flex align-items-center mb-2">
                                <h1 className="mb-0">{restaurant.name}</h1>
                            </div>
                            <p className="text-muted mb-2">
                                <FaMapMarkerAlt className="text-danger me-2" />
                                {restaurant.city}, {restaurant.province}
                            </p>
                            <div className="d-flex mb-3">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span key={star} className="text-warning">
                                        {star <= 4 ? <FaStar /> : <FaRegStar />}
                                    </span>
                                ))}
                                <span className="ms-2 text-muted">(24 reviews)</span>
                            </div>

                            {/* Display cart message */}
                            {cartMessage && (
                                <Alert variant={cartMessage.type} className="mt-3">
                                    {cartMessage.text}
                                </Alert>
                            )}
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Menu Tabs */}
            <h2 className="mb-4">Menu</h2>

            {menuCategories.length === 0 ? (
                <Alert variant="info">No menu items available for this restaurant</Alert>
            ) : (
                <Tabs
                    activeKey={activeCategory}
                    onSelect={(k) => setActiveCategory(k)}
                    className="mb-3"
                >
                    {menuCategories.map((category) => (
                        <Tab key={category} eventKey={category} title={category}>
                            <Row>
                                <Col md={3} className="mb-4">
                                    <ListGroup>
                                        {menuCategories.map((category) => (
                                            <ListGroup.Item
                                                key={category}
                                                action
                                                active={activeCategory === category}
                                                onClick={() => setActiveCategory(category)}
                                                className="d-flex justify-content-between align-items-center"
                                            >
                                                {category}
                                                <Badge bg="primary" pill>{menuItemsByCategory[category]?.length || 0}</Badge>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                </Col>
                                <Col md={9}>
                                    <Card className="shadow-sm">
                                        <Card.Header>
                                            <h3 className="mb-0">{category}</h3>
                                        </Card.Header>
                                        <ListGroup variant="flush">
                                            {menuItemsByCategory[category]?.map((item) => (
                                                <ListGroup.Item key={item.id} className="py-3">
                                                    <Row>
                                                        <Col md={8}>
                                                            <div className="d-flex flex-column">
                                                                <h5 className="mb-1">{item.name}</h5>
                                                                <p className="text-muted mb-2">{item.description}</p>
                                                                <h6 className="text-primary">${parseFloat(item.price).toFixed(2)}</h6>
                                                            </div>
                                                        </Col>
                                                        <Col md={4} className="d-flex align-items-center justify-content-end">
                                                            <button
                                                                onClick={() => handleAddToCart(item)}
                                                                className="btn btn-outline-primary"
                                                            >
                                                                Add to Cart
                                                            </button>
                                                        </Col>
                                                    </Row>
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    </Card>
                                </Col>
                            </Row>
                        </Tab>
                    ))}
                </Tabs>
            )}
        </Container>
    );
};

export default RestaurantDetailPage; 