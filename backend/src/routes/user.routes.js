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
  updateUserProfile,
  deleteUserAccount,
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

// User profile routes
router.put('/update-profile', verifyToken, updateUserProfile);

// User account deletion (self-deletion with password confirmation)
router.delete('/delete-account', verifyToken, deleteUserAccount);

export const userRoutes = router;
