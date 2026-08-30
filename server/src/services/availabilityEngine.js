const { Op } = require('sequelize');
const { Service, WorkingHours, BlockedPeriod, Appointment } = require('../models');

/**
 * Calculate available time slots for a given date and service.
 * Algorithm:
 * 1. Get service duration
 * 2. Get working hours for the day of week
 * 3. If business is closed, return empty
 * 4. Fetch blocked periods for the date
 * 5. Fetch existing booked appointments for the date
 * 6. Generate potential slots at 15-minute intervals
 * 7. Filter out slots that extend beyond closing, overlap blocks, or overlap bookings
 */
async function getAvailableSlots(date, serviceId) {
  const service = await Service.findByPk(serviceId);
  if (!service || !service.is_active) {
    throw new Error('Service not found');
  }

  const appointmentDate = new Date(date);
  const dayOfWeek = appointmentDate.getDay();

  // Get working hours for this day
  const workingHours = await WorkingHours.findOne({
    where: { day_of_week: dayOfWeek },
  });

  if (!workingHours || !workingHours.is_active) {
    return { date, serviceId, serviceDuration: service.duration, slots: [] };
  }

  const openTime = parseTime(workingHours.open_time);
  const closeTime = parseTime(workingHours.close_time);

  // Get blocked periods for this date
  const blockedPeriods = await BlockedPeriod.findAll({
    where: { date },
  });

  // Get existing booked appointments for this date
  const existingAppointments = await Appointment.findAll({
    where: {
      date,
      status: 'booked',
    },
  });

  const duration = service.duration;
  const interval = 15; // 15-minute intervals
  const slots = [];

  let currentMinutes = openTime;

  while (currentMinutes + duration <= closeTime) {
    const slotStart = currentMinutes;
    const slotEnd = currentMinutes + duration;

    // Check if slot overlaps any blocked period
    const isBlocked = blockedPeriods.some((block) => {
      if (!block.start_time || !block.end_time) {
        // Whole day blocked
        return true;
      }
      const blockStart = parseTime(block.start_time);
      const blockEnd = parseTime(block.end_time);
      return slotStart < blockEnd && slotEnd > blockStart;
    });

    // Check if slot overlaps any existing appointment
    const isBooked = existingAppointments.some((apt) => {
      const aptStart = parseTime(apt.start_time);
      const aptEnd = parseTime(apt.end_time);
      return slotStart < aptEnd && slotEnd > aptStart;
    });

    if (!isBlocked && !isBooked) {
      slots.push({
        startTime: formatTime(slotStart),
        endTime: formatTime(slotEnd),
      });
    }

    currentMinutes += interval;
  }

  return {
    date,
    serviceId,
    serviceDuration: service.duration,
    slots,
  };
}

/**
 * Parse a time string (HH:MM or HH:MM:SS) to minutes since midnight
 */
function parseTime(timeStr) {
  const parts = timeStr.split(':');
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  return hours * 60 + minutes;
}

/**
 * Format minutes since midnight to HH:MM string
 */
function formatTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

module.exports = { getAvailableSlots, generateAvailableSlots: getAvailableSlots, parseTime, formatTime };
