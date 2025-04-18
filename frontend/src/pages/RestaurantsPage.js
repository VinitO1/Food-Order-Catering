import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import supabase from '../utils/supabase';
import { FaMapMarkerAlt, FaUtensils } from 'react-icons/fa';

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

const RestaurantsPage = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                setLoading(true);

                // Check if Supabase is properly initialized
                if (!supabase) {
                    throw new Error('Supabase client not initialized');
                }

                // Fetch all restaurants
                const { data, error } = await supabase
                    .from('restaurants')
                    .select('*')
                    .order('name');

                if (error) {
                    throw new Error(`Error fetching restaurants: ${error.message}`);
                }

                if (data?.length > 0) {
                    // Process the restaurant data to add missing fields
                    const processedData = data.map(restaurant => ({
                        ...restaurant,
                        // Use default image based on ID or a generic one
                        image_url: DEFAULT_IMAGES[restaurant.id] || 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=2074',
                        // Set default cuisine type
                        cuisine_type: DEFAULT_CUISINE,
                        // Convert province to shorter form if it's British Columbia
                        province: restaurant.province === 'British Columbia' ? 'BC' : restaurant.province,
                        // Ensure catering_available is a boolean
                        catering_available: restaurant.catering_available === 'true' || restaurant.catering_available === true
                    }));

                    setRestaurants(processedData);
                } else {
                    setRestaurants([]);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurants();
    }, []);

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </Container>
        );
    }

    return (
        <Container className="my-4">
            <h1 className="mb-4">Restaurants</h1>

            {error && (
                <Alert variant="danger">
                    Error loading restaurants: {error}
                    <Button
                        variant="primary"
                        onClick={() => window.location.reload()}
                        className="ms-3"
                    >
                        Try Again
                    </Button>
                </Alert>
            )}

            {restaurants.length === 0 ? (
                <Alert variant="info">
                    No restaurants found in the database. You may need to import the restaurant data.
                </Alert>
            ) : (
                <Row>
                    {restaurants.map((restaurant) => (
                        <Col md={4} className="mb-4" key={restaurant.id}>
                            <Card className="h-100 restaurant-card shadow-sm">
                                <div className="restaurant-image-container">
                                    <Image
                                        src={restaurant.image_url}
                                        alt={restaurant.name}
                                        className="card-img-top restaurant-image"
                                        style={{ height: '200px', objectFit: 'cover' }}
                                    />
                                </div>
                                <Card.Body>
                                    {restaurant.catering_available && (
                                        <div className="badge bg-success mb-2">
                                            Catering Available
                                        </div>
                                    )}
                                    <Card.Title className="restaurant-title">{restaurant.name}</Card.Title>
                                    <Card.Text className="text-muted">
                                        <div className="mb-1">
                                            <FaUtensils className="me-2" />
                                            <span className="cuisine-type">{restaurant.cuisine_type || 'Indian'}</span>
                                        </div>
                                        <div>
                                            <FaMapMarkerAlt className="me-2" />
                                            {restaurant.city}, {restaurant.province}
                                        </div>
                                    </Card.Text>
                                    <Link
                                        to={`/restaurants/${restaurant.id}`}
                                        className="btn btn-primary w-100 mt-2"
                                    >
                                        View Menu
                                    </Link>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
};

export default RestaurantsPage;