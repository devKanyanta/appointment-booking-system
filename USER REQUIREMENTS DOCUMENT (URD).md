# USER REQUIREMENTS DOCUMENT (URD)

## Appointment Booking Software — Kairos Schedule

---

## 1. Document Information

| Field | Details |
|---|---|
| **Project Title** | Appointment Booking Software |
| **System Name** | Kairos Schedule |
| **Student Name** | Mulenga Chileshe |
| **Computer Number** | 2022039904 |
| **Supervisor** | Mr. Alinani Simukanga |
| **Department** | Computer Science Department |
| **Institution** | The University of Zambia |
| **School** | School of Natural Sciences |
| **Date of Submission** | 27th March 2026 |
| **Document Type** | User Requirements Document (URD) |
| **Version** | 1.0 |

---

# 2. Introduction

## 2.1 Purpose of the Document

This User Requirements Document defines the requirements for the development of **Kairos Schedule**, a web-based appointment booking and management system designed for a school-based beauty service business.

The system will allow customers to browse available beauty services, view available appointment times, make bookings, cancel or reschedule appointments, and receive automated reminders.

The system will also provide the business owner with an administrative dashboard for managing services, working hours, unavailable periods, customer appointments, and customer records.

This document provides a clear description of what the system is expected to do and the requirements that must be satisfied for the project to be considered successful.

---

# 3. Project Background

The beauty service business currently relies primarily on informal appointment-booking methods such as direct messages, text messages, paper records, and verbal agreements.

These approaches create several operational problems, including:

- Double-booking of appointment slots.
- Difficulty determining available appointment times.
- Fragmented customer records.
- High administrative workload.
- Difficulty managing cancellations and rescheduling.
- Missed appointments due to lack of reminders.
- Difficulty managing services with different durations.
- Limited historical information about customer bookings.
- Poor visibility of business availability.

Kairos Schedule will replace these manual processes with a centralised web-based appointment management platform.

---

# 4. Project Aim

The aim of the system is to provide a web-based appointment management platform that enables customers to conveniently book, cancel, and reschedule beauty services while allowing the business owner to manage services, availability, appointments, and customer records.

The system should reduce double-booking, administrative workload, and appointment no-shows while improving the overall customer experience.

---

# 5. Project Objectives

The system shall support the following project objectives:

1. Design and implement a relational database for users, services, appointments, and availability.
2. Provide customer registration and authentication.
3. Allow customers to view available appointment slots in real time.
4. Allow customers to book appointments online.
5. Allow customers to cancel and reschedule appointments.
6. Provide an administrative dashboard for managing the business.
7. Allow the administrator to manage services and service durations.
8. Allow the administrator to configure working hours and unavailable periods.
9. Implement automated appointment confirmation and reminder notifications.
10. Prevent appointment conflicts and double-booking.
11. Maintain customer appointment history.
12. Provide a responsive interface suitable for mobile devices.
13. Evaluate the system through testing and pilot deployment.

---

# 6. Stakeholders

| Stakeholder | Role / Interest |
|---|---|
| **Customers** | Use the system to register, view services, book appointments, and manage bookings. |
| **Business Owner / Administrator** | Manages services, availability, appointments, and customers. |
| **Student Developer** | Designs, develops, tests, documents, and maintains the system. |
| **Project Supervisor** | Provides academic supervision and evaluates the project. |
| **University / Department** | Evaluates the project as a final-year software engineering project. |

---

# 7. User Types

The system will support two primary user roles.

## 7.1 Customer

Customers will be able to:

- Register for an account.
- Log in and log out.
- View available services.
- View service duration and price.
- View available appointment slots.
- Book appointments.
- View upcoming appointments.
- View appointment history.
- Cancel appointments.
- Reschedule appointments.
- Receive booking confirmations.
- Receive appointment reminders.
- Request deletion of their account and associated data.

## 7.2 Administrator

The administrator represents the business owner and will be able to:

- Log into the administrative dashboard.
- Manage services.
- Configure service durations and prices.
- Configure business working hours.
- Block unavailable dates and time periods.
- View upcoming appointments.
- View historical appointments.
- Filter appointments.
- Cancel or reschedule appointments on behalf of customers.
- Mark appointments as completed.
- Mark appointments as no-shows.
- View customer information and appointment history.
- Manage customer accounts where permitted.
- Monitor reminder delivery status.

---

