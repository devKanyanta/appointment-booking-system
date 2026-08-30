const { DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

const WorkingHours = sequelize.define('WorkingHours', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  day_of_week: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    validate: {
      min: 0,
      max: 6,
    },
  },
  open_time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  close_time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: 'working_hours',
  timestamps: true,
  underscored: true,
});

module.exports = WorkingHours;
