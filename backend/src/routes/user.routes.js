import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { isAdmin } from '../middleware/adminCheck.js';
import {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    updateUserByAdmin
} from '../controllers/user.controller.js';

const router = express.Router();

router.get('/admin', verifyToken, isAdmin, getAllUsers);  // This will return all users for the admin dashboard
router.get('/admin/:userId', verifyToken, isAdmin, getUserById);
router.put('/admin/:id', verifyToken, isAdmin, updateUserByAdmin); // Use this for admin user updates
router.delete('/admin/:userId', verifyToken, isAdmin, deleteUser);

export const userRoutes = router;