const express = require('express');
const { body } = require('express-validator');
const { updateProfile, deleteAccount, getAppointments } = require('../controllers/customerController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.use(authenticate);

router.put(
  '/profile',
  [
    body('name').trim().isLength({ min: 2, max: 255 }).withMessage('Name must be 2-255 characters'),
  ],
  validate,
  updateProfile
);

router.delete('/account', deleteAccount);

// Customer appointments (upcoming + history combined)
router.get('/appointments', getAppointments);

module.exports = router;