# 8. Scope

## 8.1 In-Scope Requirements

The system will include:

- Customer registration.
- Customer authentication.
- Administrator authentication.
- Service catalogue management.
- Service duration and price management.
- Availability calculation.
- Appointment booking.
- Appointment cancellation.
- Appointment rescheduling.
- Appointment history.
- Working-hour configuration.
- Blocked time/date management.
- Administrative appointment management.
- Automated email reminders.
- Booking confirmation notifications.
- Responsive web interface.
- Database-backed appointment management.
- Double-booking prevention.
- Basic reporting and operational statistics.

## 8.2 Out-of-Scope Requirements

The following features will not be implemented in the initial version:

- Online payment processing.
- Mobile money integration.
- Credit/debit card processing.
- Multi-branch support.
- Multi-location support.
- Real-time chat.
- Third-party calendar integration.
- Google Calendar integration.
- iCal integration.
- Native Android application.
- Native iOS application.
- Advanced business intelligence dashboards.
- Inventory management.
- Technician-specific login accounts.
- Complex staff role management.
- Advanced artificial intelligence scheduling.
- Automated customer profiling.

---

# 9. Functional Requirements

## 9.1 User Registration

**FR-001:** The system shall allow customers to create an account.

**FR-002:** The registration form shall collect:

- Full name.
- Email address.
- Optional phone number.
- Password.
- Consent to data storage and appointment reminders.

**FR-003:** The system shall validate user registration information.

**FR-004:** The system shall prevent registration using an email address that is already registered.

**FR-005:** Passwords shall not be stored in plaintext.

**FR-006:** The system shall require users to provide consent before completing registration.

---

# 10. Authentication Requirements

**FR-007:** Customers shall be able to log into their accounts.

**FR-008:** Administrators shall be able to authenticate securely.

**FR-009:** The system shall distinguish between customer and administrator roles.

**FR-010:** The system shall prevent customers from accessing administrator functions.

**FR-011:** Users shall be able to log out.

**FR-012:** Authentication sessions shall expire after a defined period.

**FR-013:** Authentication credentials shall be transmitted securely.

---

# 11. Service Management Requirements

## 11.1 Customer Service Viewing

**FR-014:** Customers shall be able to view the available services.

**FR-015:** Each service shall display:

- Service name.
- Description where applicable.
- Duration.
- Price.

**FR-016:** Customers shall be able to select a service before selecting an appointment time.

## 11.2 Administrator Service Management

**FR-017:** The administrator shall be able to create services.

**FR-018:** The administrator shall be able to view services.

**FR-019:** The administrator shall be able to edit services.

**FR-020:** The administrator shall be able to delete services.

**FR-021:** The administrator shall be able to define the duration of each service.

**FR-022:** The administrator shall be able to define the price of each service.

---

# 12. Availability Management

**FR-023:** The administrator shall be able to configure business working hours.

**FR-024:** Working hours shall be configurable for individual days of the week.

**FR-025:** The administrator shall be able to block specific dates.

**FR-026:** The administrator shall be able to block specific time periods.

**FR-027:** Blocked periods shall not appear as available appointment slots.

**FR-028:** The system shall account for service duration when calculating available slots.

**FR-029:** The system shall account for existing bookings when calculating availability.

**FR-030:** The system shall prevent appointments from being scheduled outside working hours.

---

# 13. Appointment Booking Requirements

**FR-031:** Customers shall be able to select a service.

**FR-032:** Customers shall be able to select an appointment date.

**FR-033:** The system shall display available appointment times for the selected date.

**FR-034:** The system shall calculate available times based on:

- Working hours.
- Service duration.
- Existing appointments.
- Blocked periods.

**FR-035:** Customers shall be able to select an available appointment time.

**FR-036:** The system shall confirm the appointment before creating the booking.

**FR-037:** The system shall create an appointment record after successful booking.

**FR-038:** The appointment shall contain:

- Customer.
- Service.
- Date.
- Start time.
- End time.
- Appointment status.
- Creation timestamp.
- Modification timestamp.

**FR-039:** The system shall prevent two customers from booking the same time period.

**FR-040:** The system shall perform a final availability check before confirming a booking.

---

# 14. Double-Booking Prevention

**FR-041:** The system shall prevent simultaneous customers from booking the same appointment slot.

**FR-042:** Appointment creation shall use database transactions.

