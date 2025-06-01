# Clingo - Service Management Platform

A full-stack web application for managing cleaning and maintenance services. Built with React (frontend) and Node.js/Express (backend), featuring user authentication, service booking, provider management, and admin dashboard.

## Features

### User Features

- **User Authentication**: Secure signup/login with email verification
- **Service Discovery**: Browse available cleaning services by category
- **Provider Selection**: Choose from verified service providers
- **Booking System**: Schedule services with custom options and pricing
- **Address Management**: Save and manage service locations with Google Maps integration
- **Order Tracking**: View order history and track service status
- **Payment Integration**: PayPal and card payment options
- **Profile Management**: Update personal information and preferences

### Provider Features

- **Provider Registration**: Register as individual or company
- **Service Offerings**: Configure services with custom pricing
- **Availability Management**: Set working hours and availability
- **Review System**: Receive and manage customer reviews

### Admin Features

- **Dashboard Analytics**: Comprehensive business metrics and charts
- **Service Management**: Create, update, and manage service categories
- **Provider Management**: Approve and manage service providers
- **Order Management**: Monitor and manage all orders
- **User Management**: Manage user accounts and permissions
- **Maintenance Mode**: System-wide maintenance mode control

## Tech Stack

### Frontend

- **React 18** with Vite
- **Tailwind CSS** for styling
- **Zustand** for state management
- **React Router** for navigation
- **Framer Motion** for animations
- **Recharts** for analytics visualization
- **Lucide React** for icons
- **React Hot Toast** for notifications

### Backend

- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Mailtrap** for email services
- **PayPal SDK** for payments
- **Swagger** for API documentation
- **CORS** for cross-origin requests

### Additional Services

- **Google Maps API** for location services
- **PayPal API** for payment processing
- **Mailtrap** for email notifications

## Project Structure

```
clingo/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   │   ├── mailtrap/    # Email configuration
│   │   │   └── swagger.js   # API documentation
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Custom middleware
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   ├── scripts/         # Database seeding scripts
│   │   ├── utils/           # Utility functions
│   │   └── app.js          # Express app configuration
│   ├── .env                # Environment variables
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/           # Custom hooks
│   │   ├── pages/           # Page components
│   │   │   └── Admin/       # Admin dashboard pages
│   │   ├── store/           # Zustand stores
│   │   └── utils/           # Utility functions
│   ├── .env                # Frontend environment variables
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Google Maps API key
- PayPal Developer Account
- Mailtrap Account

### Backend Setup

1. **Navigate to backend directory:**

   ```bash
   cd backend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create environment file:**

   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables:**

   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database
   MONGO_URI=mongodb://localhost:27017/clingo

   # JWT
   JWT_SECRET=your_jwt_secret_here

   # Email Configuration (Mailtrap)
   MAILTRAP_TOKEN=your_mailtrap_token
   MAILTRAP_SENDER_EMAIL=your_verified_sender@domain.com

   # PayPal
   PAYPAL_CLIENT_ID=your_paypal_client_id

   # Frontend URL
   CLIENT_URL=http://localhost:5173
   ```

5. **Start the server:**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory:**

   ```bash
   cd frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create environment file:**

   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables:**

   ```env
   # API Configuration
   VITE_API_URL=http://localhost:5000/api

   # Google Maps
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

   # PayPal
   VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

### Database Setup

1. **Seed initial data (optional):**

   ```bash
   cd backend
   node src/scripts/seedProviders.js
   ```

2. **Create admin user:**
   - Register a new account through the frontend
   - Manually set `isAdmin: true` in the database for the user document

## Usage

### For Customers

1. **Register/Login** to your account
2. **Browse Services** from the homepage
3. **Select a Provider** for your chosen service
4. **Customize Options** and add to cart
5. **Set Address** using Google Maps integration
6. **Schedule Service** with preferred date and time
7. **Complete Payment** via PayPal or card
8. **Track Orders** in your profile

### For Service Providers

1. **Register** as a provider (individual or company)
2. **Configure Services** you offer with custom pricing
3. **Set Availability** and working hours
4. **Manage Reviews** from customers

### For Administrators

1. **Access Admin Dashboard** at `/admin/dashboard`
2. **View Analytics** and business metrics
3. **Manage Services** - create, update, delete
4. **Manage Providers** - approve, modify, remove
5. **Monitor Orders** - track and update status
6. **Manage Users** - user administration
7. **System Settings** - maintenance mode, notifications

## 🔧 API Documentation

The API documentation is available via Swagger UI at:

```
http://localhost:5000/api-docs
```

### Key API Endpoints

#### Authentication

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/forgot-password` - Password reset request
- `GET /api/auth/check-auth` - Check authentication status

#### Services

- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get service by ID
- `POST /api/services` - Create new service (Admin)

#### Providers

- `GET /api/providers` - Get all providers
- `GET /api/providers/service/:serviceId` - Get providers for service
- `POST /api/providers` - Register as provider

#### Orders

- `POST /api/orders` - Create new order
- `GET /api/orders/my-orders` - Get user orders
- `PUT /api/orders/:id/status` - Update order status

## Key Features in Detail

### Authentication System

- JWT-based authentication with HTTP-only cookies
- Email verification with 6-digit codes
- Password reset functionality
- Role-based access control (User, Provider, Admin)

### Service Management

- Dynamic service categories with custom options
- Flexible pricing structure
- Provider-specific pricing overrides
- Service availability management

### Booking System

- Real-time provider availability
- Custom service option selection
- Address management with Google Maps
- Flexible scheduling system

### Payment Integration

- PayPal payment processing
- Order creation and tracking
- Payment status management
- Secure payment handling

### Admin Dashboard

- Comprehensive analytics with charts
- Real-time business metrics
- User and provider management
- System maintenance controls

## Security Features

- **Authentication**: JWT tokens with secure HTTP-only cookies
- **Password Security**: bcrypt hashing with salt rounds
- **Data Validation**: Server-side validation for all inputs
- **CORS Protection**: Configured for specific origins
- **Rate Limiting**: Protection against abuse
- **Maintenance Mode**: System-wide access control

## Deployment

### Backend Deployment

1. Set production environment variables
2. Ensure MongoDB connection is configured
3. Deploy to your preferred platform (Heroku, DigitalOcean, etc.)

### Frontend Deployment

1. Build the production version:
   ```bash
   npm run build
   ```
2. Deploy the `dist` folder to your hosting service

### Environment Configuration

Ensure all production environment variables are properly configured:

- Database connection strings
- API keys for external services
- CORS origins
- JWT secrets

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- React team for the amazing framework
- MongoDB team for the database solution
- PayPal for payment processing
- Google for Maps API
- All open-source contributors

---
