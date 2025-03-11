import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Dropdown, Badge, Toast, ToastContainer } from 'react-bootstrap';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaShoppingCart, FaUser, FaSignOutAlt, FaCog, FaHistory } from 'react-icons/fa';
import supabase from '../utils/supabase';
import '../styles/Header.css';

const Header = () => {
    const { user, logout } = useAuth();
    const [cartCount, setCartCount] = useState(0);
    const [showToast, setShowToast] = useState(false);

    // Fetch cart count when user changes
    useEffect(() => {
        if (user) {
            fetchCartCount();
        } else {
            setCartCount(0);
        }
    }, [user]);

    const fetchCartCount = async () => {
        try {
            if (!user || !user.id) return;

            const { data, error } = await supabase
                .from('cart_items')
                .select('id')
                .eq('user_id', user.id.toString());

            if (error) {
                console.error('Error fetching cart count:', error);
                return;
            }

            setCartCount(data?.length || 0);
        } catch (err) {
            console.error('Error fetching cart count:', err);
        }
    };

    const handleProfileClick = (e) => {
        // Prevent default navigation
        e.preventDefault();

        // Show toast message
        setShowToast(true);

        // Hide toast after 3 seconds
        setTimeout(() => {
            setShowToast(false);
        }, 3000);
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
                                                    {user.name ? user.name.split(' ')[0] : 'Profile'}
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
                                            <Dropdown.Item onClick={logout} className="logout-item">
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
        </>
    );
};

export default Header;
