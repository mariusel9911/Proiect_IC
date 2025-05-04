// In routes/analyticsRoutes.js (create this new file)
import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { isAdmin } from '../middleware/adminCheck.js';
import { getAnalytics } from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/', verifyToken, isAdmin, getAnalytics);

export const analyticsRoutes = router;
