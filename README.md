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

- Node.js 18+ and npm
- PostgreSQL 14+ (a local PostgreSQL server must be running)

## Run Locally

The app expects a PostgreSQL database named `kairos_schedule`. In a local PostgreSQL setup, use a development role that can create tables and run the migrations. The defaults use database user `postgres` with no password; configure `server/.env` if your PostgreSQL credentials differ.

```bash
# Install the frontend and backend dependencies
npm run install:all

# Apply schema migrations and insert sample data (safe to re-run)
npm run db:setup

# Start the API and Vite development site
npm run dev
```

Open **http://localhost:5173**. The API health endpoint is **http://localhost:5000/api/health**. Vite proxies `/api` requests to the API.

Optional `server/.env` settings:

```dotenv
DB_NAME=kairos_schedule
DB_USER=postgres
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=replace-with-a-long-random-local-secret
ADMIN_EMAIL=admin@kairos.com
ADMIN_PASSWORD=Admin@123
DEMO_CUSTOMER_EMAIL=customer@kairos.com
DEMO_CUSTOMER_PASSWORD=Customer@123
```

The seeder inserts a demo admin, demo customer, eight services, working hours for all seven weekdays (closed Sunday), and two upcoming sample appointments. Existing services/hours are left in place, and existing appointments are not overwritten. The demo appointments use the `Kairos demo seed` note.

## Demo Accounts

- **Admin:** `admin@kairos.com` / `Admin@123` (sign in at `/admin/login`)
- **Customer:** `customer@kairos.com` / `Customer@123`

These credentials are for local development only. Set a private `ADMIN_PASSWORD`, `DEMO_CUSTOMER_PASSWORD`, and strong `JWT_SECRET` before any non-local deployment.

## Production Frontend

Build the client with `npm run build`; when `client/dist` exists, the Express server serves it as well as the API. In development, run `npm run dev` and browse via Vite on port 5173.

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
