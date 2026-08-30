const { Op } = require('sequelize');
const { User, Service, Appointment, WorkingHours, BlockedPeriod } = require('../models');
const bookingService = require('../services/bookingService');

// --- Appointments ---

const getAppointments = async (req, res, next) => {
  try {
    const { date, status, customerId, serviceId } = req.query;
    const where = {};

    if (date) where.date = date;
    if (status) where.status = status;
    if (customerId) where.customer_id = customerId;
    if (serviceId) where.service_id = serviceId;

    const appointments = await Appointment.findAll({
      where,
      include: [
        { model: Service, as: 'service' },
        { model: User, as: 'customer', attributes: { exclude: ['password_hash'] } },
      ],
      order: [['date', 'ASC'], ['start_time', 'ASC']],
    });

    res.json({ data: appointments });
  } catch (error) {
    next(error);
  }
};

const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        { model: Service, as: 'service' },
        { model: User, as: 'customer', attributes: { exclude: ['password_hash'] } },
      ],
    });
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json({ appointment });
  } catch (error) {
    next(error);
  }
};

const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['booked', 'cancelled', 'completed', 'no-show'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    await appointment.update({ status });
    res.json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

const adminCancelAppointment = async (req, res, next) => {
  try {
    const appointment = await bookingService.cancelAppointment(
      req.params.id,
      req.user.id,
      true
    );
    res.json({ message: 'Appointment cancelled', appointment });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

const adminRescheduleAppointment = async (req, res, next) => {
  try {
    const { date, startTime } = req.body;
    const appointment = await bookingService.rescheduleAppointment(
      req.params.id,
      req.user.id,
      date,
      startTime,
      true
    );
    res.json({ message: 'Appointment rescheduled', appointment });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

// --- Working Hours ---

const getWorkingHours = async (req, res, next) => {
  try {
    const hours = await WorkingHours.findAll({
      order: [['day_of_week', 'ASC']],
    });
    res.json({ workingHours: hours });
  } catch (error) {
    next(error);
  }
};

const updateWorkingHours = async (req, res, next) => {
  try {
    const { hours } = req.body; // Array of { dayOfWeek, openTime, closeTime, isActive }

    for (const h of hours) {
      await WorkingHours.upsert({
        day_of_week: h.dayOfWeek,
        open_time: h.openTime,
        close_time: h.closeTime,
        is_active: h.isActive,
      });
    }

    const updated = await WorkingHours.findAll({ order: [['day_of_week', 'ASC']] });
    res.json({ success: true, message: 'Working hours updated', data: updated });
  } catch (error) {
    next(error);
  }
};

// --- Blocked Periods ---

const getBlockedPeriods = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const where = {};

    if (startDate && endDate) {
      where.date = { [Op.between]: [startDate, endDate] };
    } else if (startDate) {
      where.date = { [Op.gte]: startDate };
    }

    const periods = await BlockedPeriod.findAll({
      where,
      order: [['date', 'ASC']],
    });
    res.json({ blockedPeriods: periods });
  } catch (error) {
    next(error);
  }
};

const createBlockedPeriod = async (req, res, next) => {
  try {
    const { date, startTime, endTime, reason } = req.body;
    const period = await BlockedPeriod.create({
      date,
      start_time: startTime || null,
      end_time: endTime || null,
      reason,
    });
    res.status(201).json({ success: true, message: 'Period blocked', data: period });
  } catch (error) {
    next(error);
  }
};

const deleteBlockedPeriod = async (req, res, next) => {
  try {
    const period = await BlockedPeriod.findByPk(req.params.id);
    if (!period) {
      return res.status(404).json({ message: 'Blocked period not found' });
    }
    await period.destroy();
    res.json({ success: true, message: 'Blocked period removed' });
  } catch (error) {
    next(error);
  }
};

// --- Customers ---

const getCustomers = async (req, res, next) => {
  try {
    const customers = await User.findAll({
      where: { role: 'customer' },
      attributes: { exclude: ['password_hash'] },
      order: [['name', 'ASC']],
    });
    res.json({ data: customers });
  } catch (error) {
    next(error);
  }
};

const getCustomerById = async (req, res, next) => {
  try {
    const customer = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password_hash'] },
    });
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const appointments = await Appointment.findAll({
      where: { customer_id: customer.id },
      include: [{ model: Service, as: 'service' }],
      order: [['date', 'DESC'], ['start_time', 'DESC']],
    });

    res.json({ data: customer });
  } catch (error) {
    next(error);
  }
};

const anonymizeCustomer = async (req, res, next) => {
  try {
    const customer = await User.findByPk(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const bcrypt = require('bcryptjs');
    const randomHash = await bcrypt.hash(Math.random().toString(36), 10);

    await customer.update({
      name: 'Deleted User',
      email: `deleted-${customer.id}@anonymized.local`,
      phone: null,
      password_hash: randomHash,
      is_active: false,
    });

    res.json({ success: true, message: 'Customer data anonymized' });
  } catch (error) {
    next(error);
  }
};

// --- Dashboard Stats ---

const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const [
      totalAppointments,
      upcomingCount,
      completedCount,
      cancelledCount,
      noShowCount,
      weeklyBookings,
      popularServices,
    ] = await Promise.all([
      Appointment.count(),
      Appointment.count({ where: { status: 'booked', date: { [Op.gte]: today } } }),
      Appointment.count({ where: { status: 'completed' } }),
      Appointment.count({ where: { status: 'cancelled' } }),
      Appointment.count({ where: { status: 'no-show' } }),
      Appointment.count({ where: { status: 'booked', date: { [Op.between]: [weekAgo, today] } } }),
      Appointment.findAll({
        attributes: [
          'service_id',
          [require('sequelize').fn('COUNT', require('sequelize').col('Appointment.id')), 'count'],
        ],
        include: [{ model: Service, as: 'service', attributes: ['name'] }],
        group: ['service_id', 'Service.id', 'Service.name'],
        order: [[require('sequelize').literal('count'), 'DESC']],
        limit: 5,
      }),
    ]);

    const totalBooked = completedCount + cancelledCount + noShowCount + upcomingCount;
    const noShowRate = totalBooked > 0 ? ((noShowCount / totalBooked) * 100).toFixed(1) : 0;

    res.json({
      stats: {
        totalAppointments,
        upcomingCount,
        completedCount,
        cancelledCount,
        noShowCount,
        noShowRate: parseFloat(noShowRate),
        weeklyBookings,
        popularServices,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  adminCancelAppointment,
  adminRescheduleAppointment,
  getWorkingHours,
  updateWorkingHours,
  getBlockedPeriods,
  createBlockedPeriod,
  deleteBlockedPeriod,
  getCustomers,
  getCustomerById,
  anonymizeCustomer,
  getDashboardStats,
};
