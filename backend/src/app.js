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
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

// Error handler (MUST come after all routes)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Server error!');
});

app.listen(PORT, () => {
  connectDB();
  console.log(`Server running on port ${PORT}`);
});
