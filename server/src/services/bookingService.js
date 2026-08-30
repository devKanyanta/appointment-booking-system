const { Op } = require('sequelize');
const sequelize = require('../config/connection');
const { Appointment, Service, User } = require('../models');
const { parseTime, formatTime } = require('./availabilityEngine');

const CANCELLATION_HOURS = 6;

/**
 * Create a new appointment with double-booking prevention.
 * Uses a database transaction with row-level locking.
 */
async function createAppointment(customerId, serviceId, date, startTime) {
  const service = await Service.findByPk(serviceId);
  if (!service || !service.is_active) {
    throw Object.assign(new Error('Service not found'), { statusCode: 404 });
  }

  const startMinutes = parseTime(startTime);
  const endMinutes = startMinutes + service.duration;
  const endTime = formatTime(endMinutes);

  const result = await sequelize.transaction(
    { isolationLevel: 'SERIALIZABLE' },
    async (t) => {
      // Check for overlapping bookings with locking
      const overlapping = await Appointment.findOne({
        where: {
          date,
          status: 'booked',
          [Op.and]: [
            { start_time: { [Op.lt]: endTime } },
            { end_time: { [Op.gt]: startTime } },
          ],
        },
        lock: true,
        transaction: t,
      });

      if (overlapping) {
        throw Object.assign(
          new Error('This time slot is no longer available. Please select another time.'),
          { statusCode: 409 }
        );
      }

      const appointment = await Appointment.create(
        {
          customer_id: customerId,
          service_id: serviceId,
          date,
          start_time: startTime,
          end_time: endTime,
          status: 'booked',
        },
        { transaction: t }
      );

      return appointment;
    }
  );

  // Fetch the full appointment with relations
  const fullAppointment = await Appointment.findByPk(result.id, {
    include: [
      { model: Service, as: 'service' },
      { model: User, as: 'customer', attributes: { exclude: ['password_hash'] } },
    ],
  });

  return fullAppointment;
}

/**
 * Cancel an appointment (subject to cancellation policy)
 */
async function cancelAppointment(appointmentId, userId, isAdmin = false) {
  const appointment = await Appointment.findByPk(appointmentId, {
    include: [
      { model: Service, as: 'service' },
      { model: User, as: 'customer', attributes: { exclude: ['password_hash'] } },
    ],
  });

  if (!appointment) {
    throw Object.assign(new Error('Appointment not found'), { statusCode: 404 });
  }

  if (!isAdmin && appointment.customer_id !== userId) {
    throw Object.assign(new Error('Not authorized to cancel this appointment'), { statusCode: 403 });
  }

  if (appointment.status !== 'booked') {
    throw Object.assign(new Error('Only booked appointments can be cancelled'), { statusCode: 400 });
  }

  // Check cancellation policy (6 hours before)
  if (!isAdmin) {
    const appointmentDateTime = new Date(`${appointment.date}T${appointment.start_time}`);
    const now = new Date();
    const hoursUntil = (appointmentDateTime - now) / (1000 * 60 * 60);

    if (hoursUntil < CANCELLATION_HOURS) {
      throw Object.assign(
        new Error(`Appointments must be cancelled at least ${CANCELLATION_HOURS} hours before the scheduled time`),
        { statusCode: 400 }
      );
    }
  }

  await appointment.update({ status: 'cancelled' });
  return appointment;
}

/**
 * Reschedule an appointment to a new date/time
 */
async function rescheduleAppointment(appointmentId, userId, newDate, newStartTime, isAdmin = false) {
  const appointment = await Appointment.findByPk(appointmentId, {
    include: [
      { model: Service, as: 'service' },
      { model: User, as: 'customer', attributes: { exclude: ['password_hash'] } },
    ],
  });

  if (!appointment) {
    throw Object.assign(new Error('Appointment not found'), { statusCode: 404 });
  }

  if (!isAdmin && appointment.customer_id !== userId) {
    throw Object.assign(new Error('Not authorized to reschedule this appointment'), { statusCode: 403 });
  }

  if (appointment.status !== 'booked') {
    throw Object.assign(new Error('Only booked appointments can be rescheduled'), { statusCode: 400 });
  }

  const service = await Service.findByPk(appointment.service_id);
  const startMinutes = parseTime(newStartTime);
  const endMinutes = startMinutes + service.duration;
  const endTime = formatTime(endMinutes);

  const result = await sequelize.transaction(
    { isolationLevel: 'SERIALIZABLE' },
    async (t) => {
      // Check for overlapping bookings at the new time
      const overlapping = await Appointment.findOne({
        where: {
          date: newDate,
          status: 'booked',
          id: { [Op.ne]: appointmentId },
          [Op.and]: [
            { start_time: { [Op.lt]: endTime } },
            { end_time: { [Op.gt]: newStartTime } },
          ],
        },
        lock: true,
        transaction: t,
      });

      if (overlapping) {
        throw Object.assign(
          new Error('The new time slot is no longer available. Please select another time.'),
          { statusCode: 409 }
        );
      }

      await appointment.update(
        { date: newDate, start_time: newStartTime, end_time: endTime },
        { transaction: t }
      );

      return appointment;
    }
  );

  return result;
}

/**
 * Get upcoming appointments for a customer
 */
async function getUpcomingAppointments(customerId) {
  const today = new Date().toISOString().split('T')[0];

  return Appointment.findAll({
    where: {
      customer_id: customerId,
      status: 'booked',
      [Op.or]: [
        { date: { [Op.gt]: today } },
        {
          date: today,
          start_time: { [Op.gte]: new Date().toTimeString().split(' ')[0] },
        },
      ],
    },
    include: [
      { model: Service, as: 'service' },
    ],
    order: [['date', 'ASC'], ['start_time', 'ASC']],
  });
}

/**
 * Get appointment history for a customer
 */
async function getAppointmentHistory(customerId) {
  const today = new Date().toISOString().split('T')[0];

  return Appointment.findAll({
    where: {
      customer_id: customerId,
      [Op.or]: [
        { status: { [Op.ne]: 'booked' } },
        {
          status: 'booked',
          [Op.or]: [
            { date: { [Op.lt]: today } },
            {
              date: today,
              start_time: { [Op.lt]: new Date().toTimeString().split(' ')[0] },
            },
          ],
        },
      ],
    },
    include: [
      { model: Service, as: 'service' },
    ],
    order: [['date', 'DESC'], ['start_time', 'DESC']],
  });
}

module.exports = {
  createAppointment,
  cancelAppointment,
  rescheduleAppointment,
  getUpcomingAppointments,
  getAppointmentHistory,
  CANCELLATION_HOURS,
};
