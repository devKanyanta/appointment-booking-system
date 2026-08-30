# Kairos Schedule — Implementation Specification

## 1. Overview

**Kairos Schedule** is a web-based appointment booking and management system for a school-based beauty service business. It allows customers to browse services, book appointments, cancel/reschedule, and receive automated reminders — while the business owner manages services, availability, appointments, and customers through an admin dashboard.

This document is the authoritative implementation spec derived from the [User Requirements Document (URD)](./USER%20REQUIREMENTS%20DOCUMENT%20(URD).md) and interview decisions.

---

## 2. Technology Stack

| Layer | Technology | Notes |
|---|---|---|
| **Frontend** | React 18+ (Vite) | Multi-page app (MPA) with React Router |
| **Styling** | Tailwind CSS 3 + shadcn/ui | shadcn/ui components copy-pasted, no runtime |
| **Admin Calendar** | FullCalendar (library) | Month, week, day views for admin dashboard |
| **State Management** | React Context + useContext | Auth state via context; no Redux |
| **Routing** | React Router v6 | Multi-page with separate route definitions |
| **Backend** | Node.js + Express.js | REST API architecture |
| **ORM** | Sequelize | With migration support |
| **Database** | PostgreSQL | Local for dev, cloud for production |
| **Auth** | JWT (jsonwebtoken) + bcryptjs | HTTP-only cookies for token storage |
| **Email** | Nodemailer (Gmail SMTP) | Free Gmail account for sending |
| **Scheduler** | node-cron | In-process cron for 24h reminders |
| **Testing** | Jest | Backend unit + integration tests |
| **Build Tool** | Vite | Fast dev server and production build |

---

## 3. Project Structure (Monorepo)

```
kairos-schedule/
├── client/                          # React frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── ui/                  # shadcn/ui components
│   │   │   ├── layout/             # Header, Footer, Sidebar
│   │   │   ├── forms/              # Booking forms, service forms
│   │   │   └── common/             # Shared components (LoadingSpinner, Alert, etc.)
│   │   ├── pages/
│   │   │   ├── customer/           # Home, Services, Booking, Dashboard, History
│   │   │   ├── admin/              # Admin Dashboard, Services, Availability, Customers
│   │   │   └── auth/               # Login, Register
│   │   ├── hooks/                  # Custom React hooks (useAuth, useBooking, etc.)
│   │   ├── context/                # AuthContext, etc.
│   │   ├── services/               # API client functions (axios/fetch wrappers)
│   │   ├── utils/                  # Date formatting, validation helpers
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── .env
│
├── server/                          # Node.js/Express backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js          # Sequelize connection config
│   │   │   ├── auth.js              # JWT config (secret, expiry)
│   │   │   └── email.js             # Nodemailer transport config
│   │   ├── models/
│   │   │   ├── index.js             # Model associations
│   │   │   ├── User.js
│   │   │   ├── Service.js
│   │   │   ├── Appointment.js
│   │   │   ├── BlockedPeriod.js
│   │   │   └── Reminder.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── serviceRoutes.js
│   │   │   ├── appointmentRoutes.js
│   │   │   ├── availabilityRoutes.js
│   │   │   ├── adminRoutes.js
│   │   │   └── customerRoutes.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── serviceController.js
│   │   │   ├── appointmentController.js
│   │   │   ├── availabilityController.js
│   │   │   ├── adminController.js
│   │   │   └── customerController.js
│   │   ├── middleware/
│   │   │   ├── auth.js              # JWT verification middleware
│   │   │   ├── admin.js             # Admin role check middleware
│   │   │   ├── validate.js          # Request validation middleware
│   │   │   └── errorHandler.js      # Global error handler
│   │   ├── services/
│   │   │   ├── availabilityEngine.js # Slot calculation logic
│   │   │   ├── bookingService.js     # Booking business logic
│   │   │   └── reminderService.js    # Email reminder logic
│   │   ├── jobs/
│   │   │   └── reminderJob.js        # node-cron scheduled job
│   │   ├── seeds/
│   │   │   └── seed.js              # Initial seed data (admin, services)
│   │   ├── migrations/              # Sequelize migration files
│   │   └── app.js                   # Express app setup
│   ├── tests/
│   │   ├── unit/
│   │   │   ├── availability.test.js
│   │   │   ├── booking.test.js
│   │   │   ├── auth.test.js
│   │   │   └── reminder.test.js
│   │   ├── integration/
│   │   │   ├── bookingFlow.test.js
│   │   │   └── adminFlow.test.js
│   │   └── fixtures/               # Test data fixtures
│   ├── package.json
│   └── .env
│
├── docs/                            # Documentation
│   ├── api.md                       # API documentation
│   ├── database.md                  # Schema / ERD
│   ├── deployment.md                # Deployment instructions
│   └── user-manual/                 # User manuals
│       ├── customer.md
│       └── admin.md
│
├── .gitignore
├── README.md
└── package.json                     # Root package.json (scripts for monorepo)
```

