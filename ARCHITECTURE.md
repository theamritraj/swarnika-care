# Swarnika Care — Architecture

## 1. Architecture Overview

Swarnika Care follows a modular microservice architecture.

High-level structure:

Browser
   |
   +----------------------+
   |                      |
Public Website         Care Portal
   |                      |
   +----------+-----------+
              |
          API / BFF
              |
         API Gateway
              |
      Service Discovery
              |
   +----------+----------+
   |          |          |
  IAM     Organization  Patient
   |
 Doctor
   |
Appointment
   |
Encounter
   |
Notification

Each domain owns its own data.

---

# 2. Architecture Principles

1. Domain ownership must remain explicit.
2. Services must not directly access another service's database.
3. IAM owns authentication.
4. Domain services own domain data.
5. Public APIs expose only public-safe data.
6. Backend authorization is authoritative.
7. Internal APIs require service authentication.
8. Synchronous communication is allowed where real-time validation is required.
9. Kafka should be used where asynchronous event-driven communication is appropriate.
10. Do not introduce microservices without clear domain ownership.
11. Avoid unnecessary distributed transactions.
12. Prefer idempotent operations.
13. Production-sensitive workflows require failure handling.
14. Architecture decisions must be documented.

---

# 3. Frontend Architecture

There are two primary frontend experiences.

## Public Website

Domain:

www.swarnikahospitals.com

Purpose:

- Public hospital information
- Doctor discovery
- Department information
- Services
- Public content
- Appointment discovery

## Care Portal

Domain:

care.swarnikahospitals.com

Care is one Next.js application.

Role-based routes:

/patient/*
/doctor/*
/staff/reception/*
/staff/nurse/*
/staff/lab/*
/staff/pharmacy/*
/staff/billing/*
/admin/*

Do not create one frontend application per role unless there is a strong architectural reason.

---

# 4. Care BFF Architecture

Preferred secure browser flow:

Browser
   |
   | HttpOnly Cookie
   ↓
Next.js Care
   |
   | Authorization: Bearer JWT
   ↓
API Gateway
   ↓
Microservice

JWT should not be stored in localStorage or sessionStorage.

---

# 5. Backend Services

Current known services:

1. Eureka / Service Registry
2. API Gateway
3. IAM Service
4. Patient Service
5. Doctor Service
6. Appointment Service
7. Notification Service
8. Organization Service

Future services:

- Billing
- Insurance
- Pharmacy
- Laboratory
- EHR
- Audit
- Reporting
- Inventory
- HR
- Search
- Telemedicine

Implementation status must be verified from repository.

---

# 6. IAM Architecture

IAM owns:

- User identity
- Credentials
- OTP
- Roles
- Permissions
- JWT
- Authentication
- Account status

IAM User is not the same thing as a domain profile.

Example:

IAM User
   |
   +-- userId
   +-- email
   +-- roles
   +-- permissions
   +-- status

Doctor Service
   |
   +-- doctorId
   +-- userId
   +-- professional data

Patient Service
   |
   +-- patientId
   +-- userId
   +-- patient data

---

# 7. Authentication

Current authentication model:

Email + OTP.

OTP requirements:

- Secure random generation
- Hash OTP before storage
- Expiry
- One-time use
- Attempt limits
- Resend cooldown
- Previous OTP invalidation
- Rate limiting where implemented
- Never log OTP
- Never return OTP from production APIs

---

# 8. JWT

JWT should contain authorization context.

Example conceptual structure:

{
  "sub": "usr_1025",
  "roles": ["DOCTOR"],
  "permissions": [
    "PATIENT_VIEW",
    "EHR_VIEW",
    "EHR_WRITE"
  ],
  "iss": "swarnika-iam",
  "aud": "swarnika-care",
  "iat": "...",
  "exp": "..."
}

Do not place medical records or sensitive clinical data inside JWT.

---

# 9. Service-to-Service Security

Internal services must not rely on public access alone.

Current IAM internal provisioning uses an internal secret/header mechanism.

Conceptual flow:

Doctor Service
     |
     | Internal authenticated request
     ↓
IAM Internal API
     |
     ↓
Provision DOCTOR user

Internal endpoints should not be exposed through the public API Gateway.

The exact implementation must be verified against source code.

---

# 10. Organization Service

Organization Service owns:

- Hospital
- Department
- Hospital configuration
- Department configuration

Hospital contains organizational and infrastructure information.

Department references:

- hospitalId
- headDoctorId
- public visibility/status where implemented

Do not create a direct JPA relationship from Department to Doctor entity.

Use IDs to preserve service boundaries.

---

# 11. Doctor Service

Doctor Service owns:

Doctor
DoctorProfile
DoctorHospitalAssignment
DoctorAvailability

Conceptual structure:

Doctor
 |
 +-- DoctorProfile
 |
 +-- DoctorHospitalAssignment
 |
 +-- DoctorAvailability

Doctor can be assigned to:

- Hospital
- Department
- Location-specific role/designation

Availability can be location-specific.

---

# 12. Doctor Provisioning

Provisioning flow:

Hospital Admin
       |
       ↓
Doctor Service
       |
       | OpenFeign
       ↓
IAM Service
       |
       | Create DOCTOR account
       ↓
userId
       |
       ↓
Doctor Service
       |
       ↓
Doctor.userId

If Doctor persistence fails after IAM provisioning, compensating deletion should be attempted.

This is not a substitute for complete distributed transaction management.

Idempotency and recovery should be tested.

---

# 13. Doctor Public Profile

Doctor profile publication states:

DRAFT
REVIEW
APPROVED
PUBLISHED

Operational doctor status and public publication state must remain separate.

Example:

Doctor = ACTIVE
Profile = DRAFT

This means the doctor can operate internally while the public profile remains unpublished.

---

# 14. Public API Architecture

Public APIs must return explicitly public-safe data.

Example:

GET /api/v1/public/doctors

GET /api/v1/public/doctors/{slug}

Only PUBLISHED doctors should be returned.

Public API must not expose:

- Passwords
- OTPs
- Internal permissions
- Internal security metadata
- Private patient information
- Internal operational secrets
- Sensitive clinical data

---

# 15. Appointment Architecture

Appointment Service owns appointment lifecycle.

Known statuses include:

SCHEDULED
CONFIRMED
CANCELLED
COMPLETED
NO_SHOW

Appointment may synchronously validate:

- Patient
- Doctor
- Doctor availability

Current synchronous dependency should not be incorrectly represented as fully asynchronous.

Future optimization may introduce read models/caches where appropriate.

---

# 16. Kafka Architecture

Kafka is intended for asynchronous domain events.

Known event:

AppointmentBookedEvent

Conceptual flow:

Appointment Service
       |
       | Kafka
       ↓
Notification Service
       |
       ↓
Email / Notification

Future reliability improvements may include:

- Outbox Pattern
- Retry
- DLQ
- Idempotency
- Consumer recovery
- Event processing states

If these are not implemented, they must be marked PLANNED.

---

# 17. Notification Architecture

Notification Service consumes appointment events.

Notification processing should eventually support:

- Idempotency
- Retry
- Failure handling
- DLQ
- Consumer recovery

Email should be marked SENT only after successful dispatch.

---

# 18. Database Architecture

Each microservice should own its database.

Example:

IAM → IAM database
Patient → Patient database
Doctor → Doctor database
Organization → Organization database
Appointment → Appointment database
Notification → Notification database

Do not create shared database ownership between services.

---

# 19. Gateway

API Gateway responsibilities:

- Routing
- JWT validation
- Authentication enforcement
- Public endpoint routing
- Service discovery integration
- Security headers / filtering as implemented

Gateway should not become a business-logic service.

---

# 20. Eureka

Eureka is used for service discovery where configured.

Services should communicate using logical service identities rather than hard-coded infrastructure dependencies where the architecture requires service discovery.

---

# 21. Observability

Target architecture should include:

- Structured logging
- SLF4J / Logback where used
- Distributed tracing where implemented
- Metrics
- Error monitoring
- Audit logging

Do not claim an observability component is deployed unless verified.

---

# 22. Scalability

The architecture should allow:

- Independent service scaling
- Database scaling
- Cache introduction
- Kafka-based asynchronous processing
- Horizontal scaling
- Load balancing

Microservices do not imply zero dependency.

The goal is to remove unnecessary hard dependencies.

---

# 23. Reliability

Critical operations should consider:

- Idempotency
- Timeouts
- Retries
- Circuit breaking where appropriate
- Failure isolation
- Transaction boundaries
- Event recovery
- Dead-letter processing

These should be implemented only where required and documented accurately.

---

# 24. Deployment

Target deployment may use:

- Docker
- AWS
- EC2
- RDS
- S3
- Vercel for frontend
- CI/CD

Only verified infrastructure should be marked IMPLEMENTED.

---

# 25. Multi-Hospital Architecture

Core hierarchy:

Hospital
 |
 +-- Departments
 |      |
 |      +-- Doctors
 |
 +-- Staff

Doctors may have multiple assignments.

Assignments should contain location-specific information.

Hospital-specific access must be enforced through authorization.

---

# 26. Architecture Status

Every major architectural component must be classified as:

IMPLEMENTED
PARTIALLY IMPLEMENTED
PLANNED
FUTURE

The repository is the implementation source of truth.

## Organization Service
- IMPLEMENTED: Manages Hospital, Department, Employee, Designation, Position.
- RULE: Uses IDs to associate across services (e.g. userId, doctorId).


## Organization Service Phase 2
- IMPLEMENTED: Physical Hospital Infrastructure (Building, Floor, Unit, Room, Bed, NursingStation)
- RULE: Strict hierarchical validation and deletion protection implemented.
