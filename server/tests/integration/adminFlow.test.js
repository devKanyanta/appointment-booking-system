const bcrypt = require('bcryptjs');
const request = require('supertest');
const app = require('../../src/app');
const { User, Service, WorkingHours, Appointment } = require('../../src/models');
const { createService, createWorkingHours, createUser, createAdmin, cleanupDatabase } = require('../factories');

describe('Admin Flow Integration', () => {
  let adminToken;

  beforeAll(async () => {
    await WorkingHours.sequelize.sync({ force: true });

    // Create working hours for all weekdays
    for (let i = 1; i <= 5; i++) {
      await createWorkingHours({
        day_of_week: i,
        open_time: '09:00',
        close_time: '17:00',
      });
    }
  });

  afterAll(async () => {
    await cleanupDatabase();
    await WorkingHours.sequelize.close();
  });

  beforeEach(async () => {
    await Appointment.destroy({ where: {} });
  });

  describe('Admin Authentication', () => {
    test('should login as admin', async () => {
      await cleanupDatabase();

      // Create admin user via factory (handles hashing)
      await createAdmin({ email: 'admin@kairos.com', password: 'Admin123!' });

      const loginResponse = await request(app)
        .post('/api/auth/admin/login')
        .send({
          email: 'admin@kairos.com',
          password: 'Admin123!',
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.success).toBe(true);
      expect(loginResponse.body.token).toBeDefined();

      adminToken = loginResponse.body.token;
    });

    test('should reject non-admin users from admin login', async () => {
      await cleanupDatabase();

      // Create regular user via factory
      await createUser({ email: 'user@example.com', password: 'User123!' });

      const loginResponse = await request(app)
        .post('/api/auth/admin/login')
        .send({
          email: 'user@example.com',
          password: 'User123!',
        });

      expect(loginResponse.status).toBe(401); // Unauthorized
    });
  });

  describe('Service Management', () => {
    beforeEach(async () => {
      await cleanupDatabase();
      const admin = await createAdmin({ email: 'admin@kairos.com', password: 'Admin123!' });

      const loginResponse = await request(app)
        .post('/api/auth/admin/login')
        .send({ email: 'admin@kairos.com', password: 'Admin123!' });

      adminToken = loginResponse.body.token;
    });

    test('should create a new service', async () => {
      const serviceData = {
        name: 'New Service',
        description: 'A new beauty service',
        duration: 45,
        price: 75.00,
      };

      const response = await request(app)
        .post('/api/admin/services')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(serviceData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(serviceData.name);
    });

    test('should update an existing service', async () => {
      const service = await createService();

      const updateData = {
        name: 'Updated Service',
        price: 85.00,
      };

      const response = await request(app)
        .put(`/api/admin/services/${service.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should delete a service', async () => {
      const service = await createService();

      const response = await request(app)
        .delete(`/api/admin/services/${service.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Appointment Management', () => {
    beforeEach(async () => {
      await cleanupDatabase();
      const admin = await createAdmin({ email: 'admin@kairos.com', password: 'Admin123!' });

      const loginResponse = await request(app)
        .post('/api/auth/admin/login')
        .send({ email: 'admin@kairos.com', password: 'Admin123!' });

      adminToken = loginResponse.body.token;
    });

    test('should view all appointments', async () => {
      const response = await request(app)
        .get('/api/admin/appointments')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });

    test('should update appointment status', async () => {
      const user = await createUser();
      const service = await createService();
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const dateStr = futureDate.toISOString().split('T')[0];

      const appointment = await Appointment.create({
        customer_id: user.id,
        service_id: service.id,
        date: dateStr,
        start_time: '10:00',
        end_time: '11:00',
        status: 'booked',
      });

      const response = await request(app)
        .put(`/api/admin/appointments/${appointment.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'completed' });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('completed');
    });
  });

  describe('Customer Management', () => {
    beforeEach(async () => {
      await cleanupDatabase();
      const admin = await createAdmin({ email: 'admin@kairos.com', password: 'Admin123!' });

      const loginResponse = await request(app)
        .post('/api/auth/admin/login')
        .send({ email: 'admin@kairos.com', password: 'Admin123!' });

      adminToken = loginResponse.body.token;
    });

    test('should view all customers', async () => {
      const response = await request(app)
        .get('/api/admin/customers')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });

    test('should view customer details', async () => {
      const user = await createUser();

      const response = await request(app)
        .get(`/api/admin/customers/${user.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });

    test('should deactivate a customer', async () => {
      const user = await createUser();

      const response = await request(app)
        .put(`/api/admin/customers/${user.id}/deactivate`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Availability Management', () => {
    beforeEach(async () => {
      await cleanupDatabase();
      const admin = await createAdmin({ email: 'admin@kairos.com', password: 'Admin123!' });

      const loginResponse = await request(app)
        .post('/api/auth/admin/login')
        .send({ email: 'admin@kairos.com', password: 'Admin123!' });

      adminToken = loginResponse.body.token;
    });

    test('should update working hours', async () => {
      const workingHoursData = [
        { day_of_week: 1, open_time: '08:00', close_time: '18:00' },
        { day_of_week: 2, open_time: '08:00', close_time: '18:00' },
        { day_of_week: 3, open_time: '08:00', close_time: '18:00' },
        { day_of_week: 4, open_time: '08:00', close_time: '18:00' },
        { day_of_week: 5, open_time: '08:00', close_time: '18:00' },
      ];

      const response = await request(app)
        .put('/api/admin/availability/working-hours')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ workingHours: workingHoursData });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should create a blocked period', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 14);
      const dateStr = futureDate.toISOString().split('T')[0];

      const blockedPeriodData = {
        date: dateStr,
        start_time: '12:00',
        end_time: '13:00',
        reason: 'Lunch break',
      };

      const response = await request(app)
        .post('/api/admin/availability/blocked-periods')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(blockedPeriodData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    test('should delete a blocked period', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 14);
      const dateStr = futureDate.toISOString().split('T')[0];

      const blockedPeriod = await require('../../src/models').BlockedPeriod.create({
        date: dateStr,
        start_time: '14:00',
        end_time: '15:00',
        reason: 'Meeting',
      });

      const response = await request(app)
        .delete(`/api/admin/availability/blocked-periods/${blockedPeriod.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