---

## 4. Database Schema

### 4.1 Users Table

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID / SERIAL | PRIMARY KEY | Auto-generated |
| `name` | VARCHAR(255) | NOT NULL | Full name |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Login identifier |
| `phone` | VARCHAR(20) | NULLABLE | Optional |
| `password_hash` | VARCHAR(255) | NOT NULL | bcrypt hash |
| `role` | ENUM('customer', 'admin') | NOT NULL, DEFAULT 'customer' | Role-based access |
| `consent` | BOOLEAN | NOT NULL, DEFAULT false | Data processing consent |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT true | For soft-delete / anonymization |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW | |
| `updated_at` | TIMESTAMP | NOT NULL | Auto-updated |

### 4.2 Services Table

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | SERIAL | PRIMARY KEY | |
| `name` | VARCHAR(255) | NOT NULL | Service name |
| `description` | TEXT | NULLABLE | Optional description |
| `duration` | INTEGER | NOT NULL | Duration in minutes |
| `price` | DECIMAL(10,2) | NOT NULL | Price in local currency |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT true | Soft-delete for services |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | NOT NULL | |

### 4.3 Appointments Table

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | SERIAL | PRIMARY KEY | |
| `customer_id` | INTEGER | FK → Users.id, NOT NULL | |
| `service_id` | INTEGER | FK → Services.id, NOT NULL | |
| `date` | DATE | NOT NULL | Appointment date |
| `start_time` | TIME | NOT NULL | e.g. '10:00:00' |
| `end_time` | TIME | NOT NULL | Calculated from start_time + duration |
| `status` | ENUM('booked', 'cancelled', 'completed', 'no-show') | NOT NULL, DEFAULT 'booked' | |
| `notes` | TEXT | NULLABLE | Optional notes |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | NOT NULL | |

**Index:** Unique index on `(date, start_time, end_time)` WHERE `status = 'booked'` to prevent double-booking at DB level.

### 4.4 BlockedPeriods Table

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | SERIAL | PRIMARY KEY | |
| `date` | DATE | NOT NULL | Blocked date |
| `start_time` | TIME | NULLABLE | NULL = whole day blocked |
| `end_time` | TIME | NULLABLE | NULL = whole day blocked |
| `reason` | VARCHAR(255) | NULLABLE | Optional reason |
| `created_at` | TIMESTAMP | NOT NULL | |

### 4.5 WorkingHours Table

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | SERIAL | PRIMARY KEY | |
| `day_of_week` | INTEGER | UNIQUE, NOT NULL | 0=Sunday, 6=Saturday |
| `open_time` | TIME | NOT NULL | e.g. '09:00:00' |
| `close_time` | TIME | NOT NULL | e.g. '17:00:00' |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT true | Whether business is open that day |

### 4.6 Reminders Table

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | SERIAL | PRIMARY KEY | |
| `appointment_id` | INTEGER | FK → Appointments.id, NOT NULL | |
| `type` | ENUM('confirmation', 'reminder', 'cancellation') | NOT NULL | |
| `sent_at` | TIMESTAMP | NULLABLE | When sent |
| `status` | ENUM('pending', 'sent', 'failed') | NOT NULL, DEFAULT 'pending' | |
| `error_message` | TEXT | NULLABLE | Failure details |
| `created_at` | TIMESTAMP | NOT NULL | |

---

## 5. API Endpoints

### 5.1 Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Customer registration |
| POST | `/api/auth/login` | Public | Login (returns JWT in HTTP-only cookie) |
| POST | `/api/auth/logout` | Authenticated | Clear session |
| GET | `/api/auth/me` | Authenticated | Get current user profile |

### 5.2 Services (Customer-facing)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/services` | Public | List all active services |
| GET | `/api/services/:id` | Public | Get service details |

### 5.3 Services (Admin)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/admin/services` | Admin | Create service |
| GET | `/api/admin/services` | Admin | List all services (incl. inactive) |
| PUT | `/api/admin/services/:id` | Admin | Update service |
| DELETE | `/api/admin/services/:id` | Admin | Soft-delete service |

### 5.4 Availability

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/availability?date=YYYY-MM-DD&serviceId=N` | Authenticated | Get available slots for a date/service |

**Response format:**
```json
{
  "date": "2026-03-15",
  "serviceId": 1,
  "serviceDuration": 60,
  "slots": [
    { "startTime": "09:00", "endTime": "10:00" },
    { "startTime": "10:00", "endTime": "11:00" },
    { "startTime": "14:00", "endTime": "15:00" }
  ]
}
```

### 5.5 Appointments (Customer)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/appointments` | Customer | Book appointment |
| GET | `/api/appointments/upcoming` | Customer | List upcoming appointments |
| GET | `/api/appointments/history` | Customer | List past appointments |
| PUT | `/api/appointments/:id/cancel` | Customer | Cancel appointment |
| PUT | `/api/appointments/:id/reschedule` | Customer | Reschedule appointment |

**Booking request body:**
```json
{
  "serviceId": 1,
  "date": "2026-03-15",
  "startTime": "10:00"
}
```

### 5.6 Admin — Appointments

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/appointments` | Admin | List all appointments (with filters) |
| GET | `/api/admin/appointments/:id` | Admin | Get appointment details |
| PUT | `/api/admin/appointments/:id/status` | Admin | Update status (completed, no-show, cancelled) |
| PUT | `/api/admin/appointments/:id/cancel` | Admin | Cancel on behalf of customer |
| PUT | `/api/admin/appointments/:id/reschedule` | Admin | Reschedule on behalf of customer |

**Filter query params:** `?date=YYYY-MM-DD&status=booked&customerId=N&serviceId=N`

### 5.7 Admin — Availability Management

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/working-hours` | Admin | Get working hours config |
| PUT | `/api/admin/working-hours` | Admin | Update working hours |
| GET | `/api/admin/blocked-periods` | Admin | List blocked periods |
| POST | `/api/admin/blocked-periods` | Admin | Create blocked period |
| DELETE | `/api/admin/blocked-periods/:id` | Admin | Remove blocked period |

### 5.8 Admin — Customers

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/customers` | Admin | List all customers |
| GET | `/api/admin/customers/:id` | Admin | Get customer details + appointment history |
| DELETE | `/api/admin/customers/:id` | Admin | Anonymize customer data |

### 5.9 Customer Account

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| PUT | `/api/customer/profile` | Customer | Update profile |
| DELETE | `/api/customer/account` | Customer | Request account deletion (anonymize) |

---

## 6. Availability Engine

The availability engine is the core business logic component. It calculates available booking slots.

### Algorithm

```
function getAvailableSlots(date, serviceId):
  1. Fetch service → get duration
  2. Fetch working hours for date.dayOfWeek
     → if not active → return []
  3. Fetch all blocked periods for date
  4. Fetch all 'booked' appointments for date
  5. Generate potential slots:
     - Start from open_time
     - Increment by 15-minute intervals (or duration, configurable)
     - Each slot = [startTime, startTime + duration]
  6. Filter out slots that:
     a. Extend beyond close_time
     b. Overlap any blocked period
     c. Overlap any existing 'booked' appointment
  7. Return remaining slots
```

### Slot granularity

- Default: 15-minute intervals for start times
- A 60-minute service starting at 9:00 occupies 9:00–10:00
- A 60-minute service starting at 9:15 occupies 9:15–10:15
- Available if the entire duration fits within working hours and doesn't overlap

### Double-booking prevention

1. **Application level:** Optimistic check before booking, then re-check inside transaction
2. **Database level:** Unique partial index on `(date, start_time, end_time)` WHERE `status = 'booked'`
3. **Transaction level:** `SELECT ... FOR UPDATE` on the appointment slot within a transaction
4. If the slot is taken by the time of INSERT → reject with "Slot no longer available"

---

## 7. Authentication & Authorization

### JWT Strategy

- JWT stored in **HTTP-only, Secure, SameSite=Lax cookie**
- Token expiry: 24 hours (configurable via `JWT_EXPIRY` env var)
- Secret stored in `.env` as `JWT_SECRET`

### Roles

| Role | Access |
|---|---|
| `customer` | Customer-facing pages, own appointments |
| `admin` | Admin dashboard, all appointments, service management |

### Middleware Chain

```
Request → CORS → Body Parser → Route Handler
                ↳ auth.js: verifies JWT, attaches req.user
                ↳ admin.js: checks req.user.role === 'admin'
                ↳ validate.js: validates request body/params
```

### Password Security

- bcrypt with salt rounds = 12
- Passwords never returned in API responses

---

## 8. Notification System

### Email Types

| Type | Trigger | Template |
|---|---|---|
| Booking Confirmation | Appointment created | Service name, date, time, duration |
| Cancellation Confirmation | Appointment cancelled | Service name, date, time |
| Reminder | 24 hours before appointment | Service name, date, time, location info |

### Email Implementation

- **Transport:** Nodemailer with Gmail SMTP
- **Env vars:** `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- **Templates:** Simple HTML email templates (stored in `server/src/templates/`)

### Reminder Job (node-cron)

```
Schedule: Runs every hour (e.g., "0 * * * *")
Logic:
  1. Query appointments where:
     - date = tomorrow
     - status = 'booked'
     - No reminder of type 'reminder' exists
  2. For each appointment:
     - Fetch customer email
     - Send reminder email
     - Create Reminder record with status 'sent' or 'failed'
  3. Log any failures
```

---

## 9. Frontend Pages & Routing

### 9.1 Customer Routes

| Path | Page | Auth Required |
|---|---|---|
| `/` | Home / Landing page | No |
| `/services` | Service catalogue | No |
| `/services/:id` | Service details + booking link | No |
| `/login` | Customer login | No |
| `/register` | Customer registration | No |
| `/dashboard` | Customer dashboard (upcoming appointments) | Yes |
| `/dashboard/history` | Appointment history | Yes |
| `/dashboard/book` | Booking flow (service → date → time → confirm) | Yes |
| `/dashboard/appointments/:id` | Appointment details (cancel/reschedule) | Yes |
| `/dashboard/profile` | Account management | Yes |

### 9.2 Admin Routes

| Path | Page | Auth Required |
|---|---|---|
| `/admin/login` | Admin login | No |
| `/admin` | Admin dashboard | Admin |
| `/admin/appointments` | Appointment calendar + list | Admin |
| `/admin/services` | Service management (CRUD) | Admin |
| `/admin/availability` | Working hours + blocked periods | Admin |
| `/admin/customers` | Customer list + details | Admin |

### 9.3 Booking Flow (Customer UX)

```
Step 1: Select Service     → Browse service cards with name, duration, price
Step 2: Select Date         → Date picker (min=today, max=today+60 days)
Step 3: Select Time         → Available time slots displayed as buttons
Step 4: Review & Confirm    → Summary card with service, date, time, price
Step 5: Booking Complete    → Confirmation message + email sent
```

**Target:** Complete booking in < 90 seconds (AC-013).

---

## 10. Frontend Component Architecture

### Layout Components

- `CustomerLayout` — header with nav, main content area, footer
- `AdminLayout` — sidebar navigation, top bar, main content area
- `AuthLayout` — centered card layout for login/register

### Key Components

- `ServiceCard` — displays service name, duration, price
- `TimeSlotPicker` — grid of available time slots
- `DatePicker` — calendar date selection
- `BookingSummary` — confirmation card before final booking
- `AppointmentList` — table/cards of appointments with status badges
- `AdminCalendar` — FullCalendar integration for admin view
- `ServiceForm` — create/edit service form
- `WorkingHoursForm` — day-by-day working hours config
- `BlockedPeriodForm` — block date/time form
- `CustomerTable` — searchable/filterable customer list

### shadcn/ui Components (to install)

- Button, Card, Dialog, DropdownMenu, Input, Label, Select, Separator, Sheet, Skeleton, Table, Tabs, Toast, Badge, Avatar, Calendar (for date picker), Form, Popover, Command

---

## 11. Environment Variables

### Backend (.env)

```
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kairos_schedule
DB_USER=postgres
DB_PASSWORD=your_password

# Auth
JWT_SECRET=your-super-secret-key-here
JWT_EXPIRY=24h

# Admin Seed
ADMIN_EMAIL=admin@kairos.com
ADMIN_PASSWORD=Admin@123

# Email (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="Kairos Schedule <your-gmail@gmail.com>"

# Reminder
REMINDER_CRON_SCHEDULE="0 * * * *"
REMINDER_HOURS_BEFORE=24
```

### Frontend (.env)

```
VITE_API_URL=http://localhost:5000/api
```

---

## 12. Seed Data

### Default Admin (from .env)

Created on first server startup if no admin exists. Reads `ADMIN_EMAIL` and `ADMIN_PASSWORD` from environment.

### Default Services

Pre-populated beauty services:

| Service | Duration (min) | Price |
|---|---|---|
| Haircut | 30 | 50.00 |
| Hair Styling | 60 | 100.00 |
| Manicure | 45 | 40.00 |
| Pedicure | 60 | 60.00 |
| Facial Treatment | 45 | 80.00 |
| Eyebrow Shaping | 20 | 25.00 |
| Full Body Massage | 90 | 150.00 |
| Hair Colouring | 120 | 200.00 |

### Default Working Hours

Monday–Friday: 09:00–17:00
Saturday: 09:00–14:00
Sunday: Closed

---

## 13. Security Implementation

| Requirement | Implementation |
|---|---|
| SQL Injection | Sequelize ORM with parameterized queries |
| Password Theft | bcrypt (12 salt rounds) |
| XSS | React auto-escaping + input validation + output encoding |
| Unauthorised Admin | `admin` middleware checks `role === 'admin'` |
| Session Theft | HTTP-only, Secure, SameSite cookies |
| Credential Exposure | `.env` files excluded from Git |
| Data Interception | HTTPS in production (not enforced in dev) |
| Double-Booking | DB unique partial index + `SELECT FOR UPDATE` in transaction |
| Input Validation | express-validator or Joi on all endpoints |
| CORS | Configured to allow frontend origin only |

---

## 14. Testing Plan

### Backend Tests (Jest)

| Test Category | What to Test |
|---|---|
| **Unit: Availability Engine** | Slot calculation with various working hours, blocked periods, overlapping bookings |
| **Unit: Booking Service** | Booking creation, cancellation policy (6h rule), rescheduling logic |
| **Unit: Auth** | Registration validation, login, password hashing, JWT generation |
| **Unit: Reminder Service** | Reminder eligibility, email sending (mocked), delivery logging |
| **Integration: Booking Flow** | Full register → login → check availability → book → confirm |
| **Integration: Admin Flow** | Admin login → create service → manage appointments → mark complete |

### Test Data

- Use `beforeEach` to reset DB state
- Use factory functions for generating test users, services, appointments
- Mock Nodemailer for email tests
- Use SQLite in-memory for fast unit tests (Sequelize supports this)

---

## 15. Migration & Schema Management

- Use Sequelize CLI for migrations
- Migration files in `server/src/migrations/`
- Run `npx sequelize-cli db:migrate` to apply
- Seed data via `npx sequelize-cli db:seed:all`
- Version control all migration files

---

## 16. Booking Conflict Resolution (Race Conditions)

### Strategy

