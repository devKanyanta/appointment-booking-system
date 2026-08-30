const bcrypt = require('bcryptjs');
const { User, Service, Appointment } = require('../models');
const { Op } = require('sequelize');

const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    await req.user.update({ name, phone });
    res.json({
      success: true,
      message: 'Profile updated',
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteAccount = async (req, res, next) => {
  try {
    const randomHash = await bcrypt.hash(Math.random().toString(36), 12);

    await req.user.update({
      name: 'Deleted User',
      email: `deleted-${req.user.id}@anonymized.local`,
      phone: null,
      password_hash: randomHash,
      is_active: false,
    });

    res.clearCookie('kairos_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    res.json({ success: true, message: 'Account deleted and data anonymized' });
  } catch (error) {
    next(error);
  }
};

const getAppointments = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const appointments = await Appointment.findAll({
      where: {
        customer_id: req.user.id,
      },
      include: [
        { model: Service, as: 'service' },
      ],
      order: [['date', 'DESC'], ['start_time', 'DESC']],
    });

    res.json({ data: appointments });
  } catch (error) {
    next(error);
  }
};

module.exports = { updateProfile, deleteAccount, getAppointments };
