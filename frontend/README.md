# BC Food Feast Frontend

This directory contains the React frontend application for BC Food Feast, a food ordering and catering platform.

## 📁 Directory Structure

```
frontend/
├── public/                # Static files
│   ├── images/            # Static images
│   ├── favicon.ico        # Site favicon
│   └── index.html         # HTML template
├── src/                   # Source code
│   ├── assets/            # Assets like images, fonts
│   ├── components/        # Reusable UI components
│   │   ├── Header.js      # Navigation header
│   │   ├── Footer.js      # Page footer
│   │   └── ProtectedRoute.js # Auth protection wrapper
│   ├── contexts/          # React contexts
│   │   └── AuthContext.js # Authentication context
│   ├── pages/             # Page components
│   │   ├── HomePage.js
│   │   ├── RestaurantsPage.js
│   │   ├── RestaurantDetailPage.js
│   │   ├── CartPage.js
│   │   ├── CheckoutPage.js
│   │   ├── CateringPage.js
│   │   ├── ContactPage.js
│   │   └── AboutUsPage.js
│   ├── styles/            # CSS styles
│   │   ├── App.css
│   │   ├── Header.css
│   │   └── ...
│   ├── utils/             # Utility functions
│   │   └── supabase.js    # Supabase client
│   ├── App.js             # Main app component
│   └── index.js           # Entry point
├── package.json           # Dependencies
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up environment variables:
   Create a `.env` file in the frontend directory with the following variables:

   ```
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   REACT_APP_API_URL=http://localhost:5000/api
   ```

3. Start the development server:

   ```bash
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000`

## 📦 Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App

## 🔐 Authentication

The application uses Supabase Authentication for user management. The `AuthContext` provides authentication state and methods throughout the application.

## 🛒 Key Features

- **Restaurant Browsing**: View and filter restaurants
- **Menu Exploration**: Browse restaurant menus by category
- **Cart Management**: Add items to cart and manage quantities
- **Checkout Process**: Complete orders with delivery/pickup options
- **Catering Requests**: Submit catering inquiries for events
- **User Profile**: View order history and manage account
- **Featured Items**: Discover popular dishes across restaurants

## 🎨 Styling

The application uses a combination of:

- React Bootstrap for UI components
- Custom CSS for specific styling needs
- React Icons for iconography

## 📱 Responsive Design

The frontend is fully responsive and works on:

- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## 🔄 State Management

- React Context API for global state (auth, cart)
- React useState and useEffect for component-level state

## 🌐 API Integration

The frontend communicates with:

- Supabase for database operations and authentication
- Express backend for additional API endpoints (if needed)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
