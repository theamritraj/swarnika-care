2. Current System --- DO NOT REBUILD

The current project already contains the following foundation:

Eureka Server
    |
    +-- API-GATEWAY
    |
    +-- PATIENT-SERVICE
    |
    +-- DOCTOR-SERVICE
    |
    +-- APPOINTMENT-SERVICE

Current Eureka dashboard confirms these four services are registering
and running:

Service               Current Status     Port

API-GATEWAY           UP                 8080
PATIENT-SERVICE       UP                 8081
DOCTOR-SERVICE        UP                 8082
APPOINTMENT-SERVICE   UP                 8083

This is the current foundation.

Antigravity MUST NOT replace this architecture unnecessarily.

3. Current Phase --- Incomplete Foundation

The project is currently incomplete.

The existing services appear to have the basic Controller/Repository/JPA
structure, but several enterprise capabilities described in the intended
project scope are not yet fully implemented.

The current priority is therefore:

COMPLETE THE FOUNDATION BEFORE EXPANDING THE NUMBER OF MICROSERVICES.

The immediate objective is to make the existing Patient, Doctor, and
Appointment domains genuinely functional and production-quality.

4. Target Enterprise Product

Swarnika Care should eventually support multiple user experiences.

4.1 Patient Portal

Patient capabilities:

Registration/login

Secure profile

Find hospital/branch

Search department

Search specialty

Search doctor

View doctor profile

View doctor availability

Book appointment

Reschedule appointment

Cancel appointment

Appointment history

Upcoming appointments

Consultation history

Medical history

Prescriptions

Lab reports

Radiology reports

Bills/invoices

Payments

Insurance information

Notifications

Teleconsultation support (future phase)

4.2 Doctor Portal

Doctor capabilities:

Secure login

Dashboard

Today's appointments

Appointment calendar

Patient queue

Patient profile

Medical history

Previous consultations

Allergies and important clinical information

Lab reports

Radiology reports

Consultation notes

Diagnosis

Treatment plan

E-prescription

Lab test ordering

Follow-up scheduling

Availability management

Working hours

Leave/block-slot management

4.3 Super Admin / Hospital Admin Portal

Admin capabilities:

Dashboard

Hospital management

Branch management

Department management

Doctor management

Employee management

Staff onboarding

Role management

Permission management

Doctor schedules

Appointment oversight

Patient management

Facility management

Ward/room/bed management

Billing overview

Reports/analytics

Audit logs

System configuration

4.4 Reception / Front Desk Portal

This should be treated as an important enterprise role.

Capabilities:

Patient registration

Walk-in patient registration

Appointment booking

Appointment rescheduling

Cancellation

Token/queue management

Doctor availability

Patient lookup

Basic billing workflow

Check-in/check-out

Appointment confirmation

Reception staff MUST NOT automatically receive access to sensitive
clinical capabilities such as prescribing medicines.

4.5 Future Hospital Staff Portals

Potential roles:

Nurse

Lab technician

Pharmacist

Billing executive

Insurance executive

Hospital operations staff

These should be introduced according to domain requirements rather than
creating separate applications unnecessarily.

5. Target Backend Architecture

The eventual architecture should evolve toward:

                         CLIENT LAYER
                              |
        +---------------------+----------------------+
        |                     |                      |
 Patient Portal        Doctor Portal          Admin Portal
        |                     |                      |
        +---------------------+----------------------+
                              |
                         API GATEWAY
                              |
                         IAM / AUTH
                              |
       +----------+-----------+-----------+-----------+
       |          |           |           |           |
   Patient     Doctor    Appointment     EHR       Facility
   Service     Service      Service      Service     Service
       |          |           |           |           |
       +----------+-----------+-----------+-----------+
                              |
                            Kafka
                              |
             +----------------+----------------+
             |                |                |
       Notification         Billing          Lab
         Service            Service         Service
                              |
                           Pharmacy
                            Service

This is the TARGET architecture, not the architecture that must be
created immediately.

6. Recommended Domain Services

Eventually the platform may contain the following domains.

Phase 1 --- Existing

API Gateway

Patient Service

Doctor Service

Appointment Service

Eureka Service Registry

Phase 2 --- Security

