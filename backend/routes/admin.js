import express from 'express';
import {
  getDashboardStats,
  getUsers,
  updateUser,
  getAdminItems,
  deleteItemAdmin,
  getAdminClaims,
  adminApproveClaim,
  adminRejectClaim
} from '../controllers/adminController.js';
import auth from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

router.use(auth);
router.use(adminAuth);

// Dashboard and user management
router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.patch('/users/:userId', updateUser);

// Item management
router.get('/items', getAdminItems);
router.delete('/items/:itemId', deleteItemAdmin);

// Claim management
router.get('/claims', getAdminClaims);
router.patch('/claims/:claimId/approve', adminApproveClaim);
router.patch('/claims/:claimId/reject', adminRejectClaim);

export default router;