const express = require('express');
const { body } = require('express-validator');
const {
  getServices,
  getServiceById,
  adminGetServices,
  createService,
  updateService,
  deleteService,
} = require('../controllers/serviceController');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');
const { validate } = require('../middleware/validate');

const router = express.Router();

// Public routes
router.get('/', getServices);
router.get('/:id', getServiceById);

// Admin routes
router.get('/admin/all', authenticate, requireAdmin, adminGetServices);

router.post(
  '/admin',
  authenticate,
  requireAdmin,
  [
    body('name').trim().notEmpty().withMessage('Service name is required'),
    body('duration').isInt({ min: 5, max: 480 }).withMessage('Duration must be 5-480 minutes'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  ],
  validate,
  createService
);

router.put(
  '/admin/:id',
  authenticate,
  requireAdmin,
  [
    body('name').trim().notEmpty().withMessage('Service name is required'),
    body('duration').isInt({ min: 5, max: 480 }).withMessage('Duration must be 5-480 minutes'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  ],
  validate,
  updateService
);

router.delete('/admin/:id', authenticate, requireAdmin, deleteService);

module.exports = router;
