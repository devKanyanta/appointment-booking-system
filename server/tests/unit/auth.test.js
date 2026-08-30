const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../../src/models');
const { createUser, cleanupDatabase } = require('../factories');

describe('Auth', () => {
  beforeAll(async () => {
    await User.sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await cleanupDatabase();
    await User.sequelize.close();
  });

  beforeEach(async () => {
    await cleanupDatabase();
  });

  describe('User Registration', () => {
    test('should create a user with hashed password', async () => {
      const password = 'Password123!';
      const passwordHash = await bcrypt.hash(password, 12);
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password_hash: passwordHash,
        phone: '+1234567890',
        role: 'customer',
      };

      const user = await User.create(userData);

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
      expect(user.role).toBe('customer');
      expect(user.is_active).toBe(true);

      // Password should be hashed
      expect(user.password_hash).not.toBe(password);
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      expect(isValidPassword).toBe(true);
    });

    test('should not allow duplicate emails', async () => {
      const passwordHash = await bcrypt.hash('Password123!', 12);
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password_hash: passwordHash,
        role: 'customer',
      };

      await User.create(userData);

      await expect(User.create(userData)).rejects.toThrow();
    });

    test('should validate email format', async () => {
      const passwordHash = await bcrypt.hash('Password123!', 12);
      const userData = {
        name: 'John Doe',
        email: 'invalid-email',
        password_hash: passwordHash,
        role: 'customer',
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    test('should require password_hash', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        role: 'customer',
      };

      await expect(User.create(userData)).rejects.toThrow();
    });
  });

  describe('JWT Token Generation', () => {
    test('should generate a valid JWT token', () => {
      const payload = {
        userId: 1,
        email: 'test@example.com',
        role: 'customer',
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET || 'test-secret', {
        expiresIn: '24h',
      });

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });

    test('should include expiration in token', () => {
      const payload = {
        userId: 1,
        email: 'test@example.com',
        role: 'customer',
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET || 'test-secret', {
        expiresIn: '24h',
      });

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });

    test('should reject invalid tokens', () => {
      expect(() => {
        jwt.verify('invalid-token', process.env.JWT_SECRET || 'test-secret');
      }).toThrow();
    });
  });

  describe('Password Comparison', () => {
    test('should correctly compare passwords', async () => {
      const password = 'Password123!';
      const passwordHash = await bcrypt.hash(password, 12);
      const user = await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        password_hash: passwordHash,
        role: 'customer',
      });

      // Valid password
      const isValid = await bcrypt.compare(password, user.password_hash);
      expect(isValid).toBe(true);

      // Invalid password
      const isInvalid = await bcrypt.compare('WrongPassword', user.password_hash);
      expect(isInvalid).toBe(false);
    });

    test('should handle different password hashing rounds', async () => {
      const password = 'Password123!';
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        password_hash: passwordHash,
        role: 'customer',
      });

      // Password should still be valid regardless of bcrypt rounds
      const isValid = await bcrypt.compare(password, user.password_hash);
      expect(isValid).toBe(true);
    });
  });

  describe('User Roles', () => {
    test('should create customer by default', async () => {
      const passwordHash = await bcrypt.hash('Password123!', 12);
      const user = await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        password_hash: passwordHash,
      });

      expect(user.role).toBe('customer');
    });

    test('should create admin user', async () => {
      const passwordHash = await bcrypt.hash('Admin123!', 12);
      const user = await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password_hash: passwordHash,
        role: 'admin',
      });

      expect(user.role).toBe('admin');
    });

    test('should not allow invalid roles', async () => {
      const passwordHash = await bcrypt.hash('Password123!', 12);
      const userData = {
        name: 'Invalid User',
        email: 'invalid@example.com',
        password_hash: passwordHash,
        role: 'invalid_role',
      };

      await expect(User.create(userData)).rejects.toThrow();
    });
  });
});
