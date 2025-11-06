import express from 'express';
import { body } from 'express-validator';
import {
  createItem,
  getItems,
  getItem,
  getMyItems,
  updateItem,
  deleteItem
} from '../controllers/itemController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const itemValidation = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('category')
    .isIn(['electronics', 'documents', 'clothing', 'accessories', 'bags', 'books', 'keys', 'jewelry', 'pets', 'other'])
    .withMessage('Invalid category'),
  body('type')
    .isIn(['lost', 'found'])
    .withMessage('Type must be either lost or found'),
  body('location')
    .notEmpty()
    .withMessage('Location is required'),
  body('date')
    .isISO8601()
    .withMessage('Valid date is required')
];

// Apply auth to all routes
router.use(auth);

// Routes
router.post('/', itemValidation, createItem);
router.get('/', getItems);
router.get('/my-items', getMyItems);
router.get('/:id', getItem);
router.put('/:id', itemValidation, updateItem);
router.delete('/:id', deleteItem);

export default router;