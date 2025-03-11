import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FaUsers, FaBriefcase, FaGlassCheers, FaBirthdayCake } from 'react-icons/fa';

const cateringServices = [
    {
        id: 1,
        title: 'Corporate Events',
        description: 'Impress your clients and colleagues with our professional catering services for meetings, conferences, and corporate gatherings.',
        icon: <FaBriefcase size={40} className="text-primary mb-3" />,
        image: 'https://images.unsplash.com/photo-1556125574-d7f27ec36a06'
    },
    {
        id: 2,
        title: 'Weddings',
        description: 'Make your special day memorable with our elegant wedding catering packages. From cocktail hours to full-service receptions.',
        icon: <FaGlassCheers size={40} className="text-primary mb-3" />,
        image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed'
    },
    {
        id: 3,
        title: 'Private Parties',
        description: 'Whether it\'s a birthday, anniversary, or family gathering, our catering services will make your celebration special.',
        icon: <FaBirthdayCake size={40} className="text-primary mb-3" />,
        image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d'
    },
    {
        id: 4,
        title: 'Large Events',
        description: 'Hosting a large event? Our team can handle gatherings of any size with customized menus and professional service.',
        icon: <FaUsers size={40} className="text-primary mb-3" />,
        image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622'
    }
];

const CateringServices = () => {
    return (
        <section className="catering-services py-5">
            <Container>
                <div className="text-center mb-5">
                    <h2 className="fw-bold">Our Catering Services</h2>
                    <p className="text-muted mx-auto" style={{ maxWidth: '700px' }}>
                        From corporate events to weddings and private parties, we offer premium catering services
                        tailored to your specific needs and preferences.
                    </p>
                </div>

                <Row>
                    {cateringServices.map((service) => (
                        <Col key={service.id} md={6} lg={3} className="mb-4">
                            <Card className="h-100 border-0 shadow-sm catering-card">
                                <div
                                    className="card-img-top catering-img"
                                    style={{
                                        backgroundImage: `url(${service.image}?auto=format&fit=crop&w=500&h=300&q=80)`,
                                        height: '200px',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center'
                                    }}
                                ></div>
                                <Card.Body className="text-center">
                                    {service.icon}
                                    <Card.Title className="fw-bold mb-3">{service.title}</Card.Title>
                                    <Card.Text className="text-muted mb-4">
                                        {service.description}
                                    </Card.Text>
                                    <Button variant="outline-primary" className="fw-semibold">Learn More</Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>

                <div className="text-center mt-4">
                    <Button variant="primary" size="lg" className="fw-semibold">
                        Request Catering Quote
                    </Button>
                </div>
            </Container>
        </section>
    );
};

export default CateringServices; 