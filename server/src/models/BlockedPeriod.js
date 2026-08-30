const { DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

const BlockedPeriod = sequelize.define('BlockedPeriod', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  reason: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  tableName: 'blocked_periods',
  timestamps: true,
  updatedAt: false,
  underscored: true,
});

module.exports = BlockedPeriod;
