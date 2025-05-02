import express from 'express';
import { verifyToken } from '../../middleware/verifyToken.js';
import {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  updatePaymentStatus,
  verifyPayPalPayment,
  getAdminOrders,
} from '../../controllers/orderContoller.js';

const router = express.Router();

// All routes need authentication
router.use(verifyToken);

// User order routes
router.post('/', createOrder);
router.get('/my-orders', getUserOrders);

router.get('/:orderId', getOrderById);
router.put('/:orderId/status', updateOrderStatus);
router.put('/:orderId/cancel', cancelOrder);
router.put('/:orderId/payment', updatePaymentStatus);

// PayPal specific route
router.post('/:orderId/verify-paypal', verifyPayPalPayment);

// Admin routes
router.get('/admin/all', getAdminOrders);

export const orderRoutes = router;