import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, Tabs, Tab, Badge, ListGroup, Image } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaShoppingCart, FaStar, FaRegStar } from 'react-icons/fa';
import supabase from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';

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

    // Use useMemo to prevent the object from being recreated on every render
    const RESTAURANT_MENU_TABLES = useMemo(() => ({
        '1': 'vijs_menu',
        '2': 'sula_indian_restaurant_menu',
        '3': 'agra_tandoori_restaurant_menu',
        '4': 'fishhook_menu',
        '5': 'spice_valley_indian_cuisine_menu',
        '6': 'gians_indian_cuisine_menu',
        '7': 'pabla_curry_house_menu',
        '8': 'shandhar_hut_indian_cuisine_menu',
        '9': 'indias_most_wanted_menu',
        '10': 'tandoori_bites_menu'
    }), []);

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
            console.log("Fetching cart for user ID:", userIdStr);

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
                console.error('Error fetching cart:', error);
                return;
            }

            console.log("Cart data fetched:", data);
            setCart(data || []);
        } catch (err) {
            console.error('Error fetching cart:', err);
        }
    };

    useEffect(() => {
        const fetchRestaurantData = async () => {
            try {
                setLoading(true);

                // Fetch restaurant details
                console.log(`Fetching restaurant with ID: ${id}`);
                const { data: restaurantData, error: restaurantError } = await supabase
                    .from('restaurants')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (restaurantError) {
                    throw new Error(`Error fetching restaurant: ${restaurantError.message}`);
                }

                if (!restaurantData) {
                    throw new Error('Restaurant not found');
                }

                setRestaurant(restaurantData);
                console.log('Restaurant data:', restaurantData);

                // Get the appropriate menu table name for this restaurant
                const menuTableName = RESTAURANT_MENU_TABLES[id];
                if (!menuTableName) {
                    console.warn(`No menu table mapping found for restaurant ID ${id}`);
                    setMenuItems([]);
                    return;
                }

                // Fetch menu items from the restaurant-specific table
                console.log(`Fetching menu items from table: ${menuTableName}`);
                const { data: menuData, error: menuError } = await supabase
                    .from(menuTableName)
                    .select('*')
                    .order('name', { ascending: true });

                if (menuError) {
                    console.error(`Error fetching menu items from ${menuTableName}:`, menuError);
                    // Try fallback to menu_items table with restaurant_id filter
                    console.log(`Trying fallback to menu_items table for restaurant ID ${id}`);
                    const { data: fallbackData, error: fallbackError } = await supabase
                        .from('menu_items')
                        .select('*')
                        .eq('restaurant_id', id)
                        .order('category', { ascending: true })
                        .order('name', { ascending: true });

                    if (fallbackError) {
                        throw new Error(`Error fetching menu items: ${fallbackError.message}`);
                    }

                    if (fallbackData && fallbackData.length > 0) {
                        console.log('Found menu items in fallback table:', fallbackData.length);
                        processMenuData(fallbackData);
                    } else {
                        console.log('No menu items found in fallback table');
                        setMenuItems([]);
                    }
                } else {
                    console.log('Menu items found:', menuData?.length || 0);
                    processMenuData(menuData || []);
                }
            } catch (err) {
                console.error('Error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        // Helper function to process menu data
        const processMenuData = (menuData) => {
            setMenuItems(menuData);

            if (menuData.length > 0) {
                // Determine categories - check if category field exists
                let categories = [];
                if (menuData[0].category) {
                    // If category field exists, use it
                    categories = [...new Set(menuData.map(item => item.category))];
                } else {
                    // Otherwise, categorize based on item names or descriptions
                    categories = categorizeMenuItems(menuData);
                }

                setMenuCategories(categories);
                console.log('Menu categories:', categories);

                // Set initial active category
                if (categories.length > 0) {
                    setActiveCategory(categories[0]);
                }

                // Group menu items by category
                const itemsByCategory = {};
                categories.forEach(category => {
                    if (menuData[0].category) {
                        itemsByCategory[category] = menuData.filter(item => item.category === category);
                    } else {
                        itemsByCategory[category] = menuData.filter(item =>
                            determineCategory(item.name, item.description || '') === category
                        );
                    }
                });
                setMenuItemsByCategory(itemsByCategory);
                console.log('Menu items by category:', itemsByCategory);
            }
        };

        // Helper function to categorize menu items if no category field exists
        const categorizeMenuItems = (menuData) => {
            const categorizedItems = menuData.map(item => ({
                ...item,
                determinedCategory: determineCategory(item.name, item.description || '')
            }));

            return [...new Set(categorizedItems.map(item => item.determinedCategory))];
        };

        // Helper function to determine category based on item name/description
        const determineCategory = (name, description) => {
            const nameLower = name.toLowerCase();
            const descLower = description.toLowerCase();

            // Check for starters/appetizers
            if (
                nameLower.includes('pakora') ||
                nameLower.includes('samosa') ||
                nameLower.includes('tikki') ||
                nameLower.includes('chaat') ||
                nameLower.includes('kebab') ||
                nameLower.includes('bhaji') ||
                nameLower.includes('appetizer') ||
                nameLower.includes('starter') ||
                descLower.includes('appetizer') ||
                descLower.includes('starter')
            ) {
                return 'Starters';
            }

            // Check for desserts
            if (
                nameLower.includes('gulab') ||
                nameLower.includes('kheer') ||
                nameLower.includes('kulfi') ||
                nameLower.includes('halwa') ||
                nameLower.includes('rasmalai') ||
                nameLower.includes('jalebi') ||
                nameLower.includes('dessert') ||
                descLower.includes('sweet') ||
                descLower.includes('dessert')
            ) {
                return 'Dessert';
            }

            // Default to main course
            return 'Main Course';
        };

        if (id) {
            fetchRestaurantData();
        }
    }, [id, RESTAURANT_MENU_TABLES]);

    useEffect(() => {
        // Check if there's an activeCategory in sessionStorage
        const savedCategory = sessionStorage.getItem('activeCategory');
        if (savedCategory) {
            // Find the matching category in menuCategories
            const matchingCategory = menuCategories.find(
                category => category.toLowerCase() === savedCategory.toLowerCase()
            );
            
            if (matchingCategory) {
                setActiveCategory(matchingCategory);
            }
            
            // Clear the sessionStorage after using it
            sessionStorage.removeItem('activeCategory');
        }
    }, [menuCategories]);

    const addToCart = async (item) => {
        try {
            // Check if user is logged in
            if (!user) {
                setCartMessage({
                    type: 'warning',
                    text: 'Please sign in to add items to your cart'
                });
                return;
            }

            console.log("Adding to cart for user:", user);

            // Ensure user ID is a string
            const userIdStr = user.id.toString();

            // Prepare cart item data
            const cartItem = {
                user_id: userIdStr,
                menu_item_id: item.id ? item.id.toString() : `${restaurant.id}_${item.name}`,
                restaurant_id: parseInt(restaurant.id),
                item_name: item.name,
                price: parseFloat(item.price || 0),
                quantity: 1
            };

            console.log("Cart item to insert:", cartItem);

            // Add to cart_items table
            const { data, error } = await supabase
                .from('cart_items')
                .insert(cartItem)
                .select();

            if (error) {
                console.error('Error adding to cart:', error);
                setCartMessage({
                    type: 'danger',
                    text: `Failed to add ${item.name} to cart: ${error.message}`
                });
                return;
            }

            console.log("Successfully added to cart:", data);

            // Update local cart state
            setCart([...cart, { ...data[0], restaurants: { name: restaurant.name } }]);

            setCartMessage({
                type: 'success',
                text: `Added ${item.name} to cart from ${restaurant.name}`
            });

            // Clear message after 3 seconds
            setTimeout(() => {
                setCartMessage(null);
            }, 3000);
        } catch (err) {
            console.error('Error adding to cart:', err);
            setCartMessage({
                type: 'danger',
                text: `An error occurred: ${err.message}`
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
                            {restaurant.image_url ? (
                                <Image
                                    src={restaurant.image_url}
                                    alt={restaurant.name}
                                    fluid
                                    className="restaurant-image"
                                />
                            ) : (
                                <div className="placeholder-image">No image available</div>
                            )}
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
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Menu Tabs */}
            <h2 className="mb-4">Menu</h2>

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
                                            <Badge bg="primary" pill>{menuItemsByCategory[category].length}</Badge>
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
                                                        <h5>{item.name}</h5>
                                                        <p className="text-muted mb-1">{item.description}</p>
                                                        <Badge bg="primary" className="mt-1">${item.price.toFixed(2)}</Badge>
                                                    </Col>
                                                    <Col md={4} className="d-flex align-items-center justify-content-end">
                                                        <Button
                                                            variant="outline-success"
                                                            size="sm"
                                                            onClick={() => addToCart(item)}
                                                        >
                                                            <FaShoppingCart className="me-2" />
                                                            Add to Cart
                                                        </Button>
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

            {cartMessage && (
                <Alert variant={cartMessage.type} className="mb-3">
                    {cartMessage.text}
                </Alert>
            )}
        </Container>
    );
};

export default RestaurantDetailPage; 