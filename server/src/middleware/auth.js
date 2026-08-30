const jwt = require('jsonwebtoken');
const { jwtSecret, cookieName } = require('../config/auth');
const { User } = require('../models');

/**
 * Extract JWT token from cookie or Authorization header
 */
function extractToken(req) {
  // First try cookie
  const cookieToken = req.cookies && req.cookies[cookieName];
  if (cookieToken) return cookieToken;

  // Then try Authorization header (Bearer token)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  return null;
}

const authenticate = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password_hash'] },
    });

    if (!user || !user.is_active) {
      return res.status(401).json({ message: 'User not found or deactivated' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired, please login again' });
    }
    return res.status(401).json({ message: 'Invalid authentication token' });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password_hash'] },
    });

    if (user && user.is_active) {
      req.user = user;
    }
  } catch {
    // Token invalid - continue without auth
  }
  next();
};

module.exports = { authenticate, optionalAuth };
