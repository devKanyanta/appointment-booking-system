const request = require('supertest');
const app = require('../../src/app');
const { User, Service, WorkingHours, Appointment } = require('../../src/models');
const { createService, createWorkingHours, cleanupDatabase } = require('../factories');

describe('Booking Flow Integration', () => {
  let authToken;
  let testService;

  beforeAll(async () => {
    await WorkingHours.sequelize.sync({ force: true });      // Create working hours for all weekdays
    for (let i = 1; i <= 5; i++) {
      await createWorkingHours({
        day_of_week: i,
        open_time: '09:00',
        close_time: '17:00',
      });
    }
    
    // Create a test service
    testService = await createService();
  });

  afterAll(async () => {
    await cleanupDatabase();
    await WorkingHours.sequelize.close();
  });

  beforeEach(async () => {
    await Appointment.destroy({ where: {} });
  });

  describe('Complete Booking Flow', () => {
    test('should complete register → login → check availability → book → confirm', async () => {
      // Step 1: Register a new user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Customer',
          email: 'testcustomer@example.com',
          password: 'TestPassword123!',
          phone: '+1234567890',
          consent: true,
        });

      expect(registerResponse.status).toBe(201);
      expect(registerResponse.body.success).toBe(true);

      // Step 2: Login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testcustomer@example.com',
          password: 'TestPassword123!',
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.success).toBe(true);
      authToken = loginResponse.body.token;

      // Step 3: Get available services
      const servicesResponse = await request(app)
        .get('/api/services')
        .set('Authorization', `Bearer ${authToken}`);

      expect(servicesResponse.status).toBe(200);
      expect(servicesResponse.body.data).toBeDefined();
      expect(servicesResponse.body.data.length).toBeGreaterThan(0);

      // Step 4: Check availability for a future date
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const dateStr = futureDate.toISOString().split('T')[0];

      const availabilityResponse = await request(app)
        .get(`/api/availability?date=${dateStr}&serviceId=${testService.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(availabilityResponse.status).toBe(200);
      expect(availabilityResponse.body.data).toBeDefined();
      expect(Array.isArray(availabilityResponse.body.data)).toBe(true);

      // Step 5: Book an appointment
      const bookingResponse = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          service_id: testService.id,
          date: dateStr,
          start_time: '10:00',
          end_time: '11:00',
        });

      expect(bookingResponse.status).toBe(201);
      expect(bookingResponse.body.success).toBe(true);
      expect(bookingResponse.body.data).toBeDefined();
      expect(bookingResponse.body.data.status).toBe('booked');

      // Step 6: Verify the booking appears in user's appointments
      const appointmentsResponse = await request(app)
        .get('/api/customer/appointments')
        .set('Authorization', `Bearer ${authToken}`);

      expect(appointmentsResponse.status).toBe(200);
      expect(appointmentsResponse.body.data).toBeDefined();
      expect(appointmentsResponse.body.data.length).toBeGreaterThan(0);

      const bookedAppointment = appointmentsResponse.body.data.find(
        apt => apt.id === bookingResponse.body.data.id
      );
      expect(bookedAppointment).toBeDefined();
      expect(bookedAppointment.status).toBe('booked');
    });

    test('should prevent double booking of the same slot', async () => {
      // Register and login
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Customer 1',
          email: 'test1@example.com',
          password: 'TestPassword123!',
          consent: true,
        });

      const loginResponse1 = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test1@example.com',
          password: 'TestPassword123!',
        });

      const authToken1 = loginResponse1.body.token;

      // Register second user
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Customer 2',
          email: 'test2@example.com',
          password: 'TestPassword123!',
          consent: true,
        });

      const loginResponse2 = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test2@example.com',
          password: 'TestPassword123!',
        });

      const authToken2 = loginResponse2.body.token;

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const dateStr = futureDate.toISOString().split('T')[0];

      // First user books
      const booking1 = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({
          service_id: testService.id,
          date: dateStr,
          start_time: '10:00',
          end_time: '11:00',
        });

      expect(booking1.status).toBe(201);

      // Second user tries to book same slot
      const booking2 = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${authToken2}`)
        .send({
          service_id: testService.id,
          date: dateStr,
          start_time: '10:00',
          end_time: '11:00',
        });

      expect(booking2.status).toBe(409); // Conflict
    });

    test('should allow booking different time slots', async () => {
      // Register and login
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Customer',
          email: 'test@example.com',
          password: 'TestPassword123!',
          consent: true,
        });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'TestPassword123!',
        });

      authToken = loginResponse.body.token;

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const dateStr = futureDate.toISOString().split('T')[0];

      // Book first slot
      const booking1 = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          service_id: testService.id,
          date: dateStr,
          start_time: '10:00',
          end_time: '11:00',
        });

      expect(booking1.status).toBe(201);

      // Book adjacent slot
      const booking2 = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          service_id: testService.id,
          date: dateStr,
          start_time: '11:00',
          end_time: '12:00',
        });

      expect(booking2.status).toBe(201);
    });
  });

  describe('Cancellation Flow', () => {
    test('should cancel a booking and free up the slot', async () => {
      // Register and login
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Customer',
          email: 'canceltest@example.com',
          password: 'TestPassword123!',
          consent: true,
        });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'canceltest@example.com',
          password: 'TestPassword123!',
        });

      authToken = loginResponse.body.token;

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const dateStr = futureDate.toISOString().split('T')[0];

      // Book appointment
      const booking = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          service_id: testService.id,
          date: dateStr,
          start_time: '10:00',
          end_time: '11:00',
        });

      expect(booking.status).toBe(201);
      const appointmentId = booking.body.data.id;

      // Cancel appointment
      const cancelResponse = await request(app)
        .put(`/api/appointments/${appointmentId}/cancel`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(cancelResponse.status).toBe(200);
      expect(cancelResponse.body.data.status).toBe('cancelled');

      // Verify slot is available again
      const availabilityResponse = await request(app)
        .get(`/api/availability?date=${dateStr}&serviceId=${testService.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(availabilityResponse.status).toBe(200);
      
      // The 10:00-11:00 slot should now be available
      const availableSlot = availabilityResponse.body.data.find(
        slot => slot.start_time === '10:00'
      );
      expect(availableSlot).toBeDefined();
    });
  });
});
