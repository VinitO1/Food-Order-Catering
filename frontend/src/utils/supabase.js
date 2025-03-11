import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and key from environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or key. Check your .env file.');
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to fetch restaurant data
export const fetchRestaurant = async (id) => {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    return { data: null, error };
  }
};

// Helper function to fetch menu items for a restaurant
export const fetchMenuItems = async (restaurantId) => {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('category', { ascending: true })
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    // Process menu data
    const menuItems = data || [];
    const categories = [...new Set(menuItems.map(item => item.category))];
    
    // Group items by category
    const itemsByCategory = {};
    categories.forEach(category => {
      itemsByCategory[category] = menuItems.filter(item => item.category === category);
    });
    
    return { 
      menuItems, 
      categories, 
      itemsByCategory,
      error: null 
    };
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return { 
      menuItems: [], 
      categories: [], 
      itemsByCategory: {},
      error 
    };
  }
};

// Helper function to add item to cart (placeholder)
export const addToCart = async (item, userId) => {
  try {
    // In a real app, you would store this in a cart table
    console.log('Adding to cart:', item);
    
    // For now, just return success
    return { success: true, error: null };
  } catch (error) {
    console.error('Error adding to cart:', error);
    return { success: false, error };
  }
};

export default supabase; 