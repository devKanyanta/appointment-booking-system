const { DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

const Reminder = sequelize.define('Reminder', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  appointment_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'appointments',
      key: 'id',
    },
  },
  type: {
    type: DataTypes.ENUM('confirmation', 'reminder', 'cancellation'),
    allowNull: false,
  },
  sent_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'sent', 'failed'),
    allowNull: false,
    defaultValue: 'pending',
  },
  error_message: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'reminders',
  timestamps: true,
  updatedAt: false,
  underscored: true,
});

module.exports = Reminder;
