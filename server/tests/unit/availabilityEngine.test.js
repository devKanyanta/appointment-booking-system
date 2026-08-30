const { generateAvailableSlots } = require('../../src/services/availabilityEngine');
const { WorkingHours, BlockedPeriod, Service, Appointment, User } = require('../../src/models');
const { createWorkingHours, createBlockedPeriod, createService, createAppointment, createUser, cleanupDatabase } = require('../factories');

describe('Availability Engine', () => {
  let testUser;

  beforeAll(async () => {
    await WorkingHours.sequelize.sync({ force: true });
    testUser = await createUser();
  });

  afterAll(async () => {
    await cleanupDatabase();
    await WorkingHours.sequelize.close();
  });

  beforeEach(async () => {
    await cleanupDatabase();
    testUser = await createUser();
  });

  describe('generateAvailableSlots', () => {
    test('should generate slots based on working hours', async () => {
      await createWorkingHours({
        day_of_week: 1,
        open_time: '09:00',
        close_time: '17:00',
      });

      const service = await createService({ duration: 60 });
      const nextMonday = getNextDayOfWeek(1);
      const result = await generateAvailableSlots(nextMonday, service.id);

      expect(result).toBeDefined();
      expect(result.slots).toBeDefined();
      expect(Array.isArray(result.slots)).toBe(true);
      expect(result.slots.length).toBeGreaterThan(0);

      result.slots.forEach(slot => {
        const startHour = parseInt(slot.startTime.split(':')[0]);
        const endHour = parseInt(slot.endTime.split(':')[0]);
        expect(startHour).toBeGreaterThanOrEqual(9);
        expect(endHour).toBeLessThanOrEqual(17);
      });
    });

    test('should exclude slots that conflict with blocked periods', async () => {
      await createWorkingHours({
        day_of_week: 1,
        open_time: '09:00',
        close_time: '17:00',
      });

      const nextMonday = getNextDayOfWeek(1);
      const dateStr = nextMonday.toISOString().split('T')[0];
      await createBlockedPeriod({
        date: dateStr,
        start_time: '12:00',
        end_time: '13:00',
      });

      const service = await createService({ duration: 60 });
      const result = await generateAvailableSlots(nextMonday, service.id);

      result.slots.forEach(slot => {
        const slotStart = timeToMinutes(slot.startTime);
        const slotEnd = timeToMinutes(slot.endTime);
        const blockedStart = timeToMinutes('12:00');
        const blockedEnd = timeToMinutes('13:00');
        const overlaps = slotStart < blockedEnd && slotEnd > blockedStart;
        expect(overlaps).toBe(false);
      });
    });

    test('should exclude slots that conflict with existing appointments', async () => {
      await createWorkingHours({
        day_of_week: 1,
        open_time: '09:00',
        close_time: '17:00',
      });

      const service = await createService({ duration: 60 });
      const nextMonday = getNextDayOfWeek(1);
      const dateStr = nextMonday.toISOString().split('T')[0];

      await createAppointment({
        customer_id: testUser.id,
        service_id: service.id,
        date: dateStr,
        start_time: '10:00',
        end_time: '11:00',
        status: 'booked',
      });

      const result = await generateAvailableSlots(nextMonday, service.id);

      result.slots.forEach(slot => {
        const slotStart = timeToMinutes(slot.startTime);
        const slotEnd = timeToMinutes(slot.endTime);
        const aptStart = timeToMinutes('10:00');
        const aptEnd = timeToMinutes('11:00');
        const overlaps = slotStart < aptEnd && slotEnd > aptStart;
        expect(overlaps).toBe(false);
      });
    });

    test('should return empty slots when no working hours exist', async () => {
      const nextMonday = getNextDayOfWeek(1);
      const service = await createService({ duration: 60 });
      const result = await generateAvailableSlots(nextMonday, service.id);

      expect(result).toBeDefined();
      expect(result.slots).toBeDefined();
      expect(Array.isArray(result.slots)).toBe(true);
      expect(result.slots.length).toBe(0);
    });

    test('should handle 30-minute duration slots correctly', async () => {
      await createWorkingHours({
        day_of_week: 1,
        open_time: '09:00',
        close_time: '17:00',
      });

      const service = await createService({ duration: 30 });
      const nextMonday = getNextDayOfWeek(1);
      const result = await generateAvailableSlots(nextMonday, service.id);

      expect(result).toBeDefined();
      expect(result.slots).toBeDefined();
      expect(Array.isArray(result.slots)).toBe(true);
      expect(result.slots.length).toBeGreaterThan(0);

      result.slots.forEach(slot => {
        const startMinutes = timeToMinutes(slot.startTime);
        const endMinutes = timeToMinutes(slot.endTime);
        expect(endMinutes - startMinutes).toBe(30);
      });
    });

    test('should return empty slots for past dates', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 7);
      const service = await createService({ duration: 60 });
      const result = await generateAvailableSlots(pastDate, service.id);

      expect(result).toBeDefined();
      expect(result.slots).toBeDefined();
      expect(Array.isArray(result.slots)).toBe(true);
      expect(result.slots.length).toBe(0);
    });
  });

  function getNextDayOfWeek(dayOfWeek) {
    const date = new Date();
    const daysUntilTarget = (dayOfWeek - date.getDay() + 7) % 7 || 7;
    date.setDate(date.getDate() + daysUntilTarget);
    return date;
  }

  function timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
});
