import React from 'react';
import { Container, Row, Col, Button, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Hero = () => {
    // Using a placeholder image URL instead of importing a local image
    const heroImageUrl = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80';

    return (
        <div className="hero-section py-5">
            <Container>
                <Row className="align-items-center">
                    <Col lg={6} className="mb-5 mb-lg-0">
                        <h1 className="display-4 fw-bold mb-3">
                            Delicious Food, <span className="text-primary">Delivered</span> to Your Door
                        </h1>
                        <p className="lead mb-4">
                            Order your favorite meals or let us cater your next event with our premium food services.
                            Fresh ingredients, expert chefs, and timely delivery guaranteed.
                        </p>
                        <div className="d-flex flex-wrap gap-3">
                            <Button as={Link} to="/restaurants" variant="primary" size="lg" className="fw-semibold">
                                Restaurants
                            </Button>
                            <Button as={Link} to="/catering" variant="outline-primary" size="lg" className="fw-semibold">
                                Catering Services
                            </Button>
                        </div>
                        <div className="mt-4 d-flex align-items-center">
                            <div className="d-flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <i key={star} className="fas fa-star text-warning me-1"></i>
                                ))}
                            </div>
                            <span className="ms-2 text-muted">
                                <strong>4.8</strong> (2,000+ reviews)
                            </span>
                        </div>
                    </Col>
                    <Col lg={6}>
                        <div className="hero-image-container position-relative">
                            <div className="hero-image-background position-absolute rounded-circle bg-primary opacity-10"></div>
                            <Image
                                src={heroImageUrl}
                                alt="Delicious food spread"
                                fluid
                                className="hero-image rounded-4 shadow-lg"
                                style={{ objectFit: 'cover', height: '500px' }}
                            />
                            <div className="position-absolute top-0 start-0 translate-middle bg-white p-3 rounded-4 shadow-lg hero-badge">
                                <h5 className="mb-0 text-primary fw-bold">30%</h5>
                                <p className="mb-0 small">OFF FIRST ORDER</p>
                            </div>
                            <div className="position-absolute bottom-0 end-0 translate-middle-y bg-white p-3 rounded-4 shadow-lg hero-badge">
                                <h5 className="mb-0 fw-bold">Free Delivery</h5>
                                <p className="mb-0 small">On orders over $30</p>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Hero; 