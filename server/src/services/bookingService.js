const { Op } = require('sequelize');
const sequelize = require('../config/connection');
const { Appointment, Service, User, WorkingHours, BlockedPeriod } = require('../models');
const { parseTime, formatTime, parseDateOnly } = require('./availabilityEngine');

const CANCELLATION_HOURS = 6;

/**
 * Create a new appointment with double-booking prevention.
 * Uses a database transaction with row-level locking.
 */
async function createAppointment(customerId, serviceId, date, startTime) {
  validateDate(date, { allowPast: true });
  validateTime(startTime);
  const service = await Service.findByPk(serviceId);
  if (!service || !service.is_active) {
    throw Object.assign(new Error('Service not found'), { statusCode: 404 });
  }

  const startMinutes = parseTime(startTime);
  const endMinutes = startMinutes + service.duration;
  const endTime = formatTime(endMinutes);
  await validateSlot(date, startMinutes, endMinutes);

  const result = await sequelize.transaction(
    { isolationLevel: 'SERIALIZABLE' },
    async (t) => {
      const dayLock = await WorkingHours.findOne({
        where: { day_of_week: parseDateOnly(date).getDay() },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (!dayLock || !dayLock.is_active) {
        throw Object.assign(new Error('The business is closed on the selected date'), { statusCode: 400 });
      }

      const dateBlocks = await BlockedPeriod.findAll({ where: { date }, transaction: t });
      if (dateBlocks.some((block) => !block.start_time || !block.end_time || (startMinutes < parseTime(block.end_time) && endMinutes > parseTime(block.start_time)))) {
        throw Object.assign(new Error('The selected time overlaps a blocked period'), { statusCode: 409 });
      }

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
    const appointmentDay = parseDateOnly(appointment.date);
    const [hour, minute] = appointment.start_time.split(':').map(Number);
    appointmentDay.setHours(hour, minute, 0, 0);
    const appointmentDateTime = appointmentDay;
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
  validateDate(newDate);
  validateTime(newStartTime);
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
  await validateSlot(newDate, startMinutes, endMinutes);

  const result = await sequelize.transaction(
    { isolationLevel: 'SERIALIZABLE' },
    async (t) => {
      const dayLock = await WorkingHours.findOne({
        where: { day_of_week: parseDateOnly(newDate).getDay() },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (!dayLock || !dayLock.is_active) {
        throw Object.assign(new Error('The business is closed on the selected date'), { statusCode: 400 });
      }
      const dateBlocks = await BlockedPeriod.findAll({ where: { date: newDate }, transaction: t });
      if (dateBlocks.some((block) => !block.start_time || !block.end_time || (startMinutes < parseTime(block.end_time) && endMinutes > parseTime(block.start_time)))) {
        throw Object.assign(new Error('The selected time overlaps a blocked period'), { statusCode: 409 });
      }

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

  await result.reload({ include: [
    { model: Service, as: 'service' },
    { model: User, as: 'customer', attributes: { exclude: ['password_hash'] } },
  ] });
  return result;
}

/**
 * Get upcoming appointments for a customer
 */
async function getUpcomingAppointments(customerId) {
  const today = formatLocalDate(new Date());

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
  const today = formatLocalDate(new Date());

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

function formatLocalDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function validateDate(date, { allowPast = false } = {}) {
  if (date instanceof Date && !Number.isNaN(date.getTime())) {
    date = formatLocalDate(date);
  }
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw Object.assign(new Error('A valid date (YYYY-MM-DD) is required'), { statusCode: 400 });
  }
  const parsed = parseDateOnly(date);
  if (Number.isNaN(parsed.getTime()) || formatLocalDate(parsed) !== date) {
    throw Object.assign(new Error('A valid calendar date is required'), { statusCode: 400 });
  }
  if (!allowPast && parsed < new Date(new Date().setHours(0, 0, 0, 0))) {
    throw Object.assign(new Error('Appointments must be booked for a valid date today or later'), { statusCode: 400 });
  }
}

function validateTime(time) {
  if (typeof time !== 'string' || !/^\d{2}:\d{2}$/.test(time)) {
    throw Object.assign(new Error('A valid appointment time (HH:MM) is required'), { statusCode: 400 });
  }
  const [hour, minute] = time.split(':').map(Number);
  if (hour > 23 || minute > 59) {
    throw Object.assign(new Error('A valid appointment time (HH:MM) is required'), { statusCode: 400 });
  }
}

async function validateSlot(date, startMinutes, endMinutes) {
  const parsedDate = parseDateOnly(date);
  const workingHours = await WorkingHours.findOne({ where: { day_of_week: parsedDate.getDay() } });
  if (!workingHours || !workingHours.is_active) {
    throw Object.assign(new Error('The business is closed on the selected date'), { statusCode: 400 });
  }

  const openMinutes = parseTime(workingHours.open_time);
  const closeMinutes = parseTime(workingHours.close_time);
  if (startMinutes < openMinutes || endMinutes > closeMinutes) {
    throw Object.assign(new Error('The appointment must fit within business working hours'), { statusCode: 400 });
  }

  const blockedPeriods = await BlockedPeriod.findAll({ where: { date } });
  const blocked = blockedPeriods.some((period) => {
    if (!period.start_time || !period.end_time) return true;
    return startMinutes < parseTime(period.end_time) && endMinutes > parseTime(period.start_time);
  });
  if (blocked) {
    throw Object.assign(new Error('The selected time overlaps a blocked period'), { statusCode: 409 });
  }

  const current = new Date();
  if (date === formatLocalDate(current) && startMinutes <= current.getHours() * 60 + current.getMinutes()) {
    throw Object.assign(new Error('The selected appointment time has already passed'), { statusCode: 400 });
  }
}

module.exports = {
  createAppointment,
  cancelAppointment,
  rescheduleAppointment,
  getUpcomingAppointments,
  getAppointmentHistory,
  CANCELLATION_HOURS,
};
