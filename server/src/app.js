const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const { sequelize } = require('./models');
const { errorHandler } = require('./middleware/errorHandler');
const { startReminderJob } = require('./jobs/reminderJob');

// Routes
const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const availabilityRoutes = require('./routes/availabilityRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const customerRoutes = require('./routes/customerRoutes');

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Middleware
const configuredCorsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
  : ['http://localhost:5173', 'http://localhost:5174'];
app.use(cors({
  origin: configuredCorsOrigins,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/customer', customerRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve the built Vite frontend when available so the whole app can run on one local origin.
const clientBuild = path.resolve(__dirname, '../../client/dist');
if (require('fs').existsSync(clientBuild)) {
  app.use(express.static(clientBuild));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(clientBuild, 'index.html'));
  });
}

// Error handler
app.use(errorHandler);

// Seed admin user if needed
async function seedAdmin() {
  const { User } = require('./models');
  const bcrypt = require('bcryptjs');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@kairos.com';
  const existingAdmin = await User.findOne({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123', 12);
    await User.create({
      name: 'Administrator',
      email: adminEmail,
      password_hash: hash,
      role: 'admin',
      consent: true,
    });
    console.log(`Admin user created: ${adminEmail}`);
  } else if (process.env.NODE_ENV !== 'production' && process.env.RESET_DEMO_ADMIN_PASSWORD === 'true') {
    existingAdmin.password_hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123', 12);
    existingAdmin.is_active = true;
    await existingAdmin.save();
    console.log(`Local demo admin credentials refreshed: ${adminEmail}`);
  }
}

// Start server only when run directly (not when imported for tests)
if (require.main === module) {
  async function start() {
    try {
      await sequelize.authenticate();
      console.log('Database connected');

      if (process.env.NODE_ENV !== 'production') {
        await sequelize.sync({ alter: false });
        console.log('Models synchronized');
      }

      await seedAdmin();
      if (process.env.ENABLE_REMINDER_JOB !== 'false' && process.env.SMTP_HOST) startReminderJob();
      else console.log('[Reminder Job] Disabled (configure SMTP_HOST to enable email reminders)');

      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }
  start();
}

module.exports = app;
