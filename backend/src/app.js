import express from 'express';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';
import specs from './config/swagger.js';
import cookieParser from 'cookie-parser';

import { config } from 'dotenv';
import { connectDB } from './mongodb/connectDB.js';

import { authRoutes } from './routes/auth/auth.routes.js';
import { serviceRoutes } from './routes/serviceRoutes.js';
import { providerRoutes } from './routes/providerRoutes.js';
import { orderRoutes } from './routes/orderRoutes.js';
import { userRoutes } from './routes/user.routes.js';
import { analyticsRoutes } from './routes/analyticsRoutes.js';
import settingsRoutes from "./routes/settings.routes.js";

import {maintenanceMode} from "./middleware/maintenanceMode.js";
import {verifyToken} from "./middleware/verifyToken.js";
import {isAdmin} from "./middleware/adminCheck.js";

// Load .env environment
config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json()); // allow us to parse incoming requests:req.body
app.use(cookieParser()); // allow us to parse incoming cookies

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Root route
app.get('/', (req, res) => {
  res.send('Hello app!');
});

// Paypal routes
app.get('/api/keys/paypal', (req, res) => {
  res.send(process.env.PAYPAL_CLIENT_ID || 'sb');
});

// API ROUTES
// Route that must always work
app.use('/api/auth', authRoutes);

// Admin settings route - only admins can access
app.use('/api/settings', verifyToken, isAdmin, settingsRoutes);

// Apply maintenance mode check to all other routes
// This should come after the routes that should always work
app.use('/api', verifyToken, maintenanceMode);

// Routes protected by maintenance mode
app.use('/api/services', serviceRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);


// Error handler (MUST come after all routes)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Server error!');
});

app.listen(PORT, () => {
  connectDB();
  console.log(`Server running on port ${PORT}`);
});
