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
  deleteOrder,
} from '../controllers/orderController.js';

const router = express.Router();

// Public routes that require only authentication
router.use(verifyToken);

// User order routes
router.post('/', createOrder);
router.get('/my-orders', getUserOrders);
router.get('/:id', getOrderById);

// These routes check for admin OR order owner in the controller
router.put('/:orderId/status', updateOrderStatus);
router.put('/:orderId/cancel', cancelOrder);
router.put('/:orderId/payment', updatePaymentStatus);

// PayPal specific route
router.post('/:orderId/verify-paypal', verifyPayPalPayment);

// Admin only routes
router.get('/admin/all', isAdmin, getAdminOrders);
router.delete('/:orderId', isAdmin, deleteOrder);

export const orderRoutes = router;
