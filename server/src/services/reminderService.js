const fs = require('fs');
const path = require('path');
const { transporter, mailFrom } = require('../config/email');
const { Appointment, Service, User, Reminder } = require('../models');

/**
 * Load and render an HTML email template with variable substitution
 */
function renderTemplate(templateName, variables) {
  const templatePath = path.join(__dirname, '..', 'templates', `${templateName}.html`);
  let html = fs.readFileSync(templatePath, 'utf-8');

  for (const [key, value] of Object.entries(variables)) {
    html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }

  return html;
}

/**
 * Send a booking confirmation email
 */
async function sendBookingConfirmation(appointment) {
  const service = appointment.service || await Service.findByPk(appointment.service_id);
  const customer = appointment.customer || await User.findByPk(appointment.customer_id);

  const html = renderTemplate('confirmation', {
    customerName: customer.name,
    serviceName: service.name,
    date: appointment.date,
    startTime: appointment.start_time.slice(0, 5),
    endTime: appointment.end_time.slice(0, 5),
    duration: service.duration,
    price: `K${parseFloat(service.price).toFixed(2)}`,
  });

  return sendEmail(customer.email, `Booking Confirmed - ${service.name}`, html, appointment.id, 'confirmation');
}

/**
 * Send a cancellation confirmation email
 */
async function sendCancellationConfirmation(appointment) {
  const service = appointment.service || await Service.findByPk(appointment.service_id);
  const customer = appointment.customer || await User.findByPk(appointment.customer_id);

  const html = renderTemplate('cancellation', {
    customerName: customer.name,
    serviceName: service.name,
    date: appointment.date,
    startTime: appointment.start_time.slice(0, 5),
    endTime: appointment.end_time.slice(0, 5),
  });

  return sendEmail(customer.email, `Appointment Cancelled - ${service.name}`, html, appointment.id, 'cancellation');
}

/**
 * Send a reminder email
 */
async function sendReminder(appointment) {
  const service = appointment.service || await Service.findByPk(appointment.service_id);
  const customer = appointment.customer || await User.findByPk(appointment.customer_id);

  const html = renderTemplate('reminder', {
    customerName: customer.name,
    serviceName: service.name,
    date: appointment.date,
    startTime: appointment.start_time.slice(0, 5),
    endTime: appointment.end_time.slice(0, 5),
    duration: service.duration,
  });

  return sendEmail(customer.email, `Appointment Reminder - Tomorrow at ${appointment.start_time.slice(0, 5)}`, html, appointment.id, 'reminder');
}

/**
 * Internal: send email and record delivery status
 */
async function sendEmail(to, subject, html, appointmentId, type) {
  const reminder = await Reminder.create({
    appointment_id: appointmentId,
    type,
    status: 'pending',
  });

  try {
    await transporter.sendMail({
      from: mailFrom,
      to,
      subject,
      html,
    });

    await reminder.update({
      status: 'sent',
      sent_at: new Date(),
    });

    return { success: true, reminder };
  } catch (error) {
    await reminder.update({
      status: 'failed',
      error_message: error.message,
    });

    console.error(`Failed to send ${type} email:`, error.message);
    return { success: false, reminder, error: error.message };
  }
}

module.exports = {
  sendBookingConfirmation,
  sendCancellationConfirmation,
  sendReminder,
};
