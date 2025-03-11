import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const categories = [
    {
        id: 1,
        name: 'Starters',
        image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666',
        count: 24,
        color: '#FFD9B7'
    },
    {
        id: 2,
        name: 'Lunch',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
        count: 36,
        color: '#B7E4FF'
    },
    {
        id: 3,
        name: 'Dinner',
        image: 'https://images.unsplash.com/photo-1559847844-5315695dadae',
        count: 42,
        color: '#FFB7D1'
    },
    {
        id: 4,
        name: 'Desserts',
        image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e',
        count: 15,
        color: '#D4B7FF'
    }
];

const FeaturedCategories = () => {
    return (
        <section className="featured-categories py-5">
            <Container>
                <div className="text-center mb-5">
                    <h2 className="fw-bold">Browse Food Categories</h2>
                    <p className="text-muted">Explore our wide variety of delicious options</p>
                </div>

                <Row>
                    {categories.map((category) => (
                        <Col key={category.id} md={6} lg={3} className="mb-4">
                            <Link to={`/category/${category.id}`} className="text-decoration-none">
                                <Card
                                    className="category-card border-0 shadow-sm h-100 transition-hover"
                                    style={{ backgroundColor: category.color }}
                                >
                                    <div className="category-img-container text-center p-4">
                                        <img
                                            src={`${category.image}?auto=format&fit=crop&w=300&h=300&q=80`}
                                            alt={category.name}
                                            className="img-fluid rounded-circle"
                                            style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                        />
                                    </div>
                                    <Card.Body className="text-center">
                                        <Card.Title className="fw-bold">{category.name}</Card.Title>
                                        <Card.Text className="text-muted">{category.count} items</Card.Text>
                                    </Card.Body>
                                </Card>
                            </Link>
                        </Col>
                    ))}
                </Row>
            </Container>
        </section>
    );
};

export default FeaturedCategories; 