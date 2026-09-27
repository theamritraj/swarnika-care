# Swarnika Care — Project Memory

> This file contains durable project decisions and context.
> It is NOT a task list.

---

# 1. Project Identity

Project:

Swarnika Care

Organization:

Swarnika Hospitals

Public Website:

www.swarnikahospitals.com

Care Portal:

care.swarnikahospitals.com

---

# 2. Product Vision

Swarnika Care is intended to become an enterprise-grade multi-hospital HIS/HMS.

The platform should eventually support:

- Patients
- Doctors
- Nurses
- Reception
- Laboratory
- Pharmacy
- Billing
- Hospital Administration
- Platform Administration

---

# 3. Core Architectural Principle

Every domain should have clear ownership.

IAM owns identity.

Organization owns hospital structure.

Patient Service owns patient data.

Doctor Service owns doctor data.

Appointment Service owns appointments.

Notification Service owns notification processing.

Billing will own billing when implemented.

---

# 4. IAM Decision

IAM User is separate from operational domain identity.

Example:

IAM User
    ↓
userId
    ↓
Doctor.userId

Doctor Service must not own credentials.

Patient Service must not own credentials.

---

# 5. Authentication Decision

Authentication uses:

Email + OTP.

Patients can self-register.

Privileged users should be provisioned by authorized administrators.

Users must not choose privileged roles during public registration.

---

# 6. Authorization Decision

Use:

Roles
+
Permissions
+
Object-level authorization

Do not assume roles are automatically hierarchical.

Backend authorization is authoritative.

Frontend authorization is only for visibility/UX.

---

# 7. JWT Decision

JWT is an authorization artifact.

It may contain:

- subject
- roles
- permissions
- issuer
- audience
- issued-at
- expiration

It must not contain:

- Medical records
- Passwords
- OTP
- Sensitive clinical information

---

# 8. Browser Security Decision

Do not store JWT in:

localStorage

or:

sessionStorage

Care should use a secure HttpOnly browser session architecture.

---

# 9. Frontend Decision

There are two major frontend experiences:

1. Public Website
2. Care Portal

Care is one Next.js application.

Use role-based routing rather than separate applications for:

- Patient
- Doctor
- Reception
- Nurse
- Lab
- Pharmacy
- Billing
- Admin

---

# 10. Care Routes

Known conceptual routes:

