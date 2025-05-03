import express from 'express';
import { verifyToken } from "../middleware/verifyToken.js";
import {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  searchServices,
  // seedServices,
} from '../controllers/serviceController.js';

const router = express.Router();

// Public routes
router.get('/', getAllServices);
router.get('/search', searchServices);
router.get('/:serviceId', getServiceById);

// Protected routes (admin only)
router.post('/', verifyToken, createService);
router.put('/:serviceId', verifyToken, updateService);
router.delete('/:serviceId', verifyToken, deleteService);

// Development route for seeding data
// router.post('/seed', seedServices);

export const serviceRoutes = router;
