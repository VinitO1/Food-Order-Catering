import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const { login, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Check if there was a redirect from another page
    const from = location.state?.from || '/restaurants';

    // If user is already logged in, redirect to the 'from' page
    useEffect(() => {
        if (user) {
            console.log('User already logged in, redirecting to:', from);
            navigate(from, { replace: true });
        }
    }, [user, navigate, from]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setError('');
            setMessage('');
            setLoading(true);

            // Validate inputs
            if (!email || !password) {
                throw new Error('Email and password are required');
            }

            console.log('Attempting login with email:', email);

            // Login with Supabase
            const { success, error } = await login(email, password);

            if (!success) {
                throw new Error(error || 'Failed to sign in');
            }

            console.log('Login successful, redirecting to:', from);
            setMessage('Login successful! Redirecting...');

            // Navigate to the 'from' page or default page
            setTimeout(() => {
                navigate(from, { replace: true });
            }, 1000);

        } catch (err) {
            console.error('Login error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col xs={12} md={8} lg={6}>
                    <Card className="shadow">
                        <Card.Body className="p-5">
                            <h2 className="text-center mb-4">Sign In</h2>

                            {error && (
                                <Alert variant="danger">{error}</Alert>
                            )}

                            {message && (
                                <Alert variant="success">{message}</Alert>
                            )}

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3" controlId="formEmail">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        placeholder="Enter your email"
                                        disabled={loading}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4" controlId="formPassword">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        placeholder="Enter your password"
                                        disabled={loading}
                                    />
                                </Form.Group>

                                <div className="d-grid gap-2">
                                    <Button
                                        variant="primary"
                                        type="submit"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <Spinner
                                                    as="span"
                                                    animation="border"
                                                    size="sm"
                                                    role="status"
                                                    aria-hidden="true"
                                                    className="me-2"
                                                />
                                                Signing In...
                                            </>
                                        ) : (
                                            'Sign In'
                                        )}
                                    </Button>
                                </div>
                            </Form>

                            <div className="text-center mt-4">
                                <div className="mb-3">
                                    Don't have an account?{' '}
                                    <Link to="/register">Sign Up</Link>
                                </div>
                                <div>
                                    <Link to="/forgot-password">Forgot Password?</Link>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default LoginPage; 