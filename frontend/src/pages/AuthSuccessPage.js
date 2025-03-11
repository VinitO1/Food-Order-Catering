import React, { useEffect } from 'react';
import { Container, Spinner } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const { handleGoogleSuccess } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');

        if (token) {
            handleGoogleSuccess(token);
            navigate('/');
        } else {
            // If no token, redirect to login
            navigate('/login');
        }
    }, [searchParams, handleGoogleSuccess, navigate]);

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
            <div className="text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Completing authentication, please wait...</p>
            </div>
        </Container>
    );
};

export default AuthSuccessPage; 