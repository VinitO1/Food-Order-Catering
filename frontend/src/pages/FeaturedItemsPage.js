import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Nav } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaStar, FaUtensils, FaRandom } from 'react-icons/fa';
import supabase from '../utils/supabase';
import '../styles/FeaturedItems.css';

const FeaturedItemsPage = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState('starters');
    const [featuredItems, setFeaturedItems] = useState({
        starters: [],
        mains: [],
        desserts: []
    });
    const [restaurants, setRestaurants] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchRestaurants();
        fetchFeaturedItems();
    }, []);

    const fetchRestaurants = async () => {
        try {
            const { data, error } = await supabase
                .from('restaurants')
                .select('*');

            if (error) throw error;
            setRestaurants(data || []);
        } catch (err) {
            console.error('Error fetching restaurants:', err);
            setError('Failed to load restaurants');
        }
    };

    const fetchFeaturedItems = async () => {
        try {
            setLoading(true);

            // Get all menu tables
            const menuTables = [
                'vijs_menu',
                'sula_indian_restaurant_menu',
                'agra_tandoori_restaurant_menu',
                'fishhook_menu',
                'spice_valley_indian_cuisine_menu',
                'gians_indian_cuisine_menu',
                'pabla_curry_house_menu',
                'shandhar_hut_indian_cuisine_menu',
                'indias_most_wanted_menu',
                'tandoori_bites_menu'
            ];

            const starters = [];
            const mains = [];
            const desserts = [];

            // Fetch items from each menu table
            for (const table of menuTables) {
                const { data, error } = await supabase
                    .from(table)
                    .select('*');

                if (error) {
                    console.error(`Error fetching from ${table}:`, error);
                    continue;
                }

                if (!data || data.length === 0) continue;

                // Categorize items
                data.forEach(item => {
                    // If item has a category field, use it
                    if (item.category) {
                        const category = item.category.toLowerCase();
                        if (category.includes('starter') || category.includes('appetizer')) {
                            starters.push({ ...item, restaurant_table: table });
                        } else if (category.includes('dessert')) {
                            desserts.push({ ...item, restaurant_table: table });
                        } else {
                            mains.push({ ...item, restaurant_table: table });
                        }
                    } else {
                        // Otherwise, categorize based on name/description
                        const name = item.name.toLowerCase();
                        const description = (item.description || '').toLowerCase();

                        if (
                            name.includes('pakora') ||
                            name.includes('samosa') ||
                            name.includes('tikki') ||
                            name.includes('chaat') ||
                            name.includes('kebab') ||
                            name.includes('bhaji') ||
                            description.includes('appetizer') ||
                            description.includes('starter')
                        ) {
                            starters.push({ ...item, restaurant_table: table });
                        } else if (
                            name.includes('gulab') ||
                            name.includes('kheer') ||
                            name.includes('kulfi') ||
                            name.includes('halwa') ||
                            name.includes('rasmalai') ||
                            name.includes('jalebi') ||
                            name.includes('dessert') ||
                            description.includes('sweet') ||
                            description.includes('dessert')
                        ) {
                            desserts.push({ ...item, restaurant_table: table });
                        } else {
                            mains.push({ ...item, restaurant_table: table });
                        }
                    }
                });
            }

            // Shuffle and limit to 6 items per category
            setFeaturedItems({
                starters: shuffleArray(starters).slice(0, 6),
                mains: shuffleArray(mains).slice(0, 6),
                desserts: shuffleArray(desserts).slice(0, 6)
            });

        } catch (err) {
            console.error('Error fetching featured items:', err);
            setError('Failed to load featured items');
        } finally {
            setLoading(false);
        }
    };

    // Helper function to shuffle array
    const shuffleArray = (array) => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    };

    // Get random restaurant ID
    const getRandomRestaurant = () => {
        if (restaurants.length === 0) return 1;
        const randomIndex = Math.floor(Math.random() * restaurants.length);
        return restaurants[randomIndex].id;
    };

    // Get restaurant name from table name
    const getRestaurantName = (tableId) => {
        const tableToRestaurantMap = {
            'vijs_menu': 'Vij\'s',
            'sula_indian_restaurant_menu': 'Sula Indian Restaurant',
            'agra_tandoori_restaurant_menu': 'Agra Tandoori Restaurant',
            'fishhook_menu': 'Fishhook',
            'spice_valley_indian_cuisine_menu': 'Spice Valley Indian Cuisine',
            'gians_indian_cuisine_menu': 'Gian\'s Indian Cuisine',
            'pabla_curry_house_menu': 'Pabla Curry House',
            'shandhar_hut_indian_cuisine_menu': 'Shandhar Hut Indian Cuisine',
            'indias_most_wanted_menu': 'India\'s Most Wanted',
            'tandoori_bites_menu': 'Tandoori Bites'
        };

        return tableToRestaurantMap[tableId] || 'Restaurant';
    };

    // Get restaurant ID from table name
    const getRestaurantId = (tableId) => {
        const tableToIdMap = {
            'vijs_menu': 1,
            'sula_indian_restaurant_menu': 2,
            'agra_tandoori_restaurant_menu': 3,
            'fishhook_menu': 4,
            'spice_valley_indian_cuisine_menu': 5,
            'gians_indian_cuisine_menu': 6,
            'pabla_curry_house_menu': 7,
            'shandhar_hut_indian_cuisine_menu': 8,
            'indias_most_wanted_menu': 9,
            'tandoori_bites_menu': 10
        };

        return tableToIdMap[tableId] || 1;
    };

    // Navigate to restaurant with specific category
    const goToRestaurantCategory = (restaurantId, category) => {
        // Store the category in sessionStorage so the restaurant page knows which tab to open
        sessionStorage.setItem('activeCategory', category);
        navigate(`/restaurants/${restaurantId}`);
    };

    // Get random restaurant with specific category
    const getRandomRestaurantWithCategory = (category) => {
        if (restaurants.length === 0) {
            const randomId = Math.floor(Math.random() * 10) + 1;
            sessionStorage.setItem('activeCategory', category);
            return randomId;
        }

        const randomIndex = Math.floor(Math.random() * restaurants.length);
        const randomId = restaurants[randomIndex].id;
        sessionStorage.setItem('activeCategory', category);
        return randomId;
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
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            </Container>
        );
    }

    return (
        <Container className="my-4 featured-items-container">
            <h1 className="text-center mb-4">Featured Items</h1>

            <div className="random-buttons mb-4">
                <Link to={`/restaurants/${getRandomRestaurant()}`} className="btn btn-primary random-btn">
                    <FaRandom className="me-2" /> Random Restaurant
                </Link>
                <button
                    onClick={() => goToRestaurantCategory(getRandomRestaurant(), 'Starters')}
                    className="btn btn-success random-btn"
                >
                    <FaUtensils className="me-2" /> Surprise Me!
                </button>
            </div>

            <Nav
                variant="tabs"
                className="featured-tabs mb-4"
                activeKey={activeCategory}
                onSelect={(key) => setActiveCategory(key)}
            >
                <Nav.Item>
                    <Nav.Link eventKey="starters" className="featured-tab">
                        Starters
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="mains" className="featured-tab">
                        Lunch/Dinner
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="desserts" className="featured-tab">
                        Desserts
                    </Nav.Link>
                </Nav.Item>
            </Nav>

            <div className="featured-items">
                {activeCategory === 'starters' && (
                    <>
                        <div className="category-header">
                            <h2>Featured Starters</h2>
                            <button
                                onClick={() => goToRestaurantCategory(getRandomRestaurantWithCategory('Starters'), 'Starters')}
                                className="random-category-link"
                            >
                                <FaRandom className="me-1" /> Random Starters
                            </button>
                        </div>
                        <Row>
                            {featuredItems.starters.map((item, index) => (
                                <Col md={4} key={index} className="mb-4">
                                    <Card
                                        className="h-100 featured-card"
                                        onClick={() => goToRestaurantCategory(getRestaurantId(item.restaurant_table), 'Starters')}
                                    >
                                        <div className="featured-badge">
                                            <FaStar /> Featured
                                        </div>
                                        <Card.Body>
                                            <Card.Title>{item.name}</Card.Title>
                                            <Card.Subtitle className="mb-2 text-muted">
                                                {getRestaurantName(item.restaurant_table)}
                                            </Card.Subtitle>
                                            <Card.Text>
                                                {item.description || 'A delicious starter from our menu.'}
                                            </Card.Text>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span className="price">${parseFloat(item.price).toFixed(2)}</span>
                                                <button
                                                    className="btn btn-outline-primary"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        goToRestaurantCategory(getRestaurantId(item.restaurant_table), 'Starters');
                                                    }}
                                                >
                                                    View Restaurant
                                                </button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </>
                )}

                {activeCategory === 'mains' && (
                    <>
                        <div className="category-header">
                            <h2>Featured Main Courses</h2>
                            <button
                                onClick={() => goToRestaurantCategory(getRandomRestaurantWithCategory('Main Course'), 'Main Course')}
                                className="random-category-link"
                            >
                                <FaRandom className="me-1" /> Random Main Courses
                            </button>
                        </div>
                        <Row>
                            {featuredItems.mains.map((item, index) => (
                                <Col md={4} key={index} className="mb-4">
                                    <Card
                                        className="h-100 featured-card"
                                        onClick={() => goToRestaurantCategory(getRestaurantId(item.restaurant_table), 'Main Course')}
                                    >
                                        <div className="featured-badge">
                                            <FaStar /> Featured
                                        </div>
                                        <Card.Body>
                                            <Card.Title>{item.name}</Card.Title>
                                            <Card.Subtitle className="mb-2 text-muted">
                                                {getRestaurantName(item.restaurant_table)}
                                            </Card.Subtitle>
                                            <Card.Text>
                                                {item.description || 'A delicious main course from our menu.'}
                                            </Card.Text>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span className="price">${parseFloat(item.price).toFixed(2)}</span>
                                                <button
                                                    className="btn btn-outline-primary"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        goToRestaurantCategory(getRestaurantId(item.restaurant_table), 'Main Course');
                                                    }}
                                                >
                                                    View Restaurant
                                                </button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </>
                )}

                {activeCategory === 'desserts' && (
                    <>
                        <div className="category-header">
                            <h2>Featured Desserts</h2>
                            <button
                                onClick={() => goToRestaurantCategory(getRandomRestaurantWithCategory('Dessert'), 'Dessert')}
                                className="random-category-link"
                            >
                                <FaRandom className="me-1" /> Random Desserts
                            </button>
                        </div>
                        <Row>
                            {featuredItems.desserts.map((item, index) => (
                                <Col md={4} key={index} className="mb-4">
                                    <Card
                                        className="h-100 featured-card"
                                        onClick={() => goToRestaurantCategory(getRestaurantId(item.restaurant_table), 'Dessert')}
                                    >
                                        <div className="featured-badge">
                                            <FaStar /> Featured
                                        </div>
                                        <Card.Body>
                                            <Card.Title>{item.name}</Card.Title>
                                            <Card.Subtitle className="mb-2 text-muted">
                                                {getRestaurantName(item.restaurant_table)}
                                            </Card.Subtitle>
                                            <Card.Text>
                                                {item.description || 'A delicious dessert from our menu.'}
                                            </Card.Text>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span className="price">${parseFloat(item.price).toFixed(2)}</span>
                                                <button
                                                    className="btn btn-outline-primary"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        goToRestaurantCategory(getRestaurantId(item.restaurant_table), 'Dessert');
                                                    }}
                                                >
                                                    View Restaurant
                                                </button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </>
                )}
            </div>
        </Container>
    );
};

export default FeaturedItemsPage; 