const { User, Service, Appointment, Reminder } = require('../../src/models');
const { createUser, createService, createAppointment: factoryCreateAppointment, cleanupDatabase } = require('../factories');

// Create a mock function that we can control
const mockSendReminder = jest.fn().mockImplementation(async (appointment) => {
  // Create a Reminder record so the duplicate check in processReminders works
  await Reminder.create({
    appointment_id: appointment.id,
    type: 'reminder',
    status: 'sent',
    sent_at: new Date(),
  });
  return { success: true };
});

jest.mock('../../src/services/reminderService', () => ({
  sendBookingConfirmation: jest.fn(),
  sendCancellationConfirmation: jest.fn(),
  sendReminder: (...args) => mockSendReminder(...args),
}));

const { processReminders } = require('../../src/jobs/reminderJob');

describe('Reminder Job', () => {
  beforeAll(async () => {
    await Reminder.sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await cleanupDatabase();
    await Reminder.sequelize.close();
  });

  beforeEach(async () => {
    await cleanupDatabase();
    await Reminder.destroy({ where: {} });
    mockSendReminder.mockClear();
  });

  describe('processReminders', () => {
    test('should send reminders for appointments approximately 24 hours away', async () => {
      const user = await createUser({
        email: 'reminder-test-1@example.com',
        name: 'Test User 1',
      });

      const service = await createService({
        name: 'Haircut',
        duration: 60,
      });

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      const dateStr = tomorrow.toISOString().split('T')[0];

      await factoryCreateAppointment({
        customer_id: user.id,
        service_id: service.id,
        date: dateStr,
        start_time: '10:00',
        end_time: '11:00',
        status: 'booked',
      });

      await processReminders();

      expect(mockSendReminder).toHaveBeenCalledTimes(1);
    });

    test('should not send duplicate reminders', async () => {
      const user = await createUser({
        email: 'reminder-test-2@example.com',
        name: 'Test User 2',
      });

      const service = await createService({
        name: 'Haircut',
      });

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(14, 0, 0, 0);
      const dateStr = tomorrow.toISOString().split('T')[0];

      await factoryCreateAppointment({
        customer_id: user.id,
        service_id: service.id,
        date: dateStr,
        start_time: '14:00',
        end_time: '15:00',
        status: 'booked',
      });

      await processReminders();
      await processReminders();

      expect(mockSendReminder).toHaveBeenCalledTimes(1);
    });

    test('should not send reminders for cancelled appointments', async () => {
      const user = await createUser({
        email: 'reminder-test-3@example.com',
        name: 'Test User 3',
      });

      const service = await createService({
        name: 'Haircut',
      });

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(12, 0, 0, 0);
      const dateStr = tomorrow.toISOString().split('T')[0];

      await factoryCreateAppointment({
        customer_id: user.id,
        service_id: service.id,
        date: dateStr,
        start_time: '12:00',
        end_time: '13:00',
        status: 'cancelled',
      });

      await processReminders();

      expect(mockSendReminder).not.toHaveBeenCalled();
    });

    test('should not send reminders for appointments on the wrong date', async () => {
      const user = await createUser({
        email: 'reminder-test-4@example.com',
        name: 'Test User 4',
      });

      const service = await createService({
        name: 'Haircut',
      });

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);
      futureDate.setHours(10, 0, 0, 0);
      const dateStr = futureDate.toISOString().split('T')[0];

      await factoryCreateAppointment({
        customer_id: user.id,
        service_id: service.id,
        date: dateStr,
        start_time: '10:00',
        end_time: '11:00',
        status: 'booked',
      });

      await processReminders();

      expect(mockSendReminder).not.toHaveBeenCalled();
    });

    test('should handle multiple appointments on the same day', async () => {
      const user1 = await createUser({
        email: 'reminder-user1@example.com',
        name: 'User 1',
      });

      const user2 = await createUser({
        email: 'reminder-user2@example.com',
        name: 'User 2',
      });

      const service = await createService({
        name: 'Haircut',
      });

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      const dateStr = tomorrow.toISOString().split('T')[0];

      await factoryCreateAppointment({
        customer_id: user1.id,
        service_id: service.id,
        date: dateStr,
        start_time: '10:00',
        end_time: '11:00',
        status: 'booked',
      });

      await factoryCreateAppointment({
        customer_id: user2.id,
        service_id: service.id,
        date: dateStr,
        start_time: '11:00',
        end_time: '12:00',
        status: 'booked',
      });

      await processReminders();

      expect(mockSendReminder).toHaveBeenCalledTimes(2);
    });
  });
});
