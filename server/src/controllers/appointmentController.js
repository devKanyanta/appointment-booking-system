const bookingService = require('../services/bookingService');

const bookAppointment = async (req, res, next) => {
  try {
    // Support both camelCase and snake_case
    const serviceId = req.body.serviceId || req.body.service_id;
    const date = req.body.date;
    const startTime = req.body.startTime || req.body.start_time;

    if (!serviceId || !date || !startTime) {
      return res.status(400).json({ message: 'service_id, date, and start_time are required' });
    }

    const appointment = await bookingService.createAppointment(
      req.user.id,
      serviceId,
      date,
      startTime
    );
    res.status(201).json({ success: true, message: 'Appointment booked successfully', data: appointment });
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
    res.json({ success: true, message: 'Appointment cancelled', data: appointment });
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
