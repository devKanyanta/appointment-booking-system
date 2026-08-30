const express = require('express');
const { body } = require('express-validator');
const {
  bookAppointment,
  cancelAppointment,
  rescheduleAppointment,
  getUpcoming,
  getHistory,
} = require('../controllers/appointmentController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

// All appointment routes require authentication
router.use(authenticate);

router.post(
  '/',
  [
    body('service_id').optional().isInt().withMessage('Valid service ID is required'),
    body('serviceId').optional().isInt().withMessage('Valid service ID is required'),
    body('date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Valid date (YYYY-MM-DD) is required'),
    body('start_time').optional().matches(/^\d{2}:\d{2}$/).withMessage('Valid time (HH:MM) is required'),
    body('startTime').optional().matches(/^\d{2}:\d{2}$/).withMessage('Valid time (HH:MM) is required'),
  ],
  validate,
  bookAppointment
);

router.get('/upcoming', getUpcoming);
router.get('/history', getHistory);

router.put('/:id/cancel', cancelAppointment);
router.put(
  '/:id/reschedule',
  [
    body('date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Valid date (YYYY-MM-DD) is required'),
    body('start_time').optional().matches(/^\d{2}:\d{2}$/).withMessage('Valid time (HH:MM) is required'),
    body('startTime').optional().matches(/^\d{2}:\d{2}$/).withMessage('Valid time (HH:MM) is required'),
  ],
  validate,
  rescheduleAppointment
);

module.exports = router;
