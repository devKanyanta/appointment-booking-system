const cron = require('node-cron');
const { Op } = require('sequelize');
const { Appointment, Service, User } = require('../models');
const { sendReminder } = require('../services/reminderService');

const CRON_SCHEDULE = process.env.REMINDER_CRON_SCHEDULE || '0 * * * *';
const REMINDER_HOURS = parseInt(process.env.REMINDER_HOURS_BEFORE, 10) || 24;

/**
 * Process reminders for appointments happening approximately REMINDER_HOURS from now.
 */
async function processReminders() {
  try {
    const now = new Date();
    const targetDate = new Date(now.getTime() + REMINDER_HOURS * 60 * 60 * 1000);
    const targetDateStr = targetDate.toISOString().split('T')[0];

    // Find booked appointments for the target date
    const appointments = await Appointment.findAll({
      where: {
        date: targetDateStr,
        status: 'booked',
      },
      include: [
        { model: Service, as: 'service' },
        { model: User, as: 'customer', attributes: { exclude: ['password_hash'] } },
      ],
    });

    console.log(`[Reminder Job] Processing ${appointments.length} appointments for ${targetDateStr}`);

    let sent = 0;
    let failed = 0;

    for (const appointment of appointments) {
      // Check if a reminder was already sent for this appointment
      const existingReminder = await require('../models').Reminder.findOne({
        where: {
          appointment_id: appointment.id,
          type: 'reminder',
          status: 'sent',
        },
      });

      if (existingReminder) {
        continue;
      }

      const result = await sendReminder(appointment);
      if (result.success) {
        sent++;
      } else {
        failed++;
      }
    }

    console.log(`[Reminder Job] Sent: ${sent}, Failed: ${failed}`);
  } catch (error) {
    console.error('[Reminder Job] Error:', error.message);
  }
}

/**
 * Start the reminder cron job
 */
function startReminderJob() {
  console.log(`[Reminder Job] Scheduled with cron: ${CRON_SCHEDULE}`);
  cron.schedule(CRON_SCHEDULE, processReminders);
}

module.exports = { startReminderJob, processReminders };