**FR-043:** The system shall use appropriate database locking mechanisms to protect appointment creation from race conditions.

**FR-044:** If a selected appointment slot becomes unavailable during booking, the system shall reject the booking.

**FR-045:** The customer shall be informed that the selected slot is no longer available.

**FR-046:** The customer shall be prompted to select another available time.

---

# 15. Appointment Cancellation

**FR-047:** Customers shall be able to cancel upcoming appointments.

**FR-048:** Cancellation shall be subject to the configured cancellation policy.

**FR-049:** The initial business rule shall require cancellation at least **six hours before the appointment**.

**FR-050:** The system shall prevent cancellation when the six-hour deadline has passed.

**FR-051:** Cancelled appointments shall retain their historical record.

**FR-052:** The appointment status shall be changed to `cancelled`.

**FR-053:** The system shall send a cancellation confirmation to the customer.

---

# 16. Appointment Rescheduling

**FR-054:** Customers shall be able to request rescheduling of eligible appointments.

**FR-055:** The system shall display available alternative appointment slots.

**FR-056:** The new appointment shall be checked for conflicts.

**FR-057:** Rescheduling shall preserve the original appointment record for audit purposes.

**FR-058:** The system shall create or update the appropriate appointment records following a successful reschedule.

**FR-059:** The customer shall receive confirmation of the new appointment.

---

# 17. Appointment History

**FR-060:** Customers shall be able to view their upcoming appointments.

**FR-061:** Customers shall be able to view previous appointments.

**FR-062:** Appointment history shall display relevant information including:

- Service.
- Date.
- Time.
- Status.

**FR-063:** Administrators shall be able to view appointment history for all customers.

---

# 18. Administrative Dashboard

**FR-064:** The system shall provide an administrator dashboard.

**FR-065:** The dashboard shall display upcoming appointments.

**FR-066:** The administrator shall be able to view appointments in a calendar-based interface.

**FR-067:** The administrator shall be able to view appointments in a table/list format.

**FR-068:** The administrator shall be able to filter appointments by:

- Date.
- Status.
- Customer.
- Service.

**FR-069:** The administrator shall be able to mark appointments as completed.

**FR-070:** The administrator shall be able to mark appointments as no-shows.

**FR-071:** The administrator shall be able to manage appointments on behalf of customers.

---

# 19. Reminder and Notification Requirements

**FR-072:** The system shall send a booking confirmation after successful appointment creation.

**FR-073:** The system shall send cancellation confirmation after an appointment is cancelled.

**FR-074:** The system shall send appointment reminders approximately 24 hours before the scheduled appointment.

**FR-075:** Reminders shall be sent to the customer's registered email address.

**FR-076:** The system shall automatically identify appointments requiring reminders.

**FR-077:** Cancelled appointments shall not receive reminders.

**FR-078:** The system shall record reminder delivery status.

**FR-079:** Failed notification attempts shall be logged.

---

# 20. Customer Data Management

**FR-080:** The system shall store customer names.

**FR-081:** The system shall store customer email addresses.

**FR-082:** The system may store customer phone numbers where provided.

**FR-083:** The administrator shall be able to view customer appointment history.

**FR-084:** Customers shall be able to request deletion of their account.

**FR-085:** Deleted customer information shall be removed or anonymised in accordance with the applicable retention policy.

---

# 21. Appointment Statuses

The system shall support the following appointment statuses:

| Status | Description |
|---|---|
| `booked` | Appointment has been successfully scheduled. |
| `cancelled` | Appointment was cancelled. |
| `completed` | Customer attended and received the service. |
| `no-show` | Customer did not attend and did not cancel. |

---

# 22. Business Rules

## BR-001: Service Duration

Every service must have a defined duration.

The availability engine shall use the service duration when calculating whether a time slot is available.

## BR-002: Working Hours

Appointments shall only be created within configured business working hours.

## BR-003: Blocked Periods

Appointments shall not overlap with administrator-defined blocked dates or times.

## BR-004: Existing Appointments

A new appointment shall not overlap an existing confirmed appointment.

## BR-005: Cancellation Policy

Customers may cancel an appointment only when at least six hours remain before the scheduled start time.

## BR-006: First-Come, First-Served

Available appointment slots shall generally be allocated on a first-come, first-served basis.

## BR-007: Booking Conflict

When two users attempt to book the same slot simultaneously, only one booking shall succeed.

## BR-008: Reminder Eligibility

Cancelled appointments shall not receive appointment reminders.

## BR-009: Administrator Privileges

Only authenticated administrators shall be permitted to perform administrative functions.

## BR-010: Historical Records

Cancelled, completed, and no-show appointments shall remain available for historical and reporting purposes.

---

# 23. Availability Calculation Requirements

The availability engine shall determine available appointment slots using the following inputs:

1. Selected date.
2. Selected service.
3. Service duration.
4. Business working hours.
5. Blocked dates.
6. Blocked time periods.
7. Existing appointments.

A time slot shall be considered available only when:

- The appointment begins within working hours.
- The complete service duration fits within working hours.
- The appointment does not overlap a blocked period.
- The appointment does not overlap an existing appointment.
- The appointment satisfies the system's booking rules.

---

# 24. Non-Functional Requirements

## 24.1 Performance

**NFR-001:** Normal user requests should receive a response within an acceptable period under normal operating conditions.

**NFR-002:** Availability calculations should be sufficiently fast to provide an interactive booking experience.

**NFR-003:** The system should support the expected workload of a small school-based beauty business.

---

# 25. Usability Requirements

**NFR-004:** The system shall provide a simple and intuitive interface.

**NFR-005:** A new customer should be able to complete a booking in less than **90 seconds** without external assistance.

**NFR-006:** Important actions shall provide clear confirmation or error messages.

**NFR-007:** Booking steps shall be presented in a logical sequence.

**NFR-008:** The interface shall be understandable to users with limited technical knowledge.

---

# 26. Responsiveness

**NFR-009:** The web interface shall be responsive.

**NFR-010:** The system shall support:

- Desktop computers.
- Tablets.
- Smartphones.

**NFR-011:** Core customer functions shall remain usable on small mobile screens.

---

# 27. Security Requirements

**NFR-012:** Passwords shall be securely hashed using bcrypt or an equivalent password-hashing mechanism.

**NFR-013:** Plaintext passwords shall never be stored.

**NFR-014:** Sensitive configuration values shall be stored using environment variables.

**NFR-015:** Database credentials shall not be hardcoded into the source code.

**NFR-016:** The `.env` file shall not be committed to source control.

**NFR-017:** SQL injection shall be mitigated through parameterised database queries.

**NFR-018:** User input shall be validated.

**NFR-019:** The system shall protect against cross-site scripting attacks.

**NFR-020:** Administrative functions shall require authentication and authorisation.

**NFR-021:** Authentication tokens shall have a defined expiration period.

**NFR-022:** Authentication credentials should preferably be stored using secure HTTP-only cookies.

**NFR-023:** Production communication shall use HTTPS.

---

# 28. Privacy Requirements

**NFR-024:** The system shall collect only information required for appointment management and communication.

**NFR-025:** Customers shall be informed about the information collected.

**NFR-026:** Customers shall provide explicit consent for the storage and use of their information.

**NFR-027:** Customer information shall not be shared with unauthorised third parties.

**NFR-028:** Customers shall have a mechanism for requesting deletion of their information.

**NFR-029:** Personally identifiable information shall be removed or anonymised before being included in the academic dataset or report unless appropriate consent has been obtained.

---

# 29. Accessibility Requirements

**NFR-030:** The system should use semantic HTML.

**NFR-031:** Form fields shall have appropriate labels.

**NFR-032:** The system should support keyboard navigation.

**NFR-033:** Visible focus indicators shall be provided.

**NFR-034:** Colour contrast should meet WCAG 2.1 AA requirements where reasonably achievable.

**NFR-035:** Error messages shall be presented in a clear and understandable manner.

---

# 30. Reliability Requirements

**NFR-036:** The system shall maintain appointment data reliably.

**NFR-037:** Database transactions shall protect critical booking operations.

**NFR-038:** The system shall not create partial appointment records when a booking transaction fails.

**NFR-039:** Reminder failures shall be logged.

**NFR-040:** The system shall provide a recoverable development/local version in case of hosting failure.

---

# 31. Maintainability Requirements

**NFR-041:** The system shall use a modular architecture.

**NFR-042:** Frontend and backend responsibilities shall be separated.

**NFR-043:** Database access shall be separated from business logic.

**NFR-044:** Source code shall be maintained using Git.

**NFR-045:** Important business logic shall contain appropriate documentation and comments.

**NFR-046:** Database schema changes shall be reproducible using migration scripts.

---

# 32. Scalability Requirements

The initial system targets a single school-based beauty service provider.

However, the design should allow future expansion to:

- Multiple service providers.
- Multiple technicians.
- Additional service categories.
- Additional business locations.
- Third-party calendar integration.
- Online payments.
- Advanced analytics.

These capabilities are not required for the initial release.

---

# 33. Technical Requirements

## 33.1 Frontend

The frontend shall use:

- HTML5.
- CSS3.
- JavaScript ES6+.
- React.js.
- Bootstrap 5 or Tailwind CSS.

## 33.2 Backend

The backend shall use:

- Node.js.
- Express.js.
- REST API architecture.
- Sequelize ORM.

## 33.3 Database

The preferred database shall be:

- MySQL.

PostgreSQL may be used as an alternative where appropriate.

## 33.4 Authentication

Authentication shall use:

- JSON Web Tokens.
- bcrypt/bcryptjs.
- Role-based access control.

## 33.5 Notifications

The notification subsystem shall use:

- Nodemailer for email delivery.
- node-cron for scheduled reminder processing.

---

# 34. System Architecture Requirements

The system shall follow a three-tier architecture.

```text
┌───────────────────────────────────────┐
│          PRESENTATION TIER            │
│                                       │
│ Customer Web Interface                │
│ Administrator Dashboard               │
│ React / HTML / CSS / JavaScript       │
└──────────────────┬────────────────────┘
                   │ HTTPS / REST API
                   ▼
┌───────────────────────────────────────┐
│           APPLICATION TIER            │
│                                       │
│ Node.js / Express.js                  │
│                                       │
│ Authentication Module                 │
│ Booking Module                        │
│ Service Module                        │
│ Availability Engine                   │
│ Reminder Module                       │
└──────────────────┬────────────────────┘
                   │ ORM
                   ▼
┌───────────────────────────────────────┐
│              DATA TIER                │
│                                       │
│ MySQL / PostgreSQL                    │
│                                       │
│ Users                                 │
│ Services                              │
│ Appointments                          │
│ Availability / Blocked Periods        │
│ Reminder Records                      │
└───────────────────────────────────────┘
```

---

# 35. Core System Modules

## 35.1 Authentication Module

Responsible for:

- Registration.
- Login.
- Logout.
- Password hashing.
- Authentication tokens.
- Role verification.

## 35.2 Service Module

Responsible for:

- Service creation.
- Service updates.
- Service deletion.
- Service retrieval.
- Duration management.
- Price management.

## 35.3 Booking Module

Responsible for:

- Appointment creation.
- Appointment cancellation.
- Appointment rescheduling.
- Appointment status management.
- Booking history.

## 35.4 Availability Engine

Responsible for:

- Calculating available slots.
- Checking working hours.
- Checking service duration.
- Checking existing bookings.
- Checking blocked periods.
- Preventing scheduling conflicts.

## 35.5 Reminder Module

Responsible for:

- Booking confirmations.
- Cancellation notifications.
- Appointment reminders.
- Reminder scheduling.
- Delivery logging.

## 35.6 Administration Module

Responsible for:

- Appointment management.
- Service management.
- Working-hour configuration.
- Blocked periods.
- Customer management.
- Appointment status management.

---

# 36. Data Requirements

The system shall maintain a relational database containing, at minimum, the following entities.

## 36.1 Users

| Field | Description |
|---|---|
| User ID | Unique user identifier |
| Name | Customer/administrator name |
| Email | User email address |
| Phone | Optional phone number |
| Password Hash | Securely hashed password |
| Role | Customer or administrator |
| Consent | Data-processing consent |
| Created At | Account creation timestamp |

## 36.2 Services

| Field | Description |
|---|---|
| Service ID | Unique service identifier |
| Name | Service name |
| Description | Optional description |
| Duration | Duration in minutes |
| Price | Service price |
| Created At | Creation timestamp |
| Updated At | Last modification timestamp |

## 36.3 Appointments

| Field | Description |
|---|---|
| Appointment ID | Unique appointment identifier |
| Customer ID | Associated customer |
| Service ID | Associated service |
| Date | Appointment date |
| Start Time | Appointment start |
| End Time | Appointment end |
| Status | Appointment status |
| Created At | Creation timestamp |
| Updated At | Modification timestamp |

## 36.4 Availability / Blocked Periods

The system shall store administrator-defined unavailable periods.

Possible information includes:

- Block ID.
- Date.
- Start time.
- End time.
- Reason.
- Creation timestamp.

## 36.5 Reminder Records

The system should maintain records of notifications including:

- Reminder ID.
- Appointment ID.
- Delivery method.
- Sent timestamp.
- Delivery status.
- Error information where applicable.

---

# 37. User Interface Requirements

## 37.1 Customer Interface

The customer interface shall include:

1. Home page.
2. Registration page.
3. Login page.
4. Service catalogue.
5. Service details.
6. Availability/date selection.
7. Booking confirmation.
8. Customer dashboard.
9. Upcoming appointments.
10. Appointment history.
11. Cancellation interface.
12. Rescheduling interface.
13. Account management.

## 37.2 Administrator Interface

The administrator interface shall include:

1. Admin login.
2. Dashboard.
3. Appointment calendar.
4. Appointment table.
5. Service management.
6. Working-hours management.
7. Blocked-date/time management.
8. Customer management.
9. Appointment status management.
10. Reminder monitoring where required.

---

# 38. Booking Workflow

The expected customer booking workflow is:

```text
Customer
   │
   ▼
Login / Register
   │
   ▼
Select Service
   │
   ▼
Select Date
   │
   ▼
System Calculates Availability
   │
   ▼
Select Available Time
   │
   ▼
Review Booking
   │
   ▼
Final Conflict Check
   │
   ├── Slot unavailable ──► Select another time
   │
   ▼
Create Appointment
   │
   ▼
Send Confirmation
   │
   ▼
Booking Complete
```

---

# 39. Cancellation Workflow

```text
Customer selects appointment
          │
          ▼
Request cancellation
          │
          ▼
Check cancellation deadline
          │
     ┌────┴────┐
     │         │
 Eligible   Not Eligible
     │         │
     ▼         ▼
Cancel      Reject request
booking     and display reason
     │
     ▼
Send cancellation confirmation
```

---

# 40. Rescheduling Workflow

```text
Customer selects appointment
          │
          ▼
Select "Reschedule"
          │
          ▼
Choose new date
          │
          ▼
System calculates availability
          │
          ▼
Choose new time
          │
          ▼
Final conflict check
          │
     ┌────┴────┐
     │         │
Available   Unavailable
     │         │
     ▼         ▼
Confirm      Select another slot
     │
     ▼
Preserve original record
     │
     ▼
Create new appointment
     │
     ▼
Send confirmation
```

---

# 41. Reminder Workflow

The reminder service shall run automatically using a scheduled process.

```text
Scheduled Job
      │
      ▼
Check appointments for next day
      │
      ▼
Remove cancelled appointments
      │
      ▼
Retrieve customer email
      │
      ▼
Send reminder
      │
      ▼
Record delivery status
```

The intended reminder interval is **24 hours before the appointment**.

---

# 42. Security Requirements Summary

The following security controls shall be implemented:

| Threat | Required Control |
|---|---|
| SQL Injection | Parameterised queries / ORM |
| Password theft | bcrypt password hashing |
| XSS | Input validation and output escaping |
| Unauthorised administration | Role-based access control |
| Session theft | Secure HTTP-only cookies |
| Credential exposure | Environment variables |
| Data interception | HTTPS |
| Double booking | Database transactions and locking |
| Data exposure | Restricted database access |
| Secret leakage | `.env` excluded from Git |

---

# 43. Privacy and Consent Requirements

The system shall display a privacy notice during registration.

The consent statement shall clearly explain that the customer's information is collected for appointment management and reminder purposes.

Consent shall:

- Be explicit.
- Not be pre-selected.
- Be required before registration.
- Be presented in understandable language.

The system shall not collect unnecessary personal information.

---

# 44. Reporting and Analytics Requirements

The initial system shall support basic operational data collection.

The following metrics may be calculated during pilot testing:

- Number of bookings.
- Number of cancellations.
- Number of completed appointments.
- Number of no-shows.
- No-show rate.
- Booking volume by day.
- Booking volume by time.
- Popular services.
- Average booking lead time.
- Reminder delivery rate.
- Reminder effectiveness.

Advanced business intelligence is outside the initial scope.

---

# 45. Pilot Evaluation Requirements

The system shall be evaluated during a pilot period of approximately two weeks.

Evaluation shall consider:

### Booking Accuracy

Target:

> Zero double-booking incidents.

### Usability

Target:

> A new customer should be able to complete a booking in less than 90 seconds without external assistance.

### Functionality

The following functions shall operate without critical defects:

- Registration.
- Login.
- Service browsing.
- Availability viewing.
- Booking.
- Cancellation.
- Rescheduling.
- Administration.
- Reminders.

### Reminder Effectiveness

The system shall record reminder delivery and appointment outcomes to enable evaluation of whether reminders are associated with reduced no-show rates.

---

# 46. Success Criteria

The project shall be considered successful when:

1. All core booking functions operate correctly.
2. Customers can successfully register and authenticate.
3. Customers can view real-time availability.
4. Customers can book appointments.
5. Customers can cancel and reschedule eligible appointments.
6. Administrators can manage services.
7. Administrators can configure working hours.
8. Administrators can block unavailable periods.
9. Administrators can manage appointments.
10. Automated reminders operate successfully.
11. No double-booking occurs during pilot testing.
12. A customer can complete a booking within 90 seconds without assistance.
13. The system is usable on mobile devices.
14. The system does not contain critical security vulnerabilities.
15. The business owner can perform basic administrative tasks using the user manual.
16. The system can be demonstrated without crashes or fatal errors.
17. The final project documentation meets institutional requirements.

---

# 47. Testing Requirements

The system shall undergo several categories of testing.

## 47.1 Unit Testing

Individual components such as:

- Authentication.
- Availability calculations.
- Cancellation rules.
- Booking validation.
- Reminder logic.

shall be tested independently.

## 47.2 Integration Testing

Integration testing shall verify interactions between:

- Frontend and backend.
- Backend and database.
- Booking engine and availability engine.
- Booking system and notification system.

## 47.3 Security Testing

Testing shall include checks for:

- SQL injection.
- XSS.
- Unauthorised administrative access.
- Invalid authentication tokens.
- Invalid input.
- Credential exposure.

## 47.4 Usability Testing

Volunteer users shall be asked to perform common tasks such as:

- Creating an account.
- Finding a service.
- Booking an appointment.
- Cancelling an appointment.
- Rescheduling an appointment.

## 47.5 Concurrent Booking Testing

Multiple simultaneous booking requests shall be used to verify that the system prevents double-booking.

---

# 48. Deployment Requirements

The system shall be capable of running:

- On a local development machine.
- On a suitable cloud hosting platform where possible.

Potential hosting platforms include free-tier services such as:

- Render.
- Railway.
- Vercel.

The project shall maintain a local version as a fallback in case of hosting limitations.

---

# 49. Development and Maintenance Requirements

The project shall use:

- Visual Studio Code as the primary development environment.
- Git for version control.
- GitHub for source-code backup and repository management.
- npm for dependency management.
- Postman for API testing.
- MySQL Workbench or phpMyAdmin for database management.

Database changes should be maintained using migration scripts.

---

# 50. Documentation Requirements

The completed project shall include:

## Technical Documentation

- System architecture.
- Database schema.
- Entity-relationship diagram.
- API documentation.
- Deployment instructions.
- Configuration instructions.
- Database migration instructions.
- Source-code documentation.

## User Documentation

A user manual shall be provided for:

### Customers

- Account registration.
- Login.
- Service selection.
- Appointment booking.
- Appointment management.
- Cancellation.
- Rescheduling.
- Reminders.
- Troubleshooting.

### Administrator

- Admin login.
- Dashboard usage.
- Service management.
- Working-hour configuration.
- Blocking unavailable periods.
- Appointment management.
- Customer management.
- Backup and maintenance.

---

# 51. Project Constraints

The project has the following constraints:

- The system is initially designed for one business owner.
- Development is being performed by a single student.
- The project has a fixed academic submission deadline.
- The initial version will not process online payments.
- The system depends on email infrastructure for automated notifications.
- The pilot dataset may be limited because of privacy considerations.
- Free-tier hosting may impose technical limitations.
- The project does not require specialised hardware.

---

# 52. Project Risks and Mitigation

| Risk | Mitigation |
|---|---|
| Business owner withdraws participation | Make the system generic enough for other appointment-based businesses. |
| Technical difficulties | Build prototypes early and use simpler alternatives where necessary. |
| Double-booking | Use transactions, locking, and concurrent testing. |
| Emails marked as spam | Use a reputable email provider and configure email authentication. |
| Incomplete requirements | Conduct regular stakeholder reviews. |
| Insufficient pilot data | Supplement with simulated or synthetic data. |
| Hosting limitations | Maintain a localhost version and deployment documentation. |
| Security vulnerabilities | Conduct security testing and use secure development practices. |
| Scope creep | Prioritise requirements and defer non-essential features. |
| Schedule delays | Maintain buffer time and use incremental development. |
| Privacy issues | Implement consent, access controls, and anonymisation. |
| Hardware failure | Maintain frequent GitHub backups. |
| Changing business requirements | Make services and working hours configurable. |
| Supervisor unavailability | Submit work early and schedule meetings in advance. |

---

# 53. Project Timeline

| Week(s) | Phase | Major Milestone |
|---|---|---|
| 1–2 | Proposal and Planning | Proposal approved |
| 3–5 | Literature Review and Design | Design documents completed |
| 6–7 | Sprint 1 – Authentication | Login and registration working |
| 8–9 | Sprint 2 – Service Catalogue | Services manageable |
| 10–11 | Sprint 3 – Booking Engine | Core booking functionality completed |
| 12 | Midway Evaluation | Supervisor review |
| 13–14 | Sprint 4 – Dashboard and Reminders | All major features completed |
| 15 | Testing and Pilot | Deployment and data collection |
| 16 | Documentation and Submission | Final submission |

---

# 54. Acceptance Criteria

The system shall be accepted when the following conditions are satisfied:

| ID | Acceptance Criterion | Target |
|---|---|---|
| AC-001 | Customer registration works | Pass |
| AC-002 | Customer authentication works | Pass |
| AC-003 | Administrator authentication works | Pass |
| AC-004 | Services can be managed | Pass |
| AC-005 | Availability is calculated correctly | Pass |
| AC-006 | Customers can book appointments | Pass |
| AC-007 | Double-booking is prevented | Zero incidents |
| AC-008 | Customers can cancel appointments | Pass |
| AC-009 | Customers can reschedule appointments | Pass |
| AC-010 | Administrator can manage appointments | Pass |
| AC-011 | Reminders are sent | Pass |
| AC-012 | Mobile interface works | Pass |
| AC-013 | Booking can be completed quickly | < 90 seconds |
| AC-014 | No critical security vulnerability remains | Pass |
| AC-015 | User manual enables basic administration | Pass |
| AC-016 | System operates without critical crashes | Pass |

---

# 55. Future Enhancements

The following features may be considered after the initial release:

- Online payments.
- Mobile money integration.
- Native Android application.
- Native iOS application.
- Google Calendar integration.
- iCal integration.
- Multiple technicians.
- Technician-specific accounts.
- Multiple business branches.
- Advanced analytics.
- Customer reviews and ratings.
- SMS reminders.
- WhatsApp notifications.
- Automated no-show prediction.
- AI-assisted appointment scheduling.
- Inventory management.
- Loyalty programmes.

These features are intentionally excluded from the initial release to maintain a manageable project scope.

---

# 56. Final Requirement Summary

Kairos Schedule shall provide a secure, responsive, and user-friendly web-based appointment booking platform for a school-based beauty service business.

The system's primary responsibilities are to:

1. Allow customers to register and authenticate.
2. Allow customers to browse beauty services.
3. Display real-time appointment availability.
4. Allow customers to book appointments.
5. Prevent double-booking.
6. Allow customers to cancel and reschedule appointments.
7. Maintain appointment history.
8. Send automated appointment notifications and reminders.
9. Provide the business owner with administrative management capabilities.
10. Allow the owner to configure services and availability.
11. Protect customer information.
12. Provide a responsive mobile-friendly interface.
13. Collect operational information required to evaluate the effectiveness of the system.
14. Provide documentation supporting both technical maintenance and everyday business use.

The completed system should provide a practical replacement for informal appointment-booking methods while demonstrating appropriate software engineering principles, including modular architecture, database design, authentication, transaction management, security, usability, testing, and iterative development.

---

# 57. Document Approval

| Role | Name | Signature | Date |
|---|---|---|---|
| Student | Mulenga Chileshe | __________________ | __________ |
| Supervisor | Mr. Alinani Simukanga | __________________ | __________ |
| Business Owner / Stakeholder | __________________ | __________________ | __________ |

---

**End of User Requirements Document**