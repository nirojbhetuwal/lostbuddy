import express from 'express';
import { body } from 'express-validator';
import {
  submitClaim,
  getMyItemClaims,
  getMyClaims,
  approveClaim,
  rejectClaim,
  cancelClaim
} from '../controllers/claimController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const claimValidation = [
  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ max: 500 })
    .withMessage('Message cannot exceed 500 characters')
];

const rejectValidation = [
  body('rejectionReason')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Rejection reason cannot exceed 200 characters')
];

// Apply auth to all routes
router.use(auth);

// Routes
router.post('/item/:itemId', claimValidation, submitClaim);
router.get('/my-items', getMyItemClaims);
router.get('/my-claims', getMyClaims);
router.patch('/:claimId/approve', approveClaim);
router.patch('/:claimId/reject', rejectValidation, rejectClaim);
router.patch('/:claimId/cancel', cancelClaim);

export default router;