const bcrypt = require('bcryptjs');
const { User, Service, Appointment, WorkingHours, BlockedPeriod } = require('../src/models');

// Counter for unique values
let counter = 0;

const createUser = async (overrides = {}) => {
  counter++;
  const password = overrides.password || 'Password123!';
  const passwordHash = await bcrypt.hash(password, 12);
  const defaults = {
    name: `Test User ${counter}`,
    email: `testuser${counter}@example.com`,
    password_hash: passwordHash,
    phone: `+1234567${String(counter).padStart(4, '0')}`,
    role: 'customer',
    is_active: true,
  };
  const { password: _, ...rest } = overrides;
  const userData = { ...defaults, ...rest };
  return User.create(userData);
};

const createAdmin = async (overrides = {}) => {
  counter++;
  const password = overrides.password || 'Admin123!';
  const passwordHash = await bcrypt.hash(password, 12);
  const defaults = {
    name: `Admin User ${counter}`,
    email: `admin${counter}@example.com`,
    password_hash: passwordHash,
    phone: `+1987654${String(counter).padStart(4, '0')}`,
    role: 'admin',
    is_active: true,
  };
  const { password: _, ...rest } = overrides;
  const userData = { ...defaults, ...rest };
  return User.create(userData);
};

const createService = async (overrides = {}) => {
  counter++;
  const defaults = {
    name: `Service ${counter}`,
    description: `Test service description ${counter}`,
    duration: 60,
    price: 50.00 + counter,
    is_active: true,
  };
  const serviceData = { ...defaults, ...overrides };
  return Service.create(serviceData);
};

const createAppointment = async (overrides = {}) => {
  counter++;
  // Default to a future date
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7 + counter);
  const dateStr = futureDate.toISOString().split('T')[0];
  
  const defaults = {
    customer_id: null, // Must be provided
    service_id: null, // Must be provided
    date: dateStr,
    start_time: '10:00',
    end_time: '11:00',
    status: 'booked',
    notes: `Test appointment ${counter}`,
  };
  const appointmentData = { ...defaults, ...overrides };
  return Appointment.create(appointmentData);
};

const createWorkingHours = async (overrides = {}) => {
  const defaults = {
    day_of_week: 1, // Monday
    open_time: '09:00',
    close_time: '17:00',
    is_active: true,
  };
  const workingHoursData = { ...defaults, ...overrides };
  return WorkingHours.create(workingHoursData);
};

const createBlockedPeriod = async (overrides = {}) => {
  counter++;
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + counter);
  const dateStr = futureDate.toISOString().split('T')[0];
  
  const defaults = {
    date: dateStr,
    start_time: '12:00',
    end_time: '13:00',
    reason: `Blocked period ${counter}`,
  };
  const blockedPeriodData = { ...defaults, ...overrides };
  return BlockedPeriod.create(blockedPeriodData);
};

const cleanupDatabase = async () => {
  await Reminder.destroy({ where: {}, force: true }).catch(() => {});
  await Appointment.destroy({ where: {}, force: true });
  await BlockedPeriod.destroy({ where: {}, force: true });
  await WorkingHours.destroy({ where: {}, force: true });
  await Service.destroy({ where: {}, force: true });
  await User.destroy({ where: {}, force: true });
};

const { Reminder } = require('../src/models');

module.exports = {
  createUser,
  createAdmin,
  createService,
  createAppointment,
  createWorkingHours,
  createBlockedPeriod,
  cleanupDatabase,
};
