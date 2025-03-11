import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import supabase from '../utils/supabase';

const RestaurantsPage = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filteredRestaurants, setFilteredRestaurants] = useState([]);

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                setLoading(true);
                console.log('Fetching restaurants from Supabase...');

                const { data, error } = await supabase
                    .from('restaurants')
                    .select('*')
                    .order('name');

                if (error) {
                    throw new Error(`Error fetching restaurants: ${error.message}`);
                }

                console.log('Restaurants data:', data);
                setRestaurants(data || []);
                setFilteredRestaurants(data || []);
            } catch (err) {
                console.error('Error:', err);
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

    if (error) {
        return (
            <Container className="my-4">
                <Alert variant="danger">
                    {error}
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="my-4">
            <h1 className="mb-4">Restaurants</h1>

            {filteredRestaurants.length === 0 ? (
                <Alert variant="info">No restaurants found.</Alert>
            ) : (
                <Row>
                    {filteredRestaurants.map((restaurant) => (
                        <Col md={4} className="mb-4" key={restaurant.id}>
                            <Card className="h-100 restaurant-card">
                                <Card.Body>
                                    {restaurant.catering_available && (
                                        <div className="catering-badge">
                                            Catering Available
                                        </div>
                                    )}
                                    <Card.Title>{restaurant.name}</Card.Title>
                                    <Card.Text>
                                        {restaurant.city}, {restaurant.province}
                                    </Card.Text>
                                    <Link
                                        to={`/restaurants/${restaurant.id}`}
                                        className="btn btn-primary"
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