import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Dropdown, Badge, Toast, ToastContainer } from 'react-bootstrap';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaSignOutAlt, FaHistory } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { getUserCart } from '../utils/supabase';
import supabase from '../utils/supabase';
import '../styles/Header.css';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [cartCount, setCartCount] = useState(0);
    const [showToast, setShowToast] = useState(false);

    // Debug log for current authentication state
    useEffect(() => {
        console.log('Header - Auth state changed:', user ? `User ${user.id} is logged in` : 'No user logged in');

        // When user state changes, fetch cart count
        if (user) {
            fetchCartCount();
        } else {
            setCartCount(0);
        }
    }, [user]);

    // Fetch cart count
    const fetchCartCount = async () => {
        try {
            if (!user) return;

            console.log('Fetching cart count for user:', user.id);

            // Get current items using our utility function
            const { success, data, error } = await getUserCart(user.id);

            if (!success || error) {
                console.error('Error fetching cart count:', error);
                return;
            }

            // Calculate total quantity
            const totalItems = data.reduce((total, item) => total + item.quantity, 0);
            console.log(`Cart count fetched: ${totalItems} items`);
            setCartCount(totalItems);
        } catch (err) {
            console.error('Error fetching cart count:', err);
        }
    };

    const handleLogout = async () => {
        try {
            console.log('User logging out');
            await logout();
            console.log('Logout successful');
            navigate('/');
        } catch (err) {
            console.error('Error logging out:', err);
        }
    };

    const handleProfileClick = () => {
        // Set toast message for profile page (currently not implemented)
        setShowToast(true);
    };

    return (
        <>
            <Navbar bg="dark" variant="dark" expand="lg" sticky="top" className="custom-navbar" style={{ backgroundColor: '#000000 !important' }}>
                <Container>
                    <Navbar.Brand as={Link} to="/" className="brand-logo">
                        BCFOOD~FEAST
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto main-nav">
                            <Nav.Link as={NavLink} to="/" exact className="nav-link-custom">
                                Home
                            </Nav.Link>
                            <Nav.Link as={NavLink} to="/restaurants" className="nav-link-custom">
                                Restaurants
                            </Nav.Link>
                            <Nav.Link as={NavLink} to="/catering" className="nav-link-custom">
                                Catering
                            </Nav.Link>
                        </Nav>
                        <Nav className="auth-nav">
                            {user ? (
                                <div className="d-flex align-items-center user-menu">
                                    <Nav.Link as={NavLink} to="/cart" className="cart-link nav-item-spacing">
                                        <FaShoppingCart className="icon" />
                                        <span className="d-none d-md-inline ms-1 text-white">Cart</span>
                                        {cartCount > 0 && (
                                            <Badge bg="danger" pill className="cart-badge">
                                                {cartCount}
                                            </Badge>
                                        )}
                                    </Nav.Link>

                                    <Dropdown align="end" className="user-dropdown nav-item-spacing">
                                        <Dropdown.Toggle as="div" className="user-dropdown-toggle">
                                            <div className="d-flex align-items-center profile-link">
                                                <FaUser className="icon" />
                                                <span className="d-none d-md-inline ms-1 text-white">
                                                    {user.user_metadata?.name || user.email.split('@')[0] || 'Profile'}
                                                </span>
                                            </div>
                                        </Dropdown.Toggle>

                                        <Dropdown.Menu className="user-dropdown-menu">
                                            <Dropdown.Item onClick={handleProfileClick}>
                                                <FaUser className="dropdown-icon" /> My Profile
                                            </Dropdown.Item>
                                            <Dropdown.Item as={Link} to="/order-history">
                                                <FaHistory className="dropdown-icon" /> Order History
                                            </Dropdown.Item>

                                            <Dropdown.Divider />
                                            <Dropdown.Item onClick={handleLogout} className="logout-item">
                                                <FaSignOutAlt className="dropdown-icon" /> Logout
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                            ) : (
                                <div className="d-flex align-items-center auth-buttons">
                                    <Link to="/login" className="btn btn-outline-light me-2 login-btn">
                                        Login
                                    </Link>
                                    <Link to="/signup" className="btn btn-primary signup-btn">
                                        Sign Up
                                    </Link>
                                </div>
                            )}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            {/* Toast for profile click */}
            <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1 }}>
                <Toast
                    show={showToast}
                    onClose={() => setShowToast(false)}
                    delay={3000}
                    autohide
                >
                    <Toast.Header>
                        <strong className="me-auto">Info</strong>
                    </Toast.Header>
                    <Toast.Body>Profile page is coming soon!</Toast.Body>
                </Toast>
            </ToastContainer>
        </>
    );
};

export default Header;
