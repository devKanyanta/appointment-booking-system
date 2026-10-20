const bookingService = require('../services/bookingService');

const bookAppointment = async (req, res, next) => {
  try {
    // Support both camelCase and snake_case
    const serviceId = req.body.serviceId || req.body.service_id;
    const date = req.body.date;
    const startTime = req.body.startTime || req.body.start_time;
    const [year, month, day] = String(date || '').split('-').map(Number);
    const bookingDate = new Date(year, month - 1, day);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '') || bookingDate.getFullYear() !== year || bookingDate.getMonth() !== month - 1 || bookingDate.getDate() !== day || bookingDate < new Date(new Date().setHours(0, 0, 0, 0))) {
      return res.status(400).json({ message: 'Appointments must be booked for a valid date today or later' });
    }

    if (!serviceId || !date || !startTime) {
      return res.status(400).json({ message: 'service_id, date, and start_time are required' });
    }

    const appointment = await bookingService.createAppointment(
      req.user.id,
      serviceId,
      date,
      startTime
    );
    const { sendBookingConfirmation } = require('../services/reminderService');
    res.status(201).json({ success: true, message: 'Appointment booked successfully', data: appointment });
    sendBookingConfirmation(appointment).catch((error) => console.error('[Email] Confirmation delivery failed:', error.message));
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

const cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await bookingService.cancelAppointment(
      req.params.id,
      req.user.id
    );
    const { sendCancellationConfirmation } = require('../services/reminderService');
    res.json({ success: true, message: 'Appointment cancelled', data: appointment });
    sendCancellationConfirmation(appointment).catch((error) => console.error('[Email] Cancellation delivery failed:', error.message));
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

const rescheduleAppointment = async (req, res, next) => {
  try {
    const date = req.body.date;
    const startTime = req.body.startTime || req.body.start_time;
    const appointment = await bookingService.rescheduleAppointment(
      req.params.id,
      req.user.id,
      date,
      startTime
    );
    res.json({ success: true, message: 'Appointment rescheduled', data: appointment });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

const getUpcoming = async (req, res, next) => {
  try {
    const appointments = await bookingService.getUpcomingAppointments(req.user.id);
    res.json({ data: appointments });
  } catch (error) {
    next(error);
  }
};

const getHistory = async (req, res, next) => {
  try {
    const appointments = await bookingService.getAppointmentHistory(req.user.id);
    res.json({ data: appointments });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  bookAppointment,
  cancelAppointment,
  rescheduleAppointment,
  getUpcoming,
  getHistory,
};