IAM / Authentication Service

Phase 3 --- Clinical

EHR / Clinical Records Service

Phase 4 --- Hospital Operations

Facility / Hospital Management Service

Phase 5 --- Diagnostics

Lab Service

Phase 6 --- Finance

Billing Service

Insurance Service

Phase 7 --- Pharmacy

Pharmacy Service

Phase 8 --- Platform

Notification Service

Potentially later:

Audit Service

Reporting/Analytics Service

Telemedicine Service

Search Service

Do not automatically create every service listed above. Service
boundaries should be validated against actual business workflows and
operational complexity.

7. Most Important Architectural Principle

Portals are NOT the same thing as microservices.

For example:

Patient Portal
Doctor Portal
Admin Portal
Reception Portal

These are user experiences.

They can all communicate through:

Frontend
   |
API Gateway
   |
Domain Services

Do NOT create:

patient-portal-service
doctor-portal-service
admin-portal-service

merely because the portals are different.

The backend should be organized primarily around business domains.

8. Phase 1 --- COMPLETE THE CURRENT FOUR-SERVICE FOUNDATION

THIS IS THE CURRENT PRIORITY.

Do not start by creating EHR, Billing, Pharmacy, Insurance, etc.

First audit and complete:

API Gateway
Patient Service
Doctor Service
Appointment Service
Eureka

9. Patient Service --- Required Completion

Expected structure:

patient-service
|
+-- controller
+-- dto
+-- service
+-- repository
+-- entity
+-- mapper
+-- exception
+-- config
+-- validation

Required capabilities:

Create patient

Update patient

Get patient

Search patient

Patient profile

Basic validation

Proper DTOs

Entity/DTO separation

Global exception handling

Consistent API responses

Database persistence

Transaction management where required

Logging

API documentation

Potential entities:

Patient
PatientContact
PatientAddress
EmergencyContact

Do not over-normalize prematurely.

10. Doctor Service --- Required Completion

Doctor service should eventually manage:

Doctor
Specialization
Department
DoctorSchedule
DoctorAvailability
DoctorLeave
DoctorProfile

Current phase should focus on:

Doctor CRUD

Doctor profile

Specialization

Department association

Basic availability

Validation

Repository

Service layer

DTOs

Exception handling

REST API

Database persistence

Later:

Schedule engine

Leave management

Slot generation

Branch/hospital mapping

11. Appointment Service --- Highest Priority Business Domain

Appointment booking is one of the most important workflows.

It should evolve from simple CRUD into a proper booking workflow.

Target flow:

Patient
   |
   v
Select Hospital/Branch
   |
   v
Select Department
   |
   v
Select Doctor
   |
   v
Select Date
   |
   v
Get Available Slots
   |
   v
Select Slot
   |
   v
Validate Availability
   |
   v
Temporarily Lock Slot
   |
   v
Confirm Booking
   |
   v
Create Appointment
   |
   v
Publish Event
   |
   v
Notification

Appointment states should eventually be modeled explicitly.

Example:

AVAILABLE
HELD
BOOKED
CONFIRMED
CHECKED_IN
IN_CONSULTATION
COMPLETED
CANCELLED
NO_SHOW
RESCHEDULED

Do not implement every state immediately. First build a clean booking
lifecycle.

12. Appointment Concurrency

A major enterprise concern is preventing double booking.

Example:

Doctor:
10:00 AM slot

Patient A and Patient B request the same slot simultaneously.

The system must not allow:

Patient A -> 10:00 -> BOOKED
Patient B -> 10:00 -> BOOKED

Instead:

Request A
   |
Lock/transaction
   |
10:00 reserved
   |
Booking completed

Request B
   |
10:00 unavailable

This should eventually use appropriate database constraints/transactions
and, when the scale requires it, a distributed locking strategy such as
Redis.

Redis should NOT be added merely because it sounds enterprise-grade.
Introduce it when the booking/concurrency requirement justifies it.

13. API Gateway

Current gateway should remain the single external backend entry point.

Responsibilities:

Route requests

Service discovery

Authentication integration

Request filtering

CORS

Rate limiting later

Correlation ID later

Centralized security policies later

External clients should ideally communicate with:

