'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('appointments', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      customer_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      service_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'services',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      start_time: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      end_time: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('booked', 'cancelled', 'completed', 'no-show'),
        allowNull: false,
        defaultValue: 'booked',
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    // Indexes for performance
    await queryInterface.addIndex('appointments', ['customer_id']);
    await queryInterface.addIndex('appointments', ['service_id']);
    await queryInterface.addIndex('appointments', ['date']);
    await queryInterface.addIndex('appointments', ['status']);

    // Partial unique index for double-booking prevention
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX idx_unique_booked_slot
      ON appointments (date, start_time, end_time)
      WHERE status = 'booked';
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('appointments');
  },
};
