import React from 'react';
import Hero from '../components/Hero';
import FeaturedCategories from '../components/FeaturedCategories';

import CateringServices from '../components/CateringServices';
import Testimonials from '../components/Testimonials';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { FaUtensils, FaTruck, FaClock, FaPhoneAlt } from 'react-icons/fa';
import '../styles/HomePage.css';
import FeaturedItemsPage from './FeaturedItemsPage';

const HomePage = () => {
    return (
        <div className="home-page">
            {/* Hero Section */}
            <Hero />

            {/* Features Section */}
            <section className="features py-5">
                <Container>
                    <Row className="g-4">
                        <Col md={3} sm={6}>
                            <div className="feature-item text-center p-4">
                                <div className="feature-icon bg-primary bg-opacity-10 rounded-circle p-3 d-inline-flex mb-3">
                                    <FaUtensils className="text-primary" size={24} />
                                </div>
                                <h5 className="fw-bold">Quality Food</h5>
                                <p className="text-muted small mb-0">Made with premium ingredients</p>
                            </div>
                        </Col>
                        <Col md={3} sm={6}>
                            <div className="feature-item text-center p-4">
                                <div className="feature-icon bg-primary bg-opacity-10 rounded-circle p-3 d-inline-flex mb-3">
                                    <FaTruck className="text-primary" size={24} />
                                </div>
                                <h5 className="fw-bold">Fast Delivery</h5>
                                <p className="text-muted small mb-0">Delivered to your doorstep</p>
                            </div>
                        </Col>
                        <Col md={3} sm={6}>
                            <div className="feature-item text-center p-4">
                                <div className="feature-icon bg-primary bg-opacity-10 rounded-circle p-3 d-inline-flex mb-3">
                                    <FaClock className="text-primary" size={24} />
                                </div>
                                <h5 className="fw-bold">Quick Service</h5>
                                <p className="text-muted small mb-0">Ready in 30 minutes or less</p>
                            </div>
                        </Col>
                        <Col md={3} sm={6}>
                            <div className="feature-item text-center p-4">
                                <div className="feature-icon bg-primary bg-opacity-10 rounded-circle p-3 d-inline-flex mb-3">
                                    <FaPhoneAlt className="text-primary" size={24} />
                                </div>
                                <h5 className="fw-bold">24/7 Support</h5>
                                <p className="text-muted small mb-0">Always here to help you</p>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>
            {/* Featured Items */}
            <FeaturedItemsPage />

            {/* Catering Services */}
            <CateringServices />

            {/* Testimonials */}
            <Testimonials />

        </div>
    );
};

export default HomePage; 