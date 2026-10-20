'use strict';

const bcrypt = require('bcryptjs');

const services = [
  { name: 'Haircut', description: 'Professional haircut and styling', duration: 30, price: 50 },
  { name: 'Hair Styling', description: 'Complete hair styling service', duration: 60, price: 100 },
  { name: 'Manicure', description: 'Nail care and polishing', duration: 45, price: 40 },
  { name: 'Pedicure', description: 'Foot care and nail polishing', duration: 60, price: 60 },
  { name: 'Facial Treatment', description: 'Deep cleansing facial treatment', duration: 45, price: 80 },
  { name: 'Eyebrow Shaping', description: 'Precision eyebrow shaping and threading', duration: 20, price: 25 },
  { name: 'Full Body Massage', description: 'Relaxing full body massage therapy', duration: 90, price: 150 },
  { name: 'Hair Colouring', description: 'Professional hair colouring and highlights', duration: 120, price: 200 },
];

const timestamped = (row) => ({ ...row, created_at: new Date(), updated_at: new Date() });

module.exports = {
  async up(queryInterface, Sequelize) {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@kairos.com';
    const demoEmail = process.env.DEMO_CUSTOMER_EMAIL || 'customer@kairos.com';
    const users = await queryInterface.sequelize.query(
      'SELECT email FROM users WHERE email IN (:emails)',
      { replacements: { emails: [adminEmail, demoEmail] }, type: Sequelize.QueryTypes.SELECT }
    );
    const existingUsers = new Map(users.map((user) => [user.email, user]));
    const usersToCreate = [];
    if (!existingUsers.has(adminEmail)) {
      usersToCreate.push(timestamped({
        name: 'Kairos Administrator', email: adminEmail,
        password_hash: await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123', 12),
        role: 'admin', consent: true, is_active: true,
      }));
    }
    if (!existingUsers.has(demoEmail)) {
      usersToCreate.push(timestamped({
        name: 'Demo Customer', email: demoEmail, phone: '+260 971 000 001',
        password_hash: await bcrypt.hash(process.env.DEMO_CUSTOMER_PASSWORD || 'Customer@123', 12),
        role: 'customer', consent: true, is_active: true,
      }));
    }
    if (usersToCreate.length) await queryInterface.bulkInsert('users', usersToCreate);

    // Keep local demo logins usable when the seeder is run again after a password change.
    for (const [email, password, role] of [
      [adminEmail, process.env.ADMIN_PASSWORD || 'Admin@123', 'admin'],
      [demoEmail, process.env.DEMO_CUSTOMER_PASSWORD || 'Customer@123', 'customer'],
    ]) {
      const existingUser = existingUsers.get(email);
      if (!existingUser) continue;
      await queryInterface.bulkUpdate('users', {
        password_hash: await bcrypt.hash(password, 12),
        role,
        is_active: true,
        updated_at: new Date(),
      }, { email });
    }

    const existingServices = await queryInterface.sequelize.query(
      'SELECT name FROM services', { type: Sequelize.QueryTypes.SELECT }
    );
    const existingServiceNames = new Set(existingServices.map((service) => service.name));
    const servicesToCreate = services
      .filter((service) => !existingServiceNames.has(service.name))
      .map((service) => timestamped({ ...service, is_active: true }));
    if (servicesToCreate.length) await queryInterface.bulkInsert('services', servicesToCreate);

    const existingHours = await queryInterface.sequelize.query(
      'SELECT day_of_week FROM working_hours', { type: Sequelize.QueryTypes.SELECT }
    );
    const existingDays = new Set(existingHours.map((hours) => Number(hours.day_of_week)));
    const workingHours = Array.from({ length: 7 }, (_, day) => timestamped({
      day_of_week: day,
      open_time: day === 6 ? '09:00:00' : day === 0 ? '00:00:00' : '09:00:00',
      close_time: day === 6 ? '14:00:00' : day === 0 ? '00:00:00' : '17:00:00',
      is_active: day !== 0,
    })).filter((hours) => !existingDays.has(hours.day_of_week));
    if (workingHours.length) await queryInterface.bulkInsert('working_hours', workingHours);

    // Seed a pair of clearly identified, future sample appointments once.
    const [demoCustomer] = await queryInterface.sequelize.query(
      'SELECT id FROM users WHERE email = :email',
      { replacements: { email: demoEmail }, type: Sequelize.QueryTypes.SELECT }
    );
    const seededAppointments = await queryInterface.sequelize.query(
      "SELECT id FROM appointments WHERE notes = 'Kairos demo seed' LIMIT 1",
      { type: Sequelize.QueryTypes.SELECT }
    );
    if (demoCustomer && seededAppointments.length === 0) {
      const seededServiceRows = await queryInterface.sequelize.query(
        "SELECT id, name FROM services WHERE name IN ('Manicure', 'Hair Styling')",
        { type: Sequelize.QueryTypes.SELECT }
      );
      const serviceIds = new Map(seededServiceRows.map((service) => [service.name, service.id]));
      const demoDates = [];
      const date = new Date();
      while (demoDates.length < 2) {
        date.setDate(date.getDate() + 1);
        if (date.getDay() !== 0) demoDates.push(date.toISOString().slice(0, 10));
      }
      const examples = [
        { service_id: serviceIds.get('Manicure'), date: demoDates[0], start_time: '10:00:00', end_time: '10:45:00' },
        { service_id: serviceIds.get('Hair Styling'), date: demoDates[1], start_time: '13:00:00', end_time: '14:00:00' },
      ].filter((appointment) => appointment.service_id);
      if (examples.length) {
        await queryInterface.bulkInsert('appointments', examples.map((appointment) => timestamped({
          ...appointment, customer_id: demoCustomer.id, status: 'booked', notes: 'Kairos demo seed',
        })));
      }
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('appointments', { notes: 'Kairos demo seed' });
    await queryInterface.bulkDelete('working_hours', null, {});
    await queryInterface.bulkDelete('services', null, {});
    await queryInterface.bulkDelete('users', {
      email: [process.env.ADMIN_EMAIL || 'admin@kairos.com', process.env.DEMO_CUSTOMER_EMAIL || 'customer@kairos.com'],
    });
  },
};
