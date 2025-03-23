import express from 'express';
import supabase from '../config/supabase.js';

const router = express.Router();

// Test route to check if API is working
router.get('/', (req, res) => {
    res.json({
        message: 'API is working!',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// User authentication endpoints
router.post('/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const { data: existingUsers, error: checkError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email);

        if (checkError) throw checkError;

        if (existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Register with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (authError) throw authError;

        // Create user in users table
        const { data: userData, error: userError } = await supabase
            .from('users')
            .insert([
                {
                    id: authData.user.id,
                    name,
                    email
                }
            ])
            .select();

        if (userError) throw userError;

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: userData[0],
            token: authData.session.access_token
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
});

router.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Login with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) throw authError;

        // Get user data from users table
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authData.user.id)
            .single();

        if (userError) throw userError;

        res.status(200).json({
            success: true,
            message: 'Login successful',
            user: userData,
            token: authData.session.access_token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid email or password',
            error: error.message
        });
    }
});

// Restaurants endpoints
router.get('/restaurants', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('restaurants')
            .select('*')
            .order('name');

        if (error) throw error;

        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Error fetching restaurants:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch restaurants',
            error: error.message
        });
    }
});

router.get('/restaurants/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('restaurants')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Error fetching restaurant:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch restaurant',
            error: error.message
        });
    }
});

// Get menu for a specific restaurant
router.get('/restaurants/:id/menu', async (req, res) => {
    try {
        const { id } = req.params;

        // Map of restaurant IDs to their menu table names
        const menuTableMap = {
            '1': 'vijs_menu',
            '2': 'sula_indian_restaurant_menu',
            '3': 'agra_tandoori_restaurant_menu',
            '4': 'fishhook_menu',
            '5': 'spice_valley_indian_cuisine_menu',
            '6': 'gians_indian_cuisine_menu',
            '7': 'pabla_curry_house_menu',
            '8': 'shandhar_hut_indian_cuisine_menu',
            '9': 'indias_most_wanted_menu',
            '10': 'tandoori_bites_menu'
        };

        const menuTable = menuTableMap[id];

        if (!menuTable) {
            return res.status(404).json({
                success: false,
                message: 'No menu available for this restaurant'
            });
        }

        const { data, error } = await supabase
            .from(menuTable)
            .select('*')
            .order('category')
            .order('name');

        if (error) throw error;

        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Error fetching menu:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch menu',
            error: error.message
        });
    }
});

// Cart endpoints with token authentication
router.get('/cart', async (req, res) => {
    try {
        // Get auth token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Authorization header required'
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify the token with Supabase
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token',
                error: authError?.message
            });
        }

        // Get cart items for the authenticated user
        const { data, error } = await supabase
            .from('cart_items')
            .select(`
                *,
                restaurants:restaurant_id (
                    id,
                    name
                )
            `)
            .eq('user_id', user.id);

        if (error) throw error;

        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch cart',
            error: error.message
        });
    }
});

// Special endpoint to bypass RLS policies
router.post('/cart/add', async (req, res) => {
    try {
        // Get auth token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Authorization header required'
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify the token with Supabase
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token',
                error: authError?.message
            });
        }

        const { menu_item_id, restaurant_id, item_name, price, quantity } = req.body;

        if (!restaurant_id || !item_name || !price) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Always use the authenticated user's ID
        const user_id = user.id;

        console.log('Adding to cart for user:', user_id);
        console.log('Cart item details:', { menu_item_id, restaurant_id, item_name, price, quantity });

        // Insert the cart item
        const { data, error } = await supabase
            .from('cart_items')
            .insert([{
                user_id,
                menu_item_id: menu_item_id || null,
                restaurant_id,
                item_name,
                price,
                quantity: quantity || 1,
                created_at: new Date().toISOString()
            }])
            .select();

        if (error) {
            console.error('Database error:', error);
            throw error;
        }

        res.status(201).json({
            success: true,
            message: 'Item added to cart',
            data: data[0]
        });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add item to cart',
            error: error.message
        });
    }
});

// Special endpoint to update cart item quantity
router.put('/cart/update/:id', async (req, res) => {
    try {
        // Get auth token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Authorization header required'
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify the token with Supabase
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token',
                error: authError?.message
            });
        }

        const { id } = req.params;
        const { quantity } = req.body;

        if (quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be at least 1'
            });
        }

        // Verify this cart item belongs to the user
        const { data: cartItem, error: fetchError } = await supabase
            .from('cart_items')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;

        if (!cartItem || cartItem.user_id !== user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this cart item'
            });
        }

        // Update the cart item
        const { data, error } = await supabase
            .from('cart_items')
            .update({ quantity })
            .eq('id', id)
            .select();

        if (error) throw error;

        res.json({
            success: true,
            message: 'Cart updated',
            data: data[0]
        });
    } catch (error) {
        console.error('Error updating cart:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update cart',
            error: error.message
        });
    }
});

// Special endpoint to remove from cart
router.delete('/cart/remove/:id', async (req, res) => {
    try {
        // Get auth token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Authorization header required'
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify the token with Supabase
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token',
                error: authError?.message
            });
        }

        const { id } = req.params;

        // Verify this cart item belongs to the user
        const { data: cartItem, error: fetchError } = await supabase
            .from('cart_items')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;

        if (!cartItem || cartItem.user_id !== user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this cart item'
            });
        }

        // Delete the cart item
        const { error } = await supabase
            .from('cart_items')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({
            success: true,
            message: 'Item removed from cart'
        });
    } catch (error) {
        console.error('Error removing from cart:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove item from cart',
            error: error.message
        });
    }
});

export default router; 