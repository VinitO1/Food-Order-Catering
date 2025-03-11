import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import supabase from '../utils/supabase';
import '../styles/Contact.css';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });

    const [validated, setValidated] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;

        if (form.checkValidity() === false) {
            e.stopPropagation();
            setValidated(true);
            return;
        }

        setValidated(true);
        setSubmitting(true);
        setSubmitError(null);

        try {
            // Save the contact message to Supabase
            const { data, error } = await supabase
                .from('contact_messages')
                .insert([
                    {
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone || null,
                        subject: formData.subject,
                        message: formData.message,
                        status: 'unread'
                    }
                ]);

            if (error) {
                console.error('Error saving contact message:', error);
                throw new Error('Failed to submit your message. Please try again later.');
            }

            console.log('Contact message saved:', data);
            setSubmitSuccess(true);
            setFormData({
                name: '',
                email: '',
                phone: '',
                subject: '',
                message: ''
            });
            setValidated(false);

            // Reset success message after 5 seconds
            setTimeout(() => {
                setSubmitSuccess(false);
            }, 5000);
        } catch (error) {
            console.error('Error submitting form:', error);
            setSubmitError(error.message || 'There was an error submitting your message. Please try again later.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="contact-page">
            {/* Hero Section */}
            <div className="contact-hero">
                <div className="contact-hero-overlay">
                    <Container>
                        <div className="contact-hero-content text-center">
                            <h1>Contact Us</h1>
                            <p>We'd love to hear from you. Reach out with any questions about our services.</p>
                        </div>
                    </Container>
                </div>
            </div>

            <Container className="py-5">
                {submitSuccess && (
                    <Alert variant="success" className="mb-4">
                        <Alert.Heading>Message Sent!</Alert.Heading>
                        <p>Thank you for contacting us. We'll get back to you as soon as possible.</p>
                    </Alert>
                )}

                {submitError && (
                    <Alert variant="danger" className="mb-4">
                        <Alert.Heading>Error</Alert.Heading>
                        <p>{submitError}</p>
                    </Alert>
                )}

                <Row className="g-4">
                    <Col lg={8}>
                        <Card className="contact-form-card">
                            <Card.Body>
                                <h2 className="mb-4">Send Us a Message</h2>
                                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3" controlId="contactName">
                                                <Form.Label>Your Name</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    required
                                                    placeholder="Enter your name"
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    Please provide your name.
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3" controlId="contactEmail">
                                                <Form.Label>Email Address</Form.Label>
                                                <Form.Control
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    required
                                                    placeholder="Enter your email"
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    Please provide a valid email address.
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3" controlId="contactPhone">
                                                <Form.Label>Phone Number</Form.Label>
                                                <Form.Control
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter your phone number (optional)"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3" controlId="contactSubject">
                                                <Form.Label>Subject</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="subject"
                                                    value={formData.subject}
                                                    onChange={handleInputChange}
                                                    required
                                                    placeholder="What is this regarding?"
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    Please provide a subject.
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Form.Group className="mb-3" controlId="contactMessage">
                                        <Form.Label>Message</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={5}
                                            name="message"
                                            value={formData.message}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="How can we help you?"
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            Please provide a message.
                                        </Form.Control.Feedback>
                                    </Form.Group>

                                    <Button
                                        variant="primary"
                                        type="submit"
                                        size="lg"
                                        className="mt-3"
                                        disabled={submitting}
                                    >
                                        {submitting ? (
                                            <>
                                                <Spinner
                                                    as="span"
                                                    animation="border"
                                                    size="sm"
                                                    role="status"
                                                    aria-hidden="true"
                                                    className="me-2"
                                                />
                                                Sending...
                                            </>
                                        ) : (
                                            'Send Message'
                                        )}
                                    </Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col lg={4}>
                        <Card className="contact-info-card mb-4">
                            <Card.Body>
                                <h3 className="mb-4">Contact Information</h3>

                                <div className="contact-info-item">
                                    <FaMapMarkerAlt className="contact-icon" />
                                    <div>
                                        <h5>Address</h5>
                                        <p>123 Food Street, Vancouver, BC V6B 1A9</p>
                                    </div>
                                </div>

                                <div className="contact-info-item">
                                    <FaPhone className="contact-icon" />
                                    <div>
                                        <h5>Phone</h5>
                                        <p>(604) 123-4567</p>
                                    </div>
                                </div>

                                <div className="contact-info-item">
                                    <FaEnvelope className="contact-icon" />
                                    <div>
                                        <h5>Email</h5>
                                        <p>info@bcfoodfeast.com</p>
                                    </div>
                                </div>

                                <div className="contact-info-item">
                                    <FaClock className="contact-icon" />
                                    <div>
                                        <h5>Business Hours</h5>
                                        <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                                        <p>Saturday: 10:00 AM - 4:00 PM</p>
                                        <p>Sunday: Closed</p>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>

                        <Card className="social-card">
                            <Card.Body>
                                <h3 className="mb-3">Connect With Us</h3>
                                <div className="social-icons">
                                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                                        <FaFacebook />
                                    </a>
                                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                                        <FaTwitter />
                                    </a>
                                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                                        <FaInstagram />
                                    </a>
                                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                                        <FaLinkedin />
                                    </a>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <div className="map-container mt-5">
                    <h3 className="text-center mb-4">Find Us</h3>
                    <div className="map-responsive">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d83328.9271392151!2d-123.19394600000001!3d49.257735!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x548673f143a94fb3%3A0xbb9196ea9b81f38b!2sVancouver%2C%20BC!5e0!3m2!1sen!2sca!4v1651271824527!5m2!1sen!2sca"
                            width="600"
                            height="450"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="BC Food Feast Location"
                        ></iframe>
                    </div>
                </div>

                <div className="faq-section mt-5">
                    <h3 className="text-center mb-4">Frequently Asked Questions</h3>
                    <Row>
                        <Col md={6}>
                            <div className="faq-item">
                                <h5>How do I place a catering order?</h5>
                                <p>You can place a catering order by visiting our Catering page, selecting your preferred restaurant, and filling out the catering request form. Our team will contact you to confirm details.</p>
                            </div>
                        </Col>
                        <Col md={6}>
                            <div className="faq-item">
                                <h5>Do you offer bar services for events?</h5>
                                <p>Yes, we offer professional bar services for events of all sizes. Our bar services include signature cocktails, fine wines, and traditional Indian beverages.</p>
                            </div>
                        </Col>
                        <Col md={6}>
                            <div className="faq-item">
                                <h5>How far in advance should I book catering?</h5>
                                <p>We recommend booking catering at least 2 weeks in advance for small events and 4-6 weeks for larger events to ensure availability and proper planning.</p>
                            </div>
                        </Col>
                        <Col md={6}>
                            <div className="faq-item">
                                <h5>Do you accommodate dietary restrictions?</h5>
                                <p>Yes, we can accommodate various dietary restrictions including vegetarian, vegan, gluten-free, and allergies. Please specify your requirements when placing your order.</p>
                            </div>
                        </Col>
                    </Row>
                </div>
            </Container>
        </div>
    );
};

export default ContactPage; 