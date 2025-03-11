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

// Supabase connection test
router.get('/supabase-test', async (req, res) => {
    try {
        const { data, error } = await supabase.from('restaurants').select('id').limit(1);

        if (error) throw error;

        res.json({
            success: true,
            message: 'Supabase connection successful',
            data
        });
    } catch (error) {
        console.error('Supabase connection error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Supabase connection failed',
            error: error.message
        });
    }
});

export default router; 