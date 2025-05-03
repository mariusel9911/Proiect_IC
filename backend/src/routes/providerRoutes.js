// In providerRoutes.js
import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { isAdmin } from '../middleware/adminCheck.js';
import {
  getAllProviders,
  getProviderById,
  getProvidersForService,
  createProvider,
  updateProvider,
  deleteProvider, // Make sure to import deleteProvider
  addProviderReview,
} from '../controllers/providerController.js';

const router = express.Router();

// Public routes
router.get('/', getAllProviders);
router.get('/:providerId', getProviderById);
router.get('/service/:serviceId', getProvidersForService);

// Protected routes (require authentication)
router.post('/', verifyToken, createProvider);
router.post('/:providerId/reviews', verifyToken, addProviderReview);

// Admin routes - need both authentication and admin check
router.put('/:providerId', verifyToken, isAdmin, updateProvider);
router.delete('/:providerId', verifyToken, isAdmin, deleteProvider); // Add this line

export const providerRoutes = router;
