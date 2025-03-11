import React from 'react';
import { Container, Row, Col, ListGroup } from 'react-bootstrap';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';

const Footer = () => {
    return (
        <footer className="bg-dark text-white pt-5 pb-4">
            <Container>
                <Row className="mb-4">
                    <Col lg={4} md={6} className="mb-4 mb-md-0">
                        <h5 className="text-uppercase mb-4 fw-bold text-primary">BCFOOD~FEAST</h5>
                        <p>
                            Providing exceptional food services for all occasions. From daily meals to special events,
                            we pride ourselves on quality ingredients, expert chefs, and impeccable service.
                        </p>
                     
                    </Col>

                    <Col lg={4} md={6} className="mb-4 mb-md-0">
                        <h5 className="text-uppercase mb-4 fw-bold">Quick Links</h5>
                        <ListGroup variant="flush" className="bg-dark">
                            <ListGroup.Item className="bg-dark text-white border-0 ps-0 py-1">
                                <a href="/" className="text-white text-decoration-none">Home</a>
                            </ListGroup.Item>
                            <ListGroup.Item className="bg-dark text-white border-0 ps-0 py-1">
                                <a href="/order" className="text-white text-decoration-none">Order Food</a>
                            </ListGroup.Item>
                            <ListGroup.Item className="bg-dark text-white border-0 ps-0 py-1">
                                <a href="/catering" className="text-white text-decoration-none">Catering Services</a>
                            </ListGroup.Item>
                            <ListGroup.Item className="bg-dark text-white border-0 ps-0 py-1">
                                <a href="/about" className="text-white text-decoration-none">About Us</a>
                            </ListGroup.Item>
                            <ListGroup.Item className="bg-dark text-white border-0 ps-0 py-1">
                                <a href="/contact" className="text-white text-decoration-none">Contact</a>
                            </ListGroup.Item>
                        </ListGroup>
                    </Col>

                    <Col lg={4} md={12} className="mb-4 mb-md-0">
                        <h5 className="text-uppercase mb-4 fw-bold">Contact Us</h5>
                        <p className="mb-3">
                            <FaMapMarkerAlt className="me-2" />
                            123 Food Street, Cuisine City, FC 12345
                        </p>
                        <p className="mb-3">
                            <FaPhone className="me-2" />
                            (123) 456-7890
                        </p>
                   
                    </Col>
                </Row>

                <hr className="mb-4" />

                <Row className="align-items-center">
                    <Col md={7} lg={8}>
                        <p>
                            &copy; {new Date().getFullYear()} <strong className="text-primary">BCFoodFeast</strong>. All Rights Reserved.
                        </p>
                    </Col>
                    <Col md={5} lg={4}>
                        <div className="text-center text-md-end">
                            <ul className="list-unstyled list-inline">
                                <li className="list-inline-item">
                                    <a href="/terms" className="text-white text-decoration-none">Terms of Use</a>
                                </li>
                                <li className="list-inline-item">
                                    <span className="mx-2">|</span>
                                </li>
                                <li className="list-inline-item">
                                    <a href="/privacy" className="text-white text-decoration-none">Privacy Policy</a>
                                </li>
                            </ul>
                        </div>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
};

export default Footer;
