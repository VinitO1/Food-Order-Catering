# BC Food Feast Database

This directory contains database scripts, migrations, and documentation for the BC Food Feast application.

## 📊 Database Schema

The application uses Supabase (PostgreSQL) with the following table structure:

### Core Tables

#### `users`

Stores user account information.

- `id` (UUID, PK): User ID from Supabase Auth
- `name` (TEXT): User's full name
- `email` (TEXT): User's email address
- `phone` (TEXT): User's phone number
- `address` (TEXT): User's address
- `city` (TEXT): User's city
- `province` (TEXT): User's province
- `postal_code` (TEXT): User's postal code
- `created_at` (TIMESTAMP): Account creation timestamp
- `updated_at` (TIMESTAMP): Last update timestamp

#### `restaurants`

Stores restaurant information.

- `id` (SERIAL, PK): Restaurant ID
- `name` (TEXT): Restaurant name
- `description` (TEXT): Restaurant description
- `address` (TEXT): Restaurant address
- `city` (TEXT): Restaurant city
- `province` (TEXT): Restaurant province
- `postal_code` (TEXT): Restaurant postal code
- `phone` (TEXT): Restaurant phone number
- `email` (TEXT): Restaurant email
- `website` (TEXT): Restaurant website
- `cuisine_type` (TEXT): Type of cuisine
- `price_range` (TEXT): Price range (e.g., $, $$, $$$)
- `rating` (NUMERIC): Average rating
- `image_url` (TEXT): Restaurant image URL
- `hours` (JSONB): Operating hours
- `catering_available` (BOOLEAN): Whether catering is available
- `created_at` (TIMESTAMP): Creation timestamp
- `updated_at` (TIMESTAMP): Last update timestamp

#### `menu_items`

Stores menu items for restaurants.

- `id` (SERIAL, PK): Menu item ID
- `restaurant_id` (INTEGER, FK): Reference to restaurants.id
- `name` (TEXT): Item name
- `description` (TEXT): Item description
- `price` (NUMERIC): Item price
- `category` (TEXT): Item category (e.g., Starters, Mains, Desserts)
- `image_url` (TEXT): Item image URL
- `is_vegetarian` (BOOLEAN): Whether the item is vegetarian
- `is_vegan` (BOOLEAN): Whether the item is vegan
- `is_gluten_free` (BOOLEAN): Whether the item is gluten-free
- `spice_level` (INTEGER): Spice level (0-5)
- `is_featured` (BOOLEAN): Whether the item is featured
- `created_at` (TIMESTAMP): Creation timestamp
- `updated_at` (TIMESTAMP): Last update timestamp

### Order Management

#### `cart_items`

Stores items in a user's shopping cart.

- `id` (SERIAL, PK): Cart item ID
- `user_id` (UUID, FK): Reference to users.id
- `menu_item_id` (INTEGER, FK): Reference to menu_items.id
- `quantity` (INTEGER): Quantity of the item
- `special_instructions` (TEXT): Special instructions
- `created_at` (TIMESTAMP): Creation timestamp
- `updated_at` (TIMESTAMP): Last update timestamp

#### `orders`

Stores order information.

- `id` (SERIAL, PK): Order ID
- `user_id` (UUID, FK): Reference to users.id
- `restaurant_id` (INTEGER, FK): Reference to restaurants.id
- `order_number` (TEXT): Unique order number
- `status` (TEXT): Order status (pending, confirmed, preparing, ready, delivered, completed, cancelled)
- `subtotal` (NUMERIC): Order subtotal
- `tax` (NUMERIC): Tax amount
- `delivery_fee` (NUMERIC): Delivery fee
- `tip` (NUMERIC): Tip amount
- `total` (NUMERIC): Total amount
- `payment_method` (TEXT): Payment method
- `delivery_address` (TEXT): Delivery address
- `delivery_city` (TEXT): Delivery city
- `delivery_province` (TEXT): Delivery province
- `delivery_postal_code` (TEXT): Delivery postal code
- `delivery_instructions` (TEXT): Delivery instructions
- `is_delivery` (BOOLEAN): Whether it's delivery or pickup
- `requested_time` (TIMESTAMP): Requested delivery/pickup time
- `created_at` (TIMESTAMP): Creation timestamp
- `updated_at` (TIMESTAMP): Last update timestamp

#### `order_items`

Stores items in an order.

- `id` (SERIAL, PK): Order item ID
- `order_id` (INTEGER, FK): Reference to orders.id
- `menu_item_id` (INTEGER, FK): Reference to menu_items.id
- `name` (TEXT): Item name at time of order
- `price` (NUMERIC): Item price at time of order
- `quantity` (INTEGER): Quantity of the item
- `special_instructions` (TEXT): Special instructions
- `created_at` (TIMESTAMP): Creation timestamp

### Additional Features

#### `catering_requests`

Stores catering service requests.

- `id` (SERIAL, PK): Catering request ID
- `user_id` (UUID, FK): Reference to users.id
- `restaurant_id` (INTEGER, FK): Reference to restaurants.id
- `event_name` (TEXT): Name of the event
- `event_date` (TIMESTAMP): Date of the event
- `event_time` (TEXT): Time of the event
- `num_guests` (INTEGER): Number of guests
- `address` (TEXT): Event address
- `city` (TEXT): Event city
- `province` (TEXT): Event province
- `postal_code` (TEXT): Event postal code
- `phone` (TEXT): Contact phone
- `email` (TEXT): Contact email
- `occasion` (TEXT): Type of occasion
- `dietary_restrictions` (TEXT): Dietary restrictions
- `additional_notes` (TEXT): Additional notes
- `status` (TEXT): Request status (pending, confirmed, completed, cancelled)
- `created_at` (TIMESTAMP): Creation timestamp
- `updated_at` (TIMESTAMP): Last update timestamp

#### `contact_messages`

Stores customer inquiries and feedback.

- `id` (SERIAL, PK): Message ID
- `name` (TEXT): Sender's name
- `email` (TEXT): Sender's email
- `phone` (TEXT): Sender's phone
- `subject` (TEXT): Message subject
- `message` (TEXT): Message content
- `status` (TEXT): Message status (unread, read, replied)
- `created_at` (TIMESTAMP): Creation timestamp
- `updated_at` (TIMESTAMP): Last update timestamp

## 🔐 Row Level Security (RLS)

Supabase RLS policies are implemented to ensure data security:

- Users can only view and manage their own data
- Restaurant data is publicly readable but only editable by admins
- Menu items are publicly readable but only editable by restaurant owners and admins
- Orders are only visible to the user who placed them and the restaurant that received them

## 📜 SQL Scripts

This directory contains the following SQL scripts:

- `schema.sql`: Creates all tables and relationships
- `rls_policies.sql`: Sets up Row Level Security policies
- `seed_data.sql`: Populates the database with initial data
- `migrations/`: Database migration scripts

## 🔄 Database Migrations

When making changes to the database schema:

1. Create a new migration file in the `migrations/` directory
2. Name it with a timestamp and description (e.g., `20240310_add_catering_available_column.sql`)
3. Include both the changes to make (`UP`) and how to revert them (`DOWN`)
4. Document the changes in this README

## 📊 Entity Relationship Diagram

An Entity Relationship Diagram (ERD) is available in the `docs/` directory at the root of the project.
