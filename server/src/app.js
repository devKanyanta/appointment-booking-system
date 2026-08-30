const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
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
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
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
      startReminderJob();

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
