import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { isAdmin } from '../middleware/adminCheck.js';
import {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    updateUserByAdmin,
    getUserAddress,
    updateUserAddress,
    updateUserProfile
} from '../controllers/user.controller.js';

const router = express.Router();

// Admin routes
router.get('/admin', verifyToken, isAdmin, getAllUsers);
router.get('/admin/:userId', verifyToken, isAdmin, getUserById);
router.put('/admin/:id', verifyToken, isAdmin, updateUserByAdmin); // Use this for admin user updates
router.delete('/admin/:userId', verifyToken, isAdmin, deleteUser);

// User address routes (authenticated but not admin-only)
router.get('/address', verifyToken, getUserAddress);
router.put('/address', verifyToken, updateUserAddress);
router.put('/update-profile', verifyToken, updateUserProfile);

export const userRoutes = router;