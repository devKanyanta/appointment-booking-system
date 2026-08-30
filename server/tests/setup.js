const { Sequelize } = require('sequelize');

// Test database configuration
const testDb = new Sequelize(
  process.env.TEST_DB_NAME || 'kairos_schedule_test',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false, // Suppress SQL logs during tests
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

module.exports = { testDb };
