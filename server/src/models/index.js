const sequelize = require('../config/connection');
const User = require('./User');
const Service = require('./Service');
const Appointment = require('./Appointment');
const BlockedPeriod = require('./BlockedPeriod');
const WorkingHours = require('./WorkingHours');
const Reminder = require('./Reminder');

// User has many Appointments
User.hasMany(Appointment, { foreignKey: 'customer_id', as: 'appointments' });
Appointment.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });

// Service has many Appointments
Service.hasMany(Appointment, { foreignKey: 'service_id', as: 'appointments' });
Appointment.belongsTo(Service, { foreignKey: 'service_id', as: 'service' });

// Appointment has many Reminders
Appointment.hasMany(Reminder, { foreignKey: 'appointment_id', as: 'reminders' });
Reminder.belongsTo(Appointment, { foreignKey: 'appointment_id', as: 'appointment' });

module.exports = {
  sequelize,
  User,
  Service,
  Appointment,
  BlockedPeriod,
  WorkingHours,
  Reminder,
};
