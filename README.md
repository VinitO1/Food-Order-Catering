# BC Food Feast - Food Ordering & Catering Platform

BC Food Feast is a comprehensive food ordering and catering platform designed for British Columbia restaurants. The application allows users to browse restaurants, order food for delivery or pickup, and request catering services for events.

## 🍽️ Features

### For Customers

- **Restaurant Discovery**: Browse restaurants by location, cuisine type, and ratings
- **Menu Exploration**: View detailed menus with item descriptions, prices, and images
- **Online Ordering**: Place food orders for delivery or pickup
- **Catering Services**: Request catering for events with customizable options
- **Order Tracking**: Real-time updates on order status (pending, approved, delivered)
- **Cart Management**: Add, remove, and update quantities of items in cart
- **Contact Support**: Reach out to customer service through the contact form

## 🛠️ Technology Stack

### Frontend

- **React**: UI library for building the user interface
- **React Router**: For navigation and routing
- **React Bootstrap**: UI component library for responsive design
- **React Icons**: Icon library for visual elements
- **Context API**: For state management
- **CSS**: Custom styling for components

### Backend & Database

- **Supabase**: Backend-as-a-Service for:
  - PostgreSQL database
  - Authentication and user management
  - Row Level Security (RLS) for data protection
  - Storage for images and files
- **Express.js**: Lightweight server for additional API endpoints (optional)


## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/Food-Order-Catering.git
   cd Food-Order-Catering
   ```

2. Install frontend dependencies:

   ```bash
   cd frontend
   npm install
   ```

3. Install backend dependencies (if using the Express backend):

   ```bash
   cd ../backend
   npm install
   ```

4. Set up environment variables:

   - Create a `.env` file in the frontend directory with:
     ```
     REACT_APP_SUPABASE_URL=your_supabase_url
     REACT_APP_SUPABASE_KEY=your_supabase_anon_key
     REACT_APP_API_URL=http://localhost:5000 (if using backend)
     ```

5. Start the development servers:

   ```bash
   # In the backend directory (if using Express backend)
   npm run dev

   # In the frontend directory (in a new terminal)
   npm start
   ```

6. Open your browser and navigate to `http://localhost:3000`

## 📊 Database Schema

The application uses the following main tables in Supabase:

- **users**: User accounts and profiles
- **restaurants**: Restaurant information with details like name, address, cuisine type
- **menu_items**: Food items available at restaurants (or individual menu tables per restaurant)
- **cart_items**: Items in a user's shopping cart with quantity and price
- **orders**: Customer orders with status and payment information
- **order_items**: Individual items in an order
- **catering_requests**: Catering service requests

## 🔐 Security

- **Supabase Authentication**: Email/password authentication for users
- **Row Level Security (RLS)**: Database policies to ensure users can only access their own data
- **Protected Routes**: Frontend route protection for authenticated areas
- **Environment Variables**: Sensitive data stored in environment variables

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


