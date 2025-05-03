// In serviceRoutes.js
import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { isAdmin } from '../middleware/adminCheck.js';
import {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  searchServices,
} from '../controllers/serviceController.js';

const router = express.Router();

// Public routes
router.get('/', getAllServices);
router.get('/search', searchServices);
router.get('/:serviceId', getServiceById);

// Protected routes (admin only)
router.post('/', verifyToken, isAdmin, createService);
router.put('/:serviceId', verifyToken, isAdmin, updateService);
router.delete('/:serviceId', verifyToken, isAdmin, deleteService);

export const serviceRoutes = router;