/api/patients/**
/api/doctors/**
/api/appointments/**

rather than directly calling internal services.

Internal services should not be unnecessarily exposed to the public
internet.

14. Eureka

Current Eureka is working.

Keep it for the current architecture.

Responsibilities:

Service Registration
Service Discovery
Instance Health
Dynamic Service Location

Do not add unnecessary complexity around Eureka while the core business
services are incomplete.

15. Service-to-Service Communication

Use two patterns intentionally.

Synchronous

Use REST/OpenFeign when an immediate response is required.

Example:

Appointment Service
      |
      | Check doctor availability
      v
Doctor Service

Asynchronous

Use Kafka when the operation can be event-driven.

Example:

Appointment Created
       |
       v
Kafka
       |
       +----> Notification Service
       |
       +----> Analytics
       |
       +----> Audit

Do not use Kafka for every service-to-service call.

16. Security Architecture

After the core business flows work, introduce IAM.

Target:

Client
  |
  v
API Gateway
  |
JWT validation
  |
  +----------------+
  |                |
Role             Permission
  |                |
  v                v
Doctor          APPOINTMENT_READ
Patient         APPOINTMENT_CREATE
Admin           PATIENT_READ
Reception       PATIENT_CREATE

Roles may include:

SUPER_ADMIN
HOSPITAL_ADMIN
DOCTOR
NURSE
RECEPTIONIST
LAB_STAFF
PHARMACIST
BILLING_STAFF
PATIENT

Permissions should be more granular than roles.

Example:

APPOINTMENT_READ
APPOINTMENT_CREATE
APPOINTMENT_CANCEL
PATIENT_READ
PATIENT_UPDATE
EHR_READ
EHR_WRITE
PRESCRIPTION_CREATE
BILLING_READ
BILLING_CREATE

Sensitive clinical information must be protected using proper
authorization, not merely frontend hiding.

17. EHR Service

This is a future major domain.

Potential records:

MedicalRecord
Consultation
Diagnosis
ClinicalNote
TreatmentPlan
Prescription
Allergy
MedicalHistory

Target workflow:

Appointment
   |
Consultation
   |
Diagnosis
   |
Treatment Plan
   |
Prescription
   |
EHR

Patient can see authorized records.

Doctor can see records required for clinical care.

Other staff receive only the minimum information required for their
role.

18. Lab Service

Future workflow:

Doctor
  |
  | Lab Order
  v
Lab Service
  |
  v
Sample Collection
  |
  v
Processing
  |
  v
Result
  |
  v
Verification
  |
  v
Final Report

Patient:

Patient Portal
    |
Lab Reports

Doctor:

Doctor Portal
    |
Patient
    |
Lab Reports

19. Billing Service

Future billing domains:

Invoice
InvoiceItem
Payment
Refund
Discount
Tax
Advance
Transaction

Potential charges:

Consultation

Lab

Pharmacy

Procedures

Room

Other hospital services

Keep billing independent from appointment business logic.

20. Pharmacy Service

Future capabilities:

Medicine
Inventory
Stock
Batch
Expiry
Prescription
Dispensing
Purchase

Workflow:

Doctor
  |
Prescription
  |
Pharmacy
  |
Dispense Medicine
  |
Inventory Updated

21. Facility Service

For a true hospital system, facility management is important.

Potential hierarchy:

Hospital
 |
 +-- Branch
      |
      +-- Building
           |
           +-- Floor
                |
                +-- Department
                     |
                     +-- Ward
                          |
                          +-- Room
                               |
                               +-- Bed

This should later support:

Bed availability

Ward management

Room management

Department management

Hospital branches

22. Notification Service

Notification service should eventually consume events.

Example:

AppointmentCreated
       |
      Kafka
       |
Notification Service
       |
 +-----+-----+
 |     |     |
SMS  Email   Push

Events may include:

AppointmentBooked
AppointmentConfirmed
AppointmentCancelled
AppointmentRescheduled
AppointmentReminder
LabReportReady
PrescriptionCreated
PaymentCompleted

23. Observability

After business logic is stable:

Logging

Use:

SLF4J

Logback

Every service should have structured, useful logs.

Distributed Tracing

Use Micrometer Tracing/Zipkin or an equivalent supported tracing stack.

Example:

Frontend
  |
Gateway
  |
Appointment
  |
Doctor

A correlation/trace ID should allow investigation across services.

Health Monitoring

Spring Boot Actuator should expose health/metrics endpoints.

Spring Boot Admin can later provide a management dashboard.

24. Audit Logging

Healthcare systems require strong traceability.

Examples:

WHO:
Doctor ID 123

ACTION:
Viewed patient record

PATIENT:
Patient ID 456

TIME:
2026-09-25 10:30

SOURCE:
Doctor Portal

Other examples:

Patient record viewed

Patient record updated

Prescription created

Report accessed

Billing changed

Admin created doctor

Permission changed

Audit logging should be designed deliberately and should not be treated
as normal application logs.

25. Data Ownership

Each microservice should own its domain data.

Preferred concept:

Patient Service
    -> Patient data

Doctor Service
    -> Doctor data

Appointment Service
    -> Appointment data

EHR Service
    -> Clinical records

Billing Service
    -> Billing data

Avoid creating one giant shared database schema where every service
directly modifies every other service's tables.

During the early development stage, using separate databases or clearly
separated schemas can be chosen based on infrastructure constraints, but
logical ownership must remain clear.

26. Enterprise Appointment Workflow --- Target

The eventual appointment workflow should look approximately like:

PATIENT
  |
  v
Find Doctor
  |
  v
Doctor Profile
  |
  v
Availability
  |
  v
Select Slot
  |
  v
Slot Validation
  |
  v
Slot Lock
  |
  v
Appointment Creation
  |
  v
Payment (if required)
  |
  v
Appointment Confirmation
  |
  v
Kafka Event
  |
  +----> Notification
  |
  +----> Audit
  |
  +----> Analytics

Then:

Appointment Day
     |
     v
Check-in
     |
     v
Queue
     |
     v
Doctor Consultation
     |
     +----> Diagnosis
     |
     +----> Prescription
     |
     +----> Lab Order
     |
     v
Consultation Completed
     |
     v
EHR Updated

27. Patient Journey --- Target

Registration
     |
     v
Login
     |
     v
Patient Profile
     |
     v
Find Doctor
     |
     v
Book Appointment
     |
     v
Appointment
     |
     v
Check-in
     |
     v
Consultation
     |
     +----> Prescription
     |
     +----> Lab Test
     |
     +----> Diagnosis
     |
     v
Medical Record
     |
     +----> Reports
     |
     +----> Prescription
     |
     +----> Follow-up
     |
     v
Billing / Payment

28. Doctor Journey --- Target

Doctor Login
     |
     v
Dashboard
     |
     v
Today's Appointments
     |
     v
Patient
     |
     +----> Medical History
     +----> Previous Reports
     +----> Allergies
     |
     v
Consultation
     |
     +----> Diagnosis
     +----> Clinical Notes
     +----> Prescription
     +----> Lab Order
     |
     v
Complete Consultation
     |
     v
EHR Updated

29. Admin Journey --- Target

Admin Login
     |
     v
Dashboard
     |
     +----> Add Hospital
     +----> Add Branch
     +----> Add Department
     +----> Add Doctor
     +----> Add Employee
     +----> Assign Role
     +----> Assign Permission
     +----> Configure Schedule
     +----> Monitor Appointments
     +----> View Reports
     +----> Audit Activity

30. Frontend Architecture

Use a role-oriented frontend experience.

Possible structure:

frontend/
|
+-- patient/
|
+-- doctor/
|
+-- admin/
|
+-- reception/
|
+-- shared/

Or a single Next.js application with role-based route groups:

/app
  /(public)
  /patient
  /doctor
  /admin
  /reception

The final choice should depend on the existing frontend architecture.

Do not create multiple frontend applications unless there is a real
deployment/team/domain reason.

31. API Standards

All services should follow consistent standards.

Example:

GET    /api/v1/patients/{id}
POST   /api/v1/patients
PUT    /api/v1/patients/{id}
DELETE /api/v1/patients/{id}

Appointment:

GET    /api/v1/appointments
GET    /api/v1/appointments/{id}
POST   /api/v1/appointments
PATCH  /api/v1/appointments/{id}/cancel
PATCH  /api/v1/appointments/{id}/reschedule

Use:

DTOs

validation

consistent error response

HTTP status codes

pagination

filtering

sorting

API versioning where appropriate

32. Error Handling

Each service should eventually have centralized exception handling.

Example response:

{
  "success": false,
  "code": "APPOINTMENT_SLOT_UNAVAILABLE",
  "message": "The selected appointment slot is no longer available.",
  "timestamp": "2026-09-25T10:30:00+05:30",
  "traceId": "abc-123"
}

Avoid exposing internal stack traces to clients.

33. Testing Strategy

Every domain should eventually have:

Unit Tests

Service logic

Validation

Business rules

Integration Tests

Repository/database

API

Kafka consumers/producers

Feign interactions

API Testing

Postman

Swagger/OpenAPI

Security Tests

Unauthorized request

Invalid JWT

Role restrictions

Permission restrictions

Business Tests

Examples:

Cannot book unavailable slot
Cannot cancel completed appointment
Cannot access another patient's EHR
Doctor cannot prescribe without appropriate role
Receptionist cannot modify clinical records

34. DevOps / Deployment --- Later

Do not optimize for AWS complexity before the application is stable.

First:

Local
  |
Docker
  |
Test Environment
  |
Staging
  |
Production

Later AWS can include:

Load Balancer
EC2/ECS/EKS
RDS
S3
Redis/ElastiCache
Kafka/MSK
CloudWatch
Secrets Manager

The exact AWS architecture should be decided after workload and
operational requirements are known.

35. Security and Healthcare Data

This system will handle sensitive healthcare information.

Security must therefore be treated as a first-class architecture
concern.

Eventually address:

TLS

encryption at rest

encryption in transit

JWT/OAuth2

RBAC

least privilege

audit logging

secure secrets

database access control

API rate limiting

input validation

secure file storage

secure report access

backup and recovery

retention policies

For India, assess applicable healthcare/data requirements such as
ABDM-related interoperability requirements and applicable
privacy/data-protection obligations during the production compliance
phase.

Do not claim legal/compliance certification merely because these
technical controls are implemented.

36. What Antigravity MUST NOT Do

Do NOT:

Create all 10--15 services immediately.

Rewrite working Eureka configuration without a reason.

Replace the existing four services unnecessarily.

Add Kafka everywhere just to call the architecture "event-driven".

Add Redis before identifying a caching/concurrency requirement.

Create a separate backend service for every frontend portal.

Claim a feature is implemented when only a class/dependency exists.

Add fake enterprise functionality only for resume purposes.

Introduce unnecessary complexity before the core workflows work.

Change architecture without documenting why.

37. What Antigravity SHOULD Do Before Coding

First perform a repository audit.

Inspect:

Root project structure
pom.xml files
application.yml/properties
Eureka configuration
Gateway routes
Controllers
Services
Repositories
Entities
DTOs
Database configuration
Frontend
API integrations
Existing documentation
Docker configuration
Tests

Then produce:

CURRENT_IMPLEMENTATION_AUDIT.md

with:

implemented features

partially implemented features

missing features

broken features

duplicate code

architectural issues

security gaps

testing gaps

deployment gaps

Do not start large-scale implementation until this audit is complete.

38. Required Implementation Order

The recommended sequence is:

STEP 1 --- Repository Audit

Understand what actually exists.

STEP 2 --- Fix Foundation

Make Eureka, Gateway, Patient, Doctor, Appointment stable.

STEP 3 --- Complete Domain Layers

Controller
   ↓
DTO
   ↓
Service
   ↓
Repository
   ↓
Database

STEP 4 --- Complete Appointment Business Flow

Doctor availability → slot → booking → cancellation → rescheduling.

STEP 5 --- Frontend Integration

Connect Next.js patient/doctor experiences to real APIs.

STEP 6 --- Security

IAM → JWT → RBAC → permissions.

STEP 7 --- Clinical Domain

EHR → consultation → prescription → medical history.

STEP 8 --- Hospital Operations

Facility → departments → wards → rooms → beds.

STEP 9 --- Diagnostics

Lab.

STEP 10 --- Finance

Billing → payments → insurance later.

STEP 11 --- Pharmacy

Prescription → dispensing → inventory.

STEP 12 --- Event-Driven Architecture

Kafka events where asynchronous workflows provide real value.

STEP 13 --- Observability

Tracing → centralized logging → metrics → monitoring.

STEP 14 --- Enterprise Hardening

Audit logs → rate limits → resilience → security hardening → backups.

STEP 15 --- Production Deployment

Docker → CI/CD → cloud infrastructure → staging → production.

39. Current Priority Board

At the current stage:

Area                     Priority   Status

Eureka                   P0         Working
API Gateway              P0         Working / audit required
Patient Service          P0         Incomplete
Doctor Service           P0         Incomplete
Appointment Service      P0         Incomplete
Database/JPA             P0         Foundation present
Business Service Layer   P0         Needs completion
DTO/Validation           P0         Audit required
Appointment workflow     P0         Needs proper implementation
Next.js integration      P0         Needs audit
IAM/JWT                  P1         Future
RBAC                     P1         Future
EHR                      P2         Future
Facility                 P2         Future
Lab                      P2         Future
Billing                  P2         Future
Pharmacy                 P2         Future
Kafka                    P2         Future
Redis                    P2         Future
Observability            P3         Future
Audit Logging            P3         Future
AWS Production           P3         Future

40. Definition of Done for Current Phase

Do NOT consider Phase 1 complete merely because services appear as UP in
Eureka.

Phase 1 is complete only when:

Infrastructure

Eureka registers services reliably.

Gateway routes correctly.

Services start without errors.

Configuration is clean.

Patient

Patient CRUD works.

Validation works.

Errors are handled.

Database persistence works.

Tests exist.

Doctor

Doctor CRUD works.

Specialization/department relationships are correct.

Availability basics work.

Validation works.

Tests exist.

Appointment

Patient can book a valid slot.

Invalid slot cannot be booked.

Double booking is prevented.

Cancellation works.

Rescheduling works.

Appointment status is consistent.

Tests cover important business rules.

API

Swagger/OpenAPI is available.

DTOs are used.

APIs have consistent responses.

Error handling is consistent.

Frontend

Patient can search doctors.

Patient can see availability.

Patient can book appointment.

Doctor can see appointments.

Basic admin functionality can be prepared for the next phase.

Only after these conditions are met should the team move to IAM/RBAC.

41. Target Final Product

The final Swarnika Care platform should conceptually provide:

                    SWARNIKA CARE
                         |
       +-----------------+-----------------+
       |                 |                 |
   PATIENT             DOCTOR            ADMIN
   PORTAL              PORTAL            PORTAL
       |                 |                 |
       +-----------------+-----------------+
                         |
                    API GATEWAY
                         |
                 IDENTITY / RBAC
                         |
      +------------------+------------------+
      |          |       |       |         |
   Patient    Doctor Appointment EHR   Facility
      |          |       |       |         |
      +----------+-------+-------+---------+
                         |
                       Kafka
                         |
          +--------------+---------------+
          |              |               |
         Lab          Billing       Notification
          |              |               |
          +--------------+---------------+
                         |
                      Pharmacy

The important goal is not the number of services.

The goal is a system where:

Every hospital workflow has a clear domain owner, secure API,
appropriate data ownership, predictable business rules, proper
auditability, and a scalable path to production.

42. Final Instruction to Antigravity

Before modifying the project:

Read this document.

Audit the current repository.

Identify what is actually implemented versus what is only
documented.

Do not assume that dependencies/configuration mean a feature is
implemented.

Create a gap report.

Propose the smallest implementation steps needed to complete the
current phase.

Implement only the current phase unless explicitly instructed to
move forward.

Keep future architecture documented but isolated from current
implementation.

After every major phase, update the architecture documentation and
implementation status.

Never create functionality merely to make the project description
look complete.

Immediate Mission

The immediate mission is:

Complete and production-harden the existing API Gateway + Eureka +
Patient + Doctor + Appointment foundation and make the end-to-end
appointment workflow actually work.

Do NOT begin by implementing all future enterprise services.

The architecture should grow incrementally from a working core into the
complete Swarnika Care hospital platform.