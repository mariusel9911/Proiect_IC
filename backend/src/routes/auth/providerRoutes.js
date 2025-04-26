import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import {
  getAllProviders,
  getProviderById,
  getProvidersForService,
  createProvider,
  updateProvider,
  addProviderReview,
  seedProviders,
} from '../controllers/providerController.js';

const router = express.Router();

// Public routes
router.get('/', getAllProviders);
router.get('/:providerId', getProviderById);
router.get('/service/:serviceId', getProvidersForService);

// Protected routes (require authentication)
router.use(verifyToken);
router.post('/', createProvider);
router.put('/:providerId', updateProvider);
router.post('/:providerId/reviews', addProviderReview);

// Development route for seeding data
router.post('/seed', seedProviders);

export const providerRoutes = router;
