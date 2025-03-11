import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import supabase from '../utils/supabase';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Set up axios defaults
    useEffect(() => {
        axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    }, []);

    // Check if token exists and is valid on initial load
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    // Check if token is expired
                    const decodedToken = jwtDecode(token);
                    const currentTime = Date.now() / 1000;

                    if (decodedToken.exp < currentTime) {
                        // Token is expired
                        localStorage.removeItem('token');
                        setUser(null);
                    } else {
                        // Token is valid, get user data
                        try {
                            const response = await axios.get('/api/auth/me', {
                                headers: {
                                    Authorization: `Bearer ${token}`
                                }
                            });
                            setUser(response.data.user);
                        } catch (err) {
                            console.error('Error fetching user data:', err);
                            localStorage.removeItem('token');
                            setUser(null);
                        }
                    }
                }
            } catch (err) {
                console.error('Auth error:', err);
                localStorage.removeItem('token');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    // Register a new user
    const register = async (userData) => {
        try {
            setError(null);
            console.log('Registering user with data:', userData);
            const response = await axios.post('/api/auth/register', userData);
            console.log('Registration response:', response.data);
            localStorage.setItem('token', response.data.token);
            setUser(response.data.user);
            return response.data;
        } catch (err) {
            console.error('Registration error:', err);
            const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    // Login user
    const login = async (credentials) => {
        try {
            setError(null);
            const response = await axios.post('/api/auth/login', credentials);
            localStorage.setItem('token', response.data.token);
            setUser(response.data.user);
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    // Logout user
    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    // Handle Google OAuth success
    const handleGoogleSuccess = (token) => {
        try {
            const decodedToken = jwtDecode(token);
            localStorage.setItem('token', token);
            setUser({
                id: decodedToken.id,
                email: decodedToken.email,
                name: decodedToken.name
            });
        } catch (err) {
            console.error('Google auth error:', err);
            setError('Google authentication failed');
        }
    };

    // Get initial session
    useEffect(() => {
        const checkSession = async () => {
            try {
                const { data, error } = await supabase.auth.getSession();
                
                if (error) {
                    console.error("Session check error:", error);
                    throw error;
                }
                
                console.log("Session data:", data);
                
                if (data.session) {
                    setUser(data.session.user);
                    console.log("User set from session:", data.session.user);
                } else {
                    setUser(null);
                    console.log("No active session found");
                }
            } catch (err) {
                console.error("Error checking session:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        
        checkSession();
        
        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                console.log("Auth state changed:", event, session);
                setUser(session?.user || null);
            }
        );
        
        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    const value = {
        user,
        loading,
        error,
        register,
        login,
        logout,
        handleGoogleSuccess
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;