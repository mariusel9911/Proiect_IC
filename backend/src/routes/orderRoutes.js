// In orderRoutes.js
import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { isAdmin } from '../middleware/adminCheck.js';
import {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  updatePaymentStatus,
  verifyPayPalPayment,
  getAdminOrders,
  deleteOrder, // Add this import
} from '../controllers/orderController.js';

const router = express.Router();

// All routes need authentication
router.use(verifyToken);

// User order routes
router.post('/', createOrder);
router.get('/my-orders', getUserOrders);

// This route should come after any routes with additional path segments
router.get('/:id', getOrderById);
router.put('/:orderId/status', updateOrderStatus);
router.put('/:orderId/cancel', cancelOrder);
router.put('/:orderId/payment', updatePaymentStatus);

// PayPal specific route
router.post('/:orderId/verify-paypal', verifyPayPalPayment);

// Admin routes
router.get('/admin/all', isAdmin, getAdminOrders);
router.delete('/:orderId', isAdmin, deleteOrder); // Add this line

export const orderRoutes = router;
