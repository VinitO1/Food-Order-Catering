import React from 'react';
import { Container, Row, Col, Card, Button, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaUtensils, FaGlassMartiniAlt, FaCalendarAlt, FaAward, FaHandshake, FaUsers } from 'react-icons/fa';
import '../styles/AboutUs.css';

const AboutUsPage = () => {
    return (
        <Container className="about-us-container my-5">
            {/* Hero Section - Updated with full-width background and better layout */}
            <div className="hero-banner mb-5">
                <div className="hero-overlay">
                    <div className="hero-content text-center text-white">
                        <h1 className="hero-title">BC Food Feast</h1>
                        <p className="hero-subtitle">
                            Partnering with the Top 10 Best Indian Restaurants in British Columbia
                        </p>
                        <div className="hero-buttons mt-4">
                            <Link to="/catering" className="btn btn-primary btn-lg me-3">
                                Explore Catering
                            </Link>
                            <Link to="/restaurants" className="btn btn-outline-light btn-lg">
                                Browse Restaurants
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mission Statement Section */}
            <div className="mission-section mb-5">
                <Row className="align-items-center">
                    <Col lg={6}>
                        <h2 className="section-title">Our Culinary Journey</h2>
                        <p className="section-text">
                            At BC Food Feast, we've partnered with the <span className="highlight">Top 10 Best Indian Restaurants in British Columbia</span> to bring authentic,
                            high-quality Indian cuisine to your doorstep and special events.
                        </p>
                        <p className="section-text">
                            Our mission is to connect food lovers with the most exceptional Indian culinary experiences
                            in BC, whether it's for everyday dining or catering for your most important celebrations.
                        </p>
                    </Col>
                    <Col lg={6} className="mt-4 mt-lg-0">
                        <div className="mission-image-container">
                            <Image
                                src="https://images.unsplash.com/photo-1585937421612-70a008356fbe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=736&q=80"
                                alt="Indian cuisine spread"
                                fluid
                                className="mission-image shadow rounded"
                            />
                        </div>
                    </Col>
                </Row>
            </div>

            {/* Catering Services Section */}
            <div className="services-section mb-5">
                <h2 className="section-title text-center mb-4">Premium Catering Services</h2>
                <Row>
                    <Col md={6} lg={4} className="mb-4">
                        <Card className="service-card h-100">
                            <Card.Body className="text-center">
                                <div className="icon-container mb-3">
                                    <FaUtensils className="service-icon" />
                                </div>
                                <Card.Title>Authentic Cuisine</Card.Title>
                                <Card.Text>
                                    Experience the rich flavors and authentic recipes from various regions of India,
                                    prepared by top chefs from BC's best Indian restaurants.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6} lg={4} className="mb-4">
                        <Card className="service-card h-100">
                            <Card.Body className="text-center">
                                <div className="icon-container mb-3">
                                    <FaGlassMartiniAlt className="service-icon" />
                                </div>
                                <Card.Title>Bar Services</Card.Title>
                                <Card.Text>
                                    Complement your event with our professional bar services, featuring signature
                                    cocktails, fine wines, and traditional Indian beverages.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6} lg={4} className="mb-4">
                        <Card className="service-card h-100">
                            <Card.Body className="text-center">
                                <div className="icon-container mb-3">
                                    <FaCalendarAlt className="service-icon" />
                                </div>
                                <Card.Title>Event Planning</Card.Title>
                                <Card.Text>
                                    From corporate gatherings to weddings and cultural celebrations, our team helps
                                    plan the perfect menu for your special occasion.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* Restaurant Partners Section */}
            <div className="partners-section mb-5">
                <h2 className="section-title text-center mb-4">Our Restaurant Partners</h2>
                <p className="text-center mb-4">
                    We've carefully selected the top 10 Indian restaurants in British Columbia,
                    each bringing their unique regional specialties and culinary expertise to our platform.
                </p>
                <Row className="justify-content-center">
                    <Col lg={10}>
                        <div className="partner-logos">
                            <div className="partner-logo">Vij's</div>
                            <div className="partner-logo">Sula Indian</div>
                            <div className="partner-logo">Agra Tandoori</div>
                            <div className="partner-logo">Fishhook</div>
                            <div className="partner-logo">Spice Valley</div>
                            <div className="partner-logo">Gian's Indian</div>
                            <div className="partner-logo">Pabla Curry</div>
                            <div className="partner-logo">Shandhar Hut</div>
                            <div className="partner-logo">India's Most Wanted</div>
                            <div className="partner-logo">Tandoori Bites</div>
                        </div>
                    </Col>
                </Row>
            </div>

            {/* Why Choose Us Section */}
            <div className="why-us-section mb-5">
                <h2 className="section-title text-center mb-4">Why Choose BC Food Feast</h2>
                <Row>
                    <Col md={6} lg={4} className="mb-4">
                        <div className="feature-item">
                            <FaAward className="feature-icon" />
                            <h4>Premium Quality</h4>
                            <p>
                                We partner only with the highest-rated restaurants, ensuring exceptional
                                quality for every meal and catering service.
                            </p>
                        </div>
                    </Col>
                    <Col md={6} lg={4} className="mb-4">
                        <div className="feature-item">
                            <FaHandshake className="feature-icon" />
                            <h4>Reliable Service</h4>
                            <p>
                                From timely delivery to professional catering staff, we ensure a seamless
                                experience for all your dining needs.
                            </p>
                        </div>
                    </Col>
                    <Col md={6} lg={4} className="mb-4">
                        <div className="feature-item">
                            <FaUsers className="feature-icon" />
                            <h4>Events of All Sizes</h4>
                            <p>
                                Whether it's an intimate gathering or a grand celebration, we cater to events
                                of all sizes with customized menus and services.
                            </p>
                        </div>
                    </Col>
                </Row>
            </div>

            {/* Call to Action */}
            <div className="cta-section text-center p-5 mb-5">
                <h2 className="mb-3">Ready to Plan Your Next Event?</h2>
                <p className="mb-4">
                    Let us bring the best of BC's Indian cuisine to your special occasion,
                    complete with professional catering and bar services.
                </p>
                <Link to="/catering" className="btn btn-primary btn-lg">
                    Request Catering Quote
                </Link>
            </div>
        </Container>
    );
};

export default AboutUsPage; 