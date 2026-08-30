'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface) {
    // Seed admin user
    const adminPasswordHash = await bcrypt.hash(
      process.env.ADMIN_PASSWORD || 'Admin@123',
      12
    );

    await queryInterface.bulkInsert('users', [
      {
        name: 'Administrator',
        email: process.env.ADMIN_EMAIL || 'admin@kairos.com',
        password_hash: adminPasswordHash,
        role: 'admin',
        consent: true,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // Seed services
    await queryInterface.bulkInsert('services', [
      {
        name: 'Haircut',
        description: 'Professional haircut and styling',
        duration: 30,
        price: 50.00,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Hair Styling',
        description: 'Complete hair styling service',
        duration: 60,
        price: 100.00,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Manicure',
        description: 'Nail care and polishing',
        duration: 45,
        price: 40.00,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Pedicure',
        description: 'Foot care and nail polishing',
        duration: 60,
        price: 60.00,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Facial Treatment',
        description: 'Deep cleansing facial treatment',
        duration: 45,
        price: 80.00,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Eyebrow Shaping',
        description: 'Precision eyebrow shaping and threading',
        duration: 20,
        price: 25.00,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Full Body Massage',
        description: 'Relaxing full body massage therapy',
        duration: 90,
        price: 150.00,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Hair Colouring',
        description: 'Professional hair colouring and highlights',
        duration: 120,
        price: 200.00,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // Seed working hours (Mon-Sat)
    await queryInterface.bulkInsert('working_hours', [
      { day_of_week: 0, open_time: '00:00:00', close_time: '00:00:00', is_active: false, created_at: new Date(), updated_at: new Date() }, // Sunday - closed
      { day_of_week: 1, open_time: '09:00:00', close_time: '17:00:00', is_active: true, created_at: new Date(), updated_at: new Date() },  // Monday
      { day_of_week: 2, open_time: '09:00:00', close_time: '17:00:00', is_active: true, created_at: new Date(), updated_at: new Date() },  // Tuesday
      { day_of_week: 3, open_time: '09:00:00', close_time: '17:00:00', is_active: true, created_at: new Date(), updated_at: new Date() },  // Wednesday
      { day_of_week: 4, open_time: '09:00:00', close_time: '17:00:00', is_active: true, created_at: new Date(), updated_at: new Date() },  // Thursday
      { day_of_week: 5, open_time: '09:00:00', close_time: '17:00:00', is_active: true, created_at: new Date(), updated_at: new Date() },  // Friday
      { day_of_week: 6, open_time: '09:00:00', close_time: '14:00:00', is_active: true, created_at: new Date(), updated_at: new Date() },  // Saturday
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('working_hours', null, {});
    await queryInterface.bulkDelete('services', null, {});
    await queryInterface.bulkDelete('users', null, {});
  },
};
