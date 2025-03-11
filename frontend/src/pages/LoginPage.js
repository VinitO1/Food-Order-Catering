import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaGoogle } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [validated, setValidated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loginError, setLoginError] = useState('');

    const { login, error } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
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
        setLoading(true);
        setLoginError('');

        try {
            console.log('Submitting login with data:', formData);
            await login(formData);
            navigate('/');
        } catch (err) {
            console.error('Login error:', err);
            setLoginError(err.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        window.location.href = `${apiUrl}/api/auth/google`;
    };

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={6} lg={5}>
                    <Card className="shadow-sm border-0">
                        <Card.Body className="p-4">
                            <div className="text-center mb-4">
                                <h2 className="fw-bold mb-0">Welcome Back</h2>
                                <p className="text-muted">Sign in to your account</p>
                            </div>

                            {(loginError || error) && (
                                <Alert variant="danger">{loginError || error}</Alert>
                            )}

                            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                                <Form.Group className="mb-3" controlId="email">
                                    <Form.Label>Email address</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter your email"
                                        required
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Please provide a valid email.
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-4" controlId="password">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter your password"
                                        required
                                        minLength={6}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Password must be at least 6 characters.
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <div className="d-grid mb-3">
                                    <Button
                                        variant="primary"
                                        type="submit"
                                        disabled={loading}
                                        className="py-2"
                                    >
                                        {loading ? 'Signing in...' : 'Sign In'}
                                    </Button>
                                </div>                               

                                <div className="text-center">
                                    <p className="mb-0">
                                        Don't have an account?{' '}
                                        <Link to="/signup" className="text-decoration-none">
                                            Sign up
                                        </Link>
                                    </p>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default LoginPage; 