import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaStar, FaQuoteLeft } from 'react-icons/fa';

const testimonials = [
    {
        id: 1,
        name: 'Sarah Johnson',
        role: 'Wedding Client',
        image: 'https://randomuser.me/api/portraits/women/44.jpg',
        rating: 5,
        text: 'The catering service for our wedding was absolutely phenomenal! The food was delicious, the presentation was beautiful, and the staff was professional and attentive. Our guests are still raving about it!'
    },
    {
        id: 2,
        name: 'Michael Chen',
        role: 'Corporate Event',
        image: 'https://randomuser.me/api/portraits/men/32.jpg',
        rating: 5,
        text: 'We hired FoodFeast for our company\'s annual meeting, and they exceeded all expectations. The food was outstanding, delivered on time, and the variety satisfied everyone\'s dietary preferences. Will definitely use them again!'
    },
    {
        id: 3,
        name: 'Emily Rodriguez',
        role: 'Regular Customer',
        image: 'https://randomuser.me/api/portraits/women/63.jpg',
        rating: 4,
        text: 'I order from FoodFeast at least once a week. Their food is consistently delicious, delivery is always prompt, and their app makes ordering so easy. My go-to for both lunch at work and dinner at home!'
    }
];

const Testimonials = () => {
    return (
        <section className="testimonials py-5 bg-light">
            <Container>
                <div className="text-center mb-5">
                    <h2 className="fw-bold">What Our Customers Say</h2>
                    <p className="text-muted">Don't just take our word for it - hear from our satisfied customers</p>
                </div>

                <Row>
                    {testimonials.map((testimonial) => (
                        <Col key={testimonial.id} md={4} className="mb-4">
                            <Card className="h-100 border-0 shadow-sm testimonial-card">
                                <Card.Body className="p-4">
                                    <div className="d-flex mb-4">
                                        <div className="testimonial-img me-3">
                                            <img
                                                src={testimonial.image}
                                                alt={testimonial.name}
                                                className="rounded-circle"
                                                width="60"
                                                height="60"
                                            />
                                        </div>
                                        <div>
                                            <h5 className="mb-1 fw-bold">{testimonial.name}</h5>
                                            <p className="mb-1 text-muted small">{testimonial.role}</p>
                                            <div className="d-flex">
                                                {[...Array(5)].map((_, i) => (
                                                    <FaStar
                                                        key={i}
                                                        className={i < testimonial.rating ? "text-warning" : "text-muted"}
                                                        size={14}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <FaQuoteLeft className="text-primary opacity-25 mb-2" size={24} />
                                    <Card.Text className="text-muted">
                                        {testimonial.text}
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>
        </section>
    );
};

export default Testimonials; 