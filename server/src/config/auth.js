require('dotenv').config();

module.exports = {
  jwtSecret: process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? undefined : 'kairos-local-development-secret-change-before-deploying'),
  jwtExpiry: process.env.JWT_EXPIRY || '24h',
  bcryptSaltRounds: 12,
  cookieName: 'kairos_token',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
};