/patient/*
/doctor/*
/staff/reception/*
/staff/nurse/*
/staff/lab/*
/staff/pharmacy/*
/staff/billing/*
/admin/*

Exact implementation should be verified.

---

# 11. Organization Decision

Organization Service owns:

Hospital
Department

Do not create direct JPA relationships between Department and Doctor entities across services.

Use IDs.

---

# 12. Doctor Decision

Doctor Service owns:

Doctor
DoctorProfile
DoctorHospitalAssignment
DoctorAvailability

Doctor is the operational identity.

DoctorProfile contains professional/public information.

DoctorHospitalAssignment maps doctor to hospital and department.

DoctorAvailability can be hospital/department specific.

---

# 13. Doctor IAM Provisioning Decision

Doctor provisioning follows:

Doctor Service
    ↓
IAM Internal API
    ↓
Create DOCTOR user
    ↓
Return userId
    ↓
Doctor.userId saved

Doctor Service must never directly access the IAM database.

If Doctor persistence fails after IAM provisioning, compensating deletion should be attempted.

---

# 14. Public Profile Decision

Operational doctor status and public profile publication status are separate.

Public profile states:

DRAFT
REVIEW
APPROVED
PUBLISHED

Example:

Doctor = ACTIVE
Profile = DRAFT

This means the doctor can operate internally while the public profile remains unpublished.

---

# 15. Public API Decision

Public website should not consume internal administrative APIs.

Use dedicated public endpoints.

Example:

/api/v1/public/doctors

Only explicitly approved public-safe fields should be exposed.

---

# 16. Microservice Database Decision

Each service owns its database.

Never use another service's database directly.

Never create cross-service foreign keys.

Never create cross-service JPA entity relationships.

---

# 17. Synchronous Communication Decision

OpenFeign is acceptable for synchronous communication where immediate validation is necessary.

Examples:

Appointment → Doctor
Appointment → Patient

Do not attempt to eliminate every synchronous dependency.

The goal is to eliminate unnecessary hard dependencies.

---

# 18. Kafka Decision

Kafka is used for asynchronous event-driven workflows.

Known event:

AppointmentBookedEvent

Notification Service consumes appointment events.

Potential future reliability improvements:

- Outbox
- Retry
- DLQ
- Idempotency
- Recovery

These must be marked as planned until actually implemented.

---

# 19. Notification Decision

Notification Service should process appointment events independently.

Email delivery should not block the core appointment transaction where asynchronous architecture is appropriate.

---

# 20. Multi-Hospital Decision

The system must support multiple hospitals.

Core hierarchy:

Hospital
 |
 +-- Department
 |
 +-- Doctor Assignment
 |
 +-- Staff

A doctor may potentially have multiple hospital assignments.

Hospital-level authorization must prevent unauthorized cross-hospital access.

---

# 21. Role Memory

Platform:

SUPER_ADMIN

Hospital:

HOSPITAL_ADMIN
OPERATIONS_MANAGER

Clinical:

DOCTOR
NURSE

Front Office:

FRONT_DESK_MANAGER
RECEPTIONIST

Other Operations:

LAB_TECHNICIAN
PHARMACIST
BILLING_STAFF

Patient:

PATIENT

Future:

HR_MANAGER
INVENTORY_MANAGER
INSURANCE_EXECUTIVE
MEDICAL_RECORDS_STAFF

---

# 22. Product Separation Decision

SUPER_ADMIN is a platform role.

HOSPITAL_ADMIN is a hospital-management role.

OPERATIONS_MANAGER handles daily operations.

Functional staff roles should not receive platform administration permissions.

---

# 23. Public vs Internal Identity

A doctor has multiple conceptual identities:

IAM Identity
+
Operational Doctor Identity
+
Public Doctor Profile

These must not be treated as the same object.

---

# 24. Important Security Memory

Never:

- Trust client-provided roles
- Trust spoofable identity headers
- Expose internal IAM APIs publicly
- Put medical information in JWT
- Store JWT in localStorage
- Return OTP
- Log secrets

---

# 25. Implementation Memory

Known completed areas include:

- IAM
- Patient Service
- Doctor Service
- Appointment Service
- Notification Service
- Organization Service
- API Gateway
- Eureka

The exact status must always be verified against the repository.

---

# 26. Doctor Vertical Memory

The Doctor vertical currently follows:

Hospital
 ↓
Department
 ↓
Doctor
 ├── Profile
 ├── Hospital Assignment
 └── Availability

IAM provides the authentication identity.

Public profile publication is controlled separately.

---

# 27. Current Development Principle

Do not expand horizontally into many domains before validating the current vertical.

Preferred development pattern:

Build vertical slice
 ↓
Test
 ↓
Integrate
 ↓
Security test
 ↓
E2E test
 ↓
Document
 ↓
Move to next domain

---

# 28. Documentation Memory

The six documentation files have separate responsibilities:

PRD.md
→ Product requirements

ARCHITECTURE.md
→ Technical architecture

RULES.md
→ Non-negotiable rules

DESIGN.md
→ UI/UX and design system

TASK.md
→ Current execution state

MEMORY.md
→ Durable decisions and context

Do not turn all six files into copies of one another.

---

# 29. Decision Preservation

Future AI agents must not casually reverse:

- IAM/domain separation
- Database-per-service
- No cross-service JPA relationships
- Role-based Care architecture
- Public API separation
- Public profile publication workflow
- Service-to-service authentication
- Backend-authoritative authorization

If changing one of these becomes necessary, first document:

1. Existing decision
2. Problem with existing decision
3. Proposed replacement
4. Impact
5. Migration plan
6. Reason for change

---

# 30. Current Priority Memory

Before expanding significantly into Appointment Booking, validate the Doctor vertical.

Priority:

IAM
 ↓
Doctor
 ↓
Profile
 ↓
Hospital Assignment
 ↓
Availability
 ↓
Public Profile
 ↓
Public Doctor API
 ↓
Automated Tests
 ↓
E2E Tests

Then proceed to:

Public Doctor Directory
 ↓
Doctor Profile Page
 ↓
Available Slots
 ↓
Appointment Booking
 ↓
Kafka Events
 ↓
Notifications

---

# 31. Final Principle

Swarnika Care should be built as a real enterprise product, not as a collection of CRUD screens.

Every major feature should consider:

Security
Authorization
Domain ownership
Data ownership
Failure handling
Testing
Observability
Scalability
Auditability
User experience

The system should remain understandable even as the number of hospitals, users, services, and workflows grows.

- Added Workforce Foundation to organization-service.
- Fixed Flyway dependency configuration in POMs.
- Added spring-boot-starter-test and wrote unit tests for Designation, Position, Employee.

- Fixed Security and Validation logic in organization-service. Added SecurityConfig, JwtAuthenticationFilter, ScopeValidator, and cross-entity validation in services. Expanded unit tests.


## Completed Milestones
- Physical Hospital Infrastructure Phase 2 [IMPLEMENTED]: E2E tests, authoritative parent validation, and hierarchical delete protection passed.
- Phase 3 Appointments Foundation [IMPLEMENTED]: Reschedule, Complete, and Cancel endpoints, pessimistic database locking, outbox events, and E2E tests verified.
- Phase 4 Patient Registration + Relationships + Encounter Foundation [IMPLEMENTED]:
  - IAM: Added HOSPITAL_ADMIN role and encounter/OPD/emergency permissions.
  - Appointment Service: Resolved Phase 3 deferred items (Hospital-Admin scope enforcement, renamed symptoms column to reason).
  - Patient Service: Extended patient records (MRN, gender, address, status), Multi-Hospital registrations with 409 conflict prevention, Family relationships (Mother/Baby/Twins) with 400 self-relationship and 409 duplicate checks.
  - Encounter Service: Built new microservice on port 8086 with full state machine (OPEN -> IN_PROGRESS -> COMPLETED / CANCELLED), terminal state guards, OPD consultation linking, doctorless Emergency triage support, and cross-hospital scope enforcement.
  - Real IAM E2E round-trip (OTP flow -> IAM-issued JWT -> Gateway -> Microservice authentication).
- Super Admin Portal Step 1 Dashboard [VERIFIED/LOCKED]:
  - Live API integration with 4 microservices (Patient, Doctor, Appointment, Organization).
  - Replaced fake billing KPI with active hospitals count; replaced placeholder chart with Today's Operations live summary; replaced fake activity feed with live Hospital Overview.
  - Zero mock data, complete empty & failure state handling, Next.js production build verified.
- Super Admin Portal Step 2 Hospitals & Departments [VERIFIED/LOCKED]:
  - Authoritative Super Admin organization management in `/admin/hospitals` and `/admin/departments`.
  - Next.js BFF proxy `/api/proxy/[...path]` bridging HttpOnly cookie sessions to API Gateway for all HTTP methods.
  - Backend Organization Service extended with PUT endpoints (`/api/v1/hospitals/{id}`, `/api/v1/departments/{id}`) and duplicate code validations.
  - Live data feed, dynamic status/hospital filters, real-time search, View/Edit/Add modals, feedback toasts, and loading skeletons.
  - Decoupled physical infrastructure (buildings, floors, rooms, beds) from hospital creation forms with dedicated "Manage Infrastructure →" navigation.
  - Full E2E lifecycle test (`test_step2_hospitals_departments_e2e.py`) verified 100% and Next.js production build clean.


