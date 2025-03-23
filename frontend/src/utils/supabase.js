import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

// Get Supabase URL and key from environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Log environment variables for debugging
console.log('Environment variables:');
console.log('- REACT_APP_SUPABASE_URL:', supabaseUrl || 'Not set');
console.log('- REACT_APP_SUPABASE_KEY:', supabaseKey ? 'Set (hidden)' : 'Not set');
console.log('- REACT_APP_API_URL:', apiUrl);

// Validate environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or key. Check your .env file.');
  // For development, set fallback values if environment variables are missing
  if (!supabaseUrl && process.env.NODE_ENV === 'development') {
    console.warn('Using fallback Supabase URL for development');
    // You can set a default URL here for development purposes
  }
  if (!supabaseKey && process.env.NODE_ENV === 'development') {
    console.warn('Using fallback Supabase key for development');
    // You can set a default key here for development purposes
  }
}

// Initialize Supabase client
let supabase;
try {
  console.log('Initializing Supabase client with URL:', supabaseUrl);
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('Supabase client initialized successfully');
} catch (error) {
  console.error('Error initializing Supabase client:', error);
  // Create an empty client that logs errors for all operations
  supabase = {
    from: () => {
      console.error('Supabase client not properly initialized');
      return {
        select: () => Promise.resolve({ data: null, error: new Error('Supabase client not initialized') }),
        insert: () => Promise.resolve({ data: null, error: new Error('Supabase client not initialized') }),
        update: () => Promise.resolve({ data: null, error: new Error('Supabase client not initialized') }),
        delete: () => Promise.resolve({ data: null, error: new Error('Supabase client not initialized') }),
        eq: () => ({ select: () => Promise.resolve({ data: null, error: new Error('Supabase client not initialized') }) })
      };
    },
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: new Error('Supabase client not initialized') }),
      signUp: () => Promise.resolve({ data: { user: null }, error: new Error('Supabase client not initialized') }),
      signIn: () => Promise.resolve({ data: { user: null }, error: new Error('Supabase client not initialized') }),
      signOut: () => Promise.resolve({ error: new Error('Supabase client not initialized') }),
      onAuthStateChange: () => ({ data: { subscription: null } })
    }
  };
}

// Initialize axios for API calls
axios.defaults.baseURL = apiUrl;

// Map of restaurant IDs to their menu table names
export const RESTAURANT_MENU_TABLES = {
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

// Helper function to fetch restaurant data
export const fetchRestaurant = async (id) => {
  try {
    console.log(`Fetching restaurant with ID: ${id} from Supabase`);
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching restaurant:', error);
      throw error;
    }

    console.log('Restaurant data fetched:', data);
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    return { data: null, error };
  }
};

// Helper function to fetch menu items for a restaurant
export const fetchMenuItems = async (restaurantId) => {
  try {
    console.log(`Fetching menu items for restaurant ID: ${restaurantId}`);
    const menuTableName = RESTAURANT_MENU_TABLES[restaurantId];

    if (!menuTableName) {
      console.error(`No menu table found for restaurant ID ${restaurantId}`);
      throw new Error(`No menu table found for restaurant ID ${restaurantId}`);
    }

    console.log(`Using menu table: ${menuTableName}`);
    const { data, error } = await supabase
      .from(menuTableName)
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching menu items:', error);
      throw error;
    }

    // Process menu data
    const menuItems = data || [];
    console.log(`Fetched ${menuItems.length} menu items`);

    // Extract unique categories
    const categories = [...new Set(menuItems.map(item => item.category))];
    console.log(`Found ${categories.length} categories: ${categories.join(', ')}`);

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

// Add item to cart
export const addToCart = async (menuItem, userId, restaurantId) => {
  try {
    // Check for authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      console.error("Authentication required:", sessionError || "No valid session found");
      throw new Error("Authentication required: No valid session found");
    }

    console.log(`Adding item to cart: ${menuItem.name} for user ${userId} from restaurant ${restaurantId}`);
    console.log('Menu item details:', menuItem);

    // Get the menu table name for this restaurant
    const menuTableName = RESTAURANT_MENU_TABLES[restaurantId];
    if (!menuTableName) {
      console.error(`No menu table found for restaurant ID ${restaurantId}`);
      throw new Error(`Failed to add item to cart: Cannot determine menu table for restaurant ID ${restaurantId}`);
    }

    // Check if item already exists in cart by item_name and restaurant_id
    const { data: existingItems, error: existingError } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)
      .eq('item_name', menuItem.name)
      .eq('restaurant_id', restaurantId);

    if (existingError) {
      console.error('Error checking existing cart items:', existingError);
      throw new Error(`Failed to check existing cart items: ${existingError.message}`);
    }

    console.log('Existing items check result:', existingItems);

    if (existingItems && existingItems.length > 0) {
      // Item already exists, update quantity
      const existingItem = existingItems[0];
      const newQuantity = existingItem.quantity + 1;
      console.log(`Updating existing cart item (ID: ${existingItem.id}) quantity to ${newQuantity}`);

      const { data, error } = await supabase
        .from('cart_items')
        .update({
          quantity: newQuantity,
          // Use current timestamp for updated_at if the field exists
          ...(existingItem.hasOwnProperty('updated_at') ? { updated_at: new Date().toISOString() } : {})
        })
        .eq('id', existingItem.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating cart item quantity:', error);
        throw new Error(`Failed to update cart item: ${error.message}`);
      }

      console.log('Cart item updated:', data);
      return { success: true, data, message: 'Item quantity updated in cart' };
    } else {
      // Add new item to cart
      console.log('Adding new item to cart');

      // Prepare the cart item data
      const cartItemData = {
        user_id: userId,
        restaurant_id: restaurantId,
        menu_table_name: menuTableName,
        item_id: menuItem.id,
        item_name: menuItem.name,
        item_price: parseFloat(menuItem.price || menuItem.item_price),
        quantity: 1,
        created_at: new Date().toISOString()
      };

      console.log('New cart item data:', cartItemData);

      const { data, error } = await supabase
        .from('cart_items')
        .insert(cartItemData)
        .select()
        .single();

      if (error) {
        console.error('Error adding to cart:', error);
        throw new Error(`Failed to add item to cart: ${error.message}`);
      }

      console.log('Item added to cart:', data);
      return { success: true, data, message: 'Item added to cart' };
    }
  } catch (err) {
    console.error('Error adding to cart:', err);
    return { success: false, error: err.message };
  }
};

// Get user's cart items
export const getUserCart = async (userId) => {
  try {
    // Check for authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      console.error("Authentication required:", sessionError || "No valid session found");
      throw new Error("Authentication required: No valid session found");
    }

    console.log(`Fetching cart for user: ${userId}`);

    // Fetch cart items
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', userId);

    if (cartError) {
      console.error('Error fetching cart items:', cartError);
      throw new Error(`Failed to fetch cart items: ${cartError.message}`);
    }

    console.log(`Found ${cartItems?.length || 0} cart items for user ${userId}`);

    // If there are no cart items, return empty array
    if (!cartItems || cartItems.length === 0) {
      return { success: true, data: [] };
    }

    // Extract unique restaurant IDs from cart items
    const restaurantIds = [...new Set(cartItems.map(item => item.restaurant_id))];
    console.log(`Cart items found from ${restaurantIds.length} restaurants:`, restaurantIds);

    // Fetch restaurant data for these IDs
    const { data: restaurants, error: restaurantError } = await supabase
      .from('restaurants')
      .select('*')
      .in('id', restaurantIds);

    if (restaurantError) {
      console.error('Error fetching restaurant data:', restaurantError);
      console.log('Continuing without restaurant details');
    }

    console.log(`Found ${restaurants?.length || 0} restaurants`);

    // Create a map for quick restaurant lookup
    const restaurantMap = {};
    if (restaurants && restaurants.length > 0) {
      restaurants.forEach(restaurant => {
        restaurantMap[restaurant.id] = {
          ...restaurant,
          // Format province properly
          province: restaurant.province === 'British Columbia' ? 'BC' : restaurant.province,
          // Add default image based on ID
          image_url: getDefaultRestaurantImage(restaurant.id),
          // Add default cuisine type
          cuisine_type: 'Indian'
        };
      });
    }

    // Process the cart items to include restaurant data and handle missing fields
    const processedData = cartItems.map(item => {
      // Get associated restaurant or create default one
      const restaurant = restaurantMap[item.restaurant_id] || {
        id: item.restaurant_id,
        name: `Restaurant ${item.restaurant_id}`,
        city: 'Vancouver',
        province: 'BC',
        image_url: getDefaultRestaurantImage(item.restaurant_id),
        cuisine_type: 'Indian'
      };

      // Fix price field mapping - the database uses 'price' but our code might expect 'item_price'
      const fixedItem = {
        ...item,
        item_price: item.item_price || item.price, // Use item_price if available, otherwise use price
        restaurants: restaurant
      };

      return fixedItem;
    });

    console.log(`Processed ${processedData.length} cart items with restaurant data`);
    return { success: true, data: processedData };
  } catch (err) {
    console.error('Error fetching cart:', err);
    return { success: false, data: [], error: err.message };
  }
};

// Helper function to get default restaurant image
function getDefaultRestaurantImage(restaurantId) {
  const DEFAULT_IMAGES = {
    '1': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070',
    '2': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070',
    '3': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=2074',
    '4': 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=2070',
    '5': 'https://images.unsplash.com/photo-1585937421612-70a008356c36?q=80&w=2036',
    '6': 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=2070',
    '7': 'https://images.unsplash.com/photo-1690303587192-e4a51ff1c1e5?q=80&w=2070',
    '8': 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=2074',
    '9': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=2025',
    '10': 'https://images.unsplash.com/photo-1615398562477-8572aa0a4c48?q=80&w=2069',
  };

  return DEFAULT_IMAGES[restaurantId] || 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=2074';
}

// Update cart item quantity
export const updateCartItemQuantity = async (cartItemId, quantity) => {
  try {
    // Check for authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      console.error("Authentication required:", sessionError || "No valid session found");
      throw new Error("Authentication required: No valid session found");
    }

    console.log(`Updating cart item ${cartItemId} to quantity ${quantity}`);

    if (quantity < 1) {
      throw new Error('Quantity must be at least 1');
    }

    const { data, error } = await supabase
      .from('cart_items')
      .update({
        quantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', cartItemId)
      .select()
      .single();

    if (error) {
      console.error('Error updating cart item:', error);
      throw new Error(`Failed to update cart item: ${error.message}`);
    }

    return { success: true, data };
  } catch (err) {
    console.error('Error updating cart item:', err);
    return { success: false, error: err.message };
  }
};

// Remove item from cart
export const removeFromCart = async (cartItemId) => {
  try {
    // Check for authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      console.error("Authentication required:", sessionError || "No valid session found");
      throw new Error("Authentication required: No valid session found");
    }

    console.log(`Removing item ${cartItemId} from cart`);

    const { data, error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId)
      .select();

    if (error) {
      console.error('Error removing from cart:', error);
      throw new Error(`Failed to remove item from cart: ${error.message}`);
    }

    return { success: true, data };
  } catch (err) {
    console.error('Error removing from cart:', err);
    return { success: false, error: err.message };
  }
};

export default supabase; 