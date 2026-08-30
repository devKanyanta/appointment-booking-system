const express = require('express');
const bcrypt = require('bcryptjs');
const { body } = require('express-validator');
const { register, login, logout, getMe } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { User } = require('../models');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2, max: 255 }).withMessage('Name must be 2-255 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('consent').custom((value) => {
      if (value === true || value === 'true') return true;
      throw new Error('Consent is required');
    }),
  ],
  validate,
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

// Admin login uses the same login endpoint but validates admin role
router.post('/admin/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const { Op } = require('sequelize');

      const user = await User.findOne({ where: { email, role: 'admin' } });
      if (!user || !user.is_active) {
        return res.status(401).json({ message: 'Invalid admin credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid admin credentials' });
      }

      const jwt = require('jsonwebtoken');
      const { jwtSecret, jwtExpiry, cookieName, cookieOptions } = require('../config/auth');
      const token = jwt.sign({ id: user.id, role: user.role }, jwtSecret, { expiresIn: jwtExpiry });

      res.cookie(cookieName, token, cookieOptions);

      res.json({
        success: true,
        message: 'Admin login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
