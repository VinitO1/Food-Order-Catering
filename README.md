# BC Food Feast - Food Ordering & Catering Platform

![BC Food Feast Logo](frontend/public/logo.png)

BC Food Feast is a comprehensive food ordering and catering platform designed for British Columbia restaurants. The application allows users to browse restaurants, order food for delivery or pickup, and request catering services for events.

## 🍽️ Features

### For Customers

- **Restaurant Discovery**: Browse restaurants by location, cuisine type, and ratings
- **Menu Exploration**: View detailed menus with item descriptions, prices, and images
- **Online Ordering**: Place food orders for delivery or pickup
- **Catering Services**: Request catering for events with customizable options
- **User Profiles**: Save favorite restaurants, view order history, and manage payment methods
- **Featured Items**: Discover popular dishes across different categories
- **Contact Support**: Reach out to customer service through the contact form

### For Restaurants

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

### Backend

- **Express.js**: Lightweight server for API endpoints
- **Supabase**: Backend-as-a-Service for database, authentication, and storage
- **PostgreSQL**: Relational database (via Supabase)
- **Node.js**: JavaScript runtime environment

### Authentication

- **Supabase Auth**: Email/password authentication
- **Row Level Security**: For data protection and user-specific content

## 📁 Project Structure

```
cateringfoodreservatiron/
├── frontend/                  # React frontend application
│   ├── public/                # Static files
│   └── src/                   # Source code
│       ├── components/        # Reusable UI components
│       ├── contexts/          # React contexts
│       ├── pages/             # Page components
│       ├── styles/            # CSS styles
│       ├── utils/             # Utility functions
│       └── App.js             # Main app component
│
├── backend/                   # Express backend
│   ├── config/                # Configuration files
│   ├── routes/                # API routes
│   ├── index.js               # Entry point
│   └── .env                   # Environment variables
│
├── database/                  # Database scripts and migrations
├── .gitignore                 # Git ignore file
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
   git clone https://github.com/yourusername/cateringfoodreservatiron.git
   cd cateringfoodreservatiron
   ```

2. Install frontend dependencies:

   ```bash
   cd frontend
   npm install
   ```

3. Install backend dependencies:

   ```bash
   cd ../backend
   npm install
   ```

4. Set up environment variables:

   - Create a `.env` file in the frontend directory based on `.env.example`
   - Update the backend `.env` file with your Supabase credentials

5. Start the development servers:

   ```bash
   # In the backend directory
   npm run dev

   # In the frontend directory (in a new terminal)
   npm start
   ```

6. Open your browser and navigate to `http://localhost:3000`

## 📊 Database Schema

The application uses the following main tables in Supabase:

- **users**: User accounts and profiles
- **restaurants**: Restaurant information
- **menu_items**: Food items available at restaurants
- **orders**: Customer orders
- **order_items**: Individual items in an order
- **cart_items**: Items in a user's shopping cart
- **catering_requests**: Catering service requests
- **contact_messages**: Customer inquiries and feedback

## 🔐 Authentication

The application uses Supabase Authentication for user management. Row Level Security (RLS) policies are implemented to ensure users can only access their own data.

## 📱 Responsive Design

BC Food Feast is designed to work seamlessly across devices of all sizes:

- Desktop computers
- Tablets
- Mobile phones

## 🌐 Deployment

### Frontend Deployment

The frontend can be deployed to services like Vercel, Netlify, or AWS Amplify.

### Backend Deployment

The backend can be deployed to services like Heroku, AWS Elastic Beanstalk, or Digital Ocean.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