```
1. Customer selects slot → frontend sends POST /api/appointments
2. Backend begins transaction
3. Backend runs SELECT ... FOR UPDATE on the slot window
   → Locks the row range for the date+time
4. Backend re-checks: does any 'booked' appointment overlap?
5. If no overlap → INSERT new appointment → COMMIT
6. If overlap exists → ROLLBACK → Return 409 "Slot no longer available"
7. Frontend shows error, prompts to pick another slot
```

### Database-Level Safety

Partial unique index ensures even if application logic fails:
```sql
CREATE UNIQUE INDEX idx_unique_booked_slot
  ON appointments (date, start_time, end_time)
  WHERE status = 'booked';
```

---

## 17. Data Anonymization (Account Deletion)

When a customer requests account deletion (FR-084):

1. Set `is_active = false` on the User record
2. Replace `name` with `"Deleted User"`
3. Replace `email` with `"deleted-{userId}@anonymized.local"`
4. Set `phone` to NULL
5. Set `password_hash` to a random hash
6. **Preserve** all appointment records (they reference the user ID)
7. Appointments continue to appear in admin history with anonymized customer info

---

## 18. Deployment Notes

- **Dev:** Local PostgreSQL + Vite dev server + Express on port 5000
- **Production (future):** Backend on Render, Frontend on Vercel
- Frontend `VITE_API_URL` points to deployed backend URL
- Backend `CORS_ORIGIN` set to deployed frontend URL
- PostgreSQL via a free-tier provider (Supabase/Neon) for production
- `.env` files never committed

---

## 19. Reporting & Metrics (Basic)

The admin dashboard should display:

- Total appointments (this week/month)
- Upcoming appointments count
- Completed / Cancelled / No-show counts
- No-show rate (no-shows / total bookings)
- Popular services (by booking count)
- Bookings by day of week

No advanced BI tools required — simple aggregations via SQL queries.

---

## 20. Implementation Phases (Sprint Plan)

### Sprint 1 — Foundation & Auth (Weeks 1–2)
- Project scaffolding (monorepo, Vite, Express, Sequelize)
- Database schema + migrations
- User model + registration + login
- JWT auth middleware
- Admin seed from .env
- Basic React routing + auth context

### Sprint 2 — Services & Availability (Weeks 3–4)
- Service CRUD (admin)
- Service listing (customer)
- Working hours configuration (admin)
- Blocked period management (admin)
- Availability engine
- Seed data

### Sprint 3 — Booking Engine (Weeks 5–7)
- Booking flow (customer)
- Double-booking prevention
- Cancellation with 6h policy
- Rescheduling
- Appointment history
- Customer dashboard

### Sprint 4 — Admin Dashboard & Reminders (Weeks 8–9)
- Admin dashboard with FullCalendar
- Appointment filtering and status management
- Nodemailer email templates
- node-cron reminder job
- Reminder delivery logging

### Sprint 5 — Polish, Testing & Documentation (Week 10)
- Backend unit + integration tests
- UI polish + responsive design
- Error handling + edge cases
- API documentation
- User manuals (customer + admin)

---

## 21. Acceptance Criteria Summary

| ID | Criterion | Target |
|---|---|---|
| AC-001 | Customer registration works | Pass |
| AC-002 | Customer login/logout works | Pass |
| AC-003 | Admin login works | Pass |
| AC-004 | Services CRUD works | Pass |
| AC-005 | Availability calculated correctly | Pass |
| AC-006 | Customers can book appointments | Pass |
| AC-007 | Double-booking prevented | Zero incidents |
| AC-008 | Customers can cancel (6h rule) | Pass |
| AC-009 | Customers can reschedule | Pass |
| AC-010 | Admin can manage appointments | Pass |
| AC-011 | Emails (confirmation, reminder) sent | Pass |
| AC-012 | Mobile responsive interface | Pass |
| AC-013 | Booking < 90 seconds | < 90s |
| AC-014 | No critical security vulnerabilities | Pass |
| AC-015 | User manual enables admin tasks | Pass |
| AC-016 | System runs without crashes | Pass |

---

**End of Specification**
