const express = require('express');
const { body } = require('express-validator');
const {
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  adminCancelAppointment,
  adminRescheduleAppointment,
  getWorkingHours,
  updateWorkingHours,
  getBlockedPeriods,
  createBlockedPeriod,
  deleteBlockedPeriod,
  getCustomers,
  getCustomerById,
  anonymizeCustomer,
  getDashboardStats,
} = require('../controllers/adminController');
const {
  adminGetServices,
  createService,
  updateService,
  deleteService,
} = require('../controllers/serviceController');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');
const { validate } = require('../middleware/validate');

const router = express.Router();

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Services
router.get('/services', adminGetServices);

router.post(
  '/services',
  [
    body('name').trim().notEmpty().withMessage('Service name is required'),
    body('duration').isInt({ min: 5, max: 480 }).withMessage('Duration must be 5-480 minutes'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  ],
  validate,
  createService
);

router.put(
  '/services/:id',
  [
    body('name').optional().trim().notEmpty().withMessage('Service name is required'),
    body('duration').optional().isInt({ min: 5, max: 480 }).withMessage('Duration must be 5-480 minutes'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  ],
  validate,
  updateService
);

router.delete('/services/:id', deleteService);

// Appointments
router.get('/appointments', getAppointments);
router.get('/appointments/:id', getAppointmentById);

router.put(
  '/appointments/:id/status',
  [
    body('status')
      .isIn(['booked', 'cancelled', 'completed', 'no-show'])
      .withMessage('Invalid status'),
  ],
  validate,
  updateAppointmentStatus
);

router.put('/appointments/:id/cancel', adminCancelAppointment);

router.put(
  '/appointments/:id/reschedule',
  [
    body('date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Valid date is required'),
    body('startTime').matches(/^\d{2}:\d{2}$/).withMessage('Valid time is required'),
  ],
  validate,
  adminRescheduleAppointment
);

// Working Hours
router.get('/availability/working-hours', getWorkingHours);

router.put(
  '/availability/working-hours',
  [
    body('workingHours').isArray({ min: 1, max: 7 }).withMessage('Provide 1-7 day configurations'),
  ],
  validate,
  async (req, res, next) => {
    // Adapt workingHours array to the expected format
    const { workingHours } = req.body;
    if (workingHours && Array.isArray(workingHours)) {
      req.body.hours = workingHours.map(wh => ({
        dayOfWeek: wh.day_of_week,
        openTime: wh.open_time,
        closeTime: wh.close_time,
        isActive: wh.is_active !== undefined ? wh.is_active : true,
      }));
    }
    updateWorkingHours(req, res, next);
  }
);

// Blocked Periods
router.get('/availability/blocked-periods', getBlockedPeriods);

router.post(
  '/availability/blocked-periods',
  [
    body('date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Valid date is required'),
  ],
  validate,
  (req, res, next) => {
    // Adapt snake_case fields to camelCase if needed
    if (req.body.start_time) req.body.startTime = req.body.start_time;
    if (req.body.end_time) req.body.endTime = req.body.end_time;
    createBlockedPeriod(req, res, next);
  }
);

router.delete('/availability/blocked-periods/:id', deleteBlockedPeriod);

// Customers
router.get('/customers', getCustomers);
router.get('/customers/:id', getCustomerById);
router.delete('/customers/:id', anonymizeCustomer);

// Customer deactivation (alias for anonymize)
router.put('/customers/:id/deactivate', anonymizeCustomer);

module.exports = router;
