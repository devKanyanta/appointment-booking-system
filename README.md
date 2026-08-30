# Kairos Schedule

A web-based appointment booking and management system for a school-based beauty service business.

## Tech Stack

- **Frontend:** React 18 + Vite + Tailwind CSS + shadcn/ui
- **Backend:** Node.js + Express.js + Sequelize ORM
- **Database:** PostgreSQL
- **Auth:** JWT (HTTP-only cookies) + bcrypt
- **Email:** Nodemailer (Gmail SMTP)
- **Scheduler:** node-cron

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm

## Setup

### 1. Install Dependencies

```bash
npm run install:all
```

### 2. Database Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE kairos_schedule;
```

2. Copy environment files and configure:
```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

3. Edit `server/.env` with your database credentials.

### 3. Run Migrations & Seed

```bash
npm run migrate
npm run seed
```

### 4. Start Development

```bash
npm run dev
```

This starts both the server (http://localhost:5000) and client (http://localhost:5173).

## Default Admin Account

- **Email:** admin@kairos.com
- **Password:** Admin@123

## API Endpoints

### Authentication
- `POST /api/auth/register` — Customer registration
- `POST /api/auth/login` — Login
- `POST /api/auth/logout` — Logout
- `GET /api/auth/me` — Get current user

### Services
- `GET /api/services` — List active services (public)
- `GET /api/services/:id` — Get service details (public)
- `POST /api/admin/services` — Create service (admin)
- `PUT /api/admin/services/:id` — Update service (admin)
- `DELETE /api/admin/services/:id` — Deactivate service (admin)

### Availability
- `GET /api/availability?date=YYYY-MM-DD&serviceId=N` — Get available slots

### Appointments
- `POST /api/appointments` — Book appointment
- `GET /api/appointments/upcoming` — List upcoming
- `GET /api/appointments/history` — List history
- `PUT /api/appointments/:id/cancel` — Cancel
- `PUT /api/appointments/:id/reschedule` — Reschedule

### Admin
- `GET /api/admin/dashboard` — Dashboard stats
- `GET /api/admin/appointments` — List all appointments
- `PUT /api/admin/appointments/:id/status` — Update status
- `GET /api/admin/working-hours` — Get working hours
- `PUT /api/admin/working-hours` — Update working hours
- `GET /api/admin/blocked-periods` — List blocked periods
- `POST /api/admin/blocked-periods` — Create blocked period
- `DELETE /api/admin/blocked-periods/:id` — Remove blocked period
- `GET /api/admin/customers` — List customers
- `GET /api/admin/customers/:id` — Customer detail + history
- `DELETE /api/admin/customers/:id` — Anonymize customer

### Customer
- `PUT /api/customer/profile` — Update profile
- `DELETE /api/customer/account` — Delete account

## Project Structure

```
kairos-schedule/
├── client/          # React frontend (Vite)
├── server/          # Express backend
├── docs/            # Documentation
└── README.md
```

## License

Academic project — The University of Zambia
