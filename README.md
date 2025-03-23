# BC Food Feast - Food Ordering & Catering Platform

BC Food Feast is a comprehensive food ordering and catering platform designed for British Columbia restaurants. The application allows users to browse restaurants, order food for delivery or pickup, and request catering services for events.

## 🍽️ Features

### For Customers

- **Restaurant Discovery**: Browse restaurants by location, cuisine type, and ratings
- **Menu Exploration**: View detailed menus with item descriptions, prices, and images
- **Online Ordering**: Place food orders for delivery or pickup
- **Catering Services**: Request catering for events with customizable options
- **User Profiles**: Save favorite restaurants, view order history, and manage payment methods
- **Order Tracking**: Real-time updates on order status (pending, approved, delivered)
- **Cart Management**: Add, remove, and update quantities of items in cart
- **Contact Support**: Reach out to customer service through the contact form

### For Restaurants (Admin Dashboard)

- **Menu Management**: Easily update menu items, prices, and availability
- **Order Processing**: Receive and manage incoming orders
- **Catering Requests**: Handle catering inquiries and bookings
- **Analytics**: Track sales, popular items, and customer preferences

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

## 📁 Project Structure

```
Food-Order-Catering/
├── frontend/                  # React frontend application
│   ├── public/                # Static files
│   ├── src/                   # Source code
│   │   ├── components/        # Reusable UI components
│   │   ├── contexts/          # React contexts for state management
│   │   ├── pages/             # Page components (Restaurants, Cart, Checkout, etc.)
│   │   ├── styles/            # CSS styles for components
│   │   ├── utils/             # Utility functions and Supabase client
│   │   ├── App.js             # Main app component with routing
│   │   └── index.js           # Entry point
│   ├── .env                   # Environment variables for development
│   ├── .env.production        # Environment variables for production
│   ├── .gitignore             # Git ignore file for frontend
│   ├── package.json           # Frontend dependencies
│   └── cleanup.sh             # Script to prepare for deployment
│
├── backend/                   # Express backend (optional)
│   ├── config/                # Configuration files
│   ├── routes/                # API routes
│   ├── index.js               # Entry point
│   ├── .env                   # Environment variables
│   ├── .gitignore             # Git ignore file for backend
│   └── package.json           # Backend dependencies
│
├── .gitignore                 # Root Git ignore file
├── vercel.json                # Vercel deployment configuration
├── DEPLOYMENT.md              # Detailed deployment instructions
└── README.md                  # Project documentation
```

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

## 🚀 Deployment

### Deploying to Vercel

1. Prepare your project:

   ```bash
   cd frontend
   chmod +x cleanup.sh
   ./cleanup.sh
   ```

2. Create a production environment file:

   ```bash
   cp .env.production.template .env.production
   ```

   Then update with your production Supabase credentials.

3. Deploy using GitHub:
   - Push your code to GitHub
   - Import the repository in Vercel
   - Set environment variables in Vercel dashboard
   - Deploy your project

For detailed deployment instructions, see the [DEPLOYMENT.md](DEPLOYMENT.md) file.

### Updating Supabase Settings

After deployment, update your Supabase authentication settings with your Vercel domain URL in the "Site URL" and "Redirect URLs" fields.

## 🧪 Testing

To run tests:

```bash
cd frontend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- Your Name - Initial work
