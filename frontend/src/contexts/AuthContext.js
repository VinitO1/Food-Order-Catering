import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../utils/supabase';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check for existing session on mount
    useEffect(() => {
        const checkSession = async () => {
            try {
                setLoading(true);
                console.log('Checking for existing Supabase session');

                // Get current session from Supabase
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('Error checking session:', error);
                    throw error;
                }

                if (session) {
                    console.log('Found existing session for user:', session.user.id);
                    setUser(session.user);
                } else {
                    console.log('No active session found');
                    setUser(null);
                }
            } catch (err) {
                console.error('Session check error:', err);
                setError(err.message);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkSession();

        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                console.log('Auth state changed:', event);

                if (event === 'SIGNED_IN' && session) {
                    console.log('User signed in:', session.user.id);
                    setUser(session.user);
                } else if (event === 'SIGNED_OUT') {
                    console.log('User signed out');
                    setUser(null);
                } else if (event === 'USER_UPDATED' && session) {
                    console.log('User updated:', session.user.id);
                    setUser(session.user);
                }
            }
        );

        // Clean up subscription on unmount
        return () => {
            if (subscription) subscription.unsubscribe();
        };
    }, []);

    // Register new user
    const register = async (email, password, name) => {
        try {
            console.log('Registering new user with email:', email);

            // Register with Supabase Auth
            const { data: { user }, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name: name
                    }
                }
            });

            if (error) {
                console.error('Registration error:', error);
                return { success: false, error: error.message };
            }

            console.log('Registration successful, user:', user.id);

            // Also insert the user into the users table
            const { data: userData, error: userError } = await supabase
                .from('users')
                .insert([
                    {
                        id: user.id,
                        name: name || email.split('@')[0], // Use name if provided, otherwise use part of email
                        email
                    }
                ]);

            if (userError) {
                console.error('Error adding user to users table:', userError);
                // We don't return an error here because the auth registration succeeded
                // The user record can be created later if needed
            } else {
                console.log('User added to users table successfully');
            }

            return { success: true, user };
        } catch (err) {
            console.error('Registration error:', err);
            return { success: false, error: err.message };
        }
    };

    // Login user
    const login = async (email, password) => {
        try {
            console.log('Logging in user with email:', email);

            const { data: { session, user }, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                console.error('Login error:', error);
                return { success: false, error: error.message };
            }

            console.log('Login successful, user:', user.id);

            return { success: true, user, session };
        } catch (err) {
            console.error('Login error:', err);
            return { success: false, error: err.message };
        }
    };

    // Logout user
    const logout = async () => {
        try {
            console.log('Logging out user');

            const { error } = await supabase.auth.signOut();

            if (error) {
                console.error('Logout error:', error);
                throw error;
            }

            console.log('Logout successful');
        } catch (err) {
            console.error('Logout error:', err);
            setError(err.message);
            throw err;
        }
    };

    // Get current session
    const getSession = async () => {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
                console.error('Get session error:', error);
                throw error;
            }

            return { session };
        } catch (err) {
            console.error('Get session error:', err);
            return { session: null, error: err.message };
        }
    };

    const value = {
        user,
        loading,
        error,
        register,
        login,
        logout,
        getSession
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContext;