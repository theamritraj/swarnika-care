# Swarnika Care: Enterprise Hospital Management System
**Master Architecture and Implementation Source of Truth**

## A. What Swarnika Care Is
Swarnika Care is a scalable enterprise hospital management platform with workflows comparable in scope to large hospital networks. The system supports full-lifecycle healthcare operations including patient management, doctor scheduling, complex appointment workflows, EHR, and more.

## B. Current Implementation
The backend consists of core services built on Java/Spring Boot:
- Eureka Service Registry
- API Gateway
- Patient Service
- Doctor Service
- Appointment Service
- Notification Service (scaffolded)

## C. Current Incomplete Phase
We are currently in **PHASE 1 — FOUNDATION / CORE MICROSERVICES**. 
While services register with Eureka, critical internal structures (Service layers, DTOs, Validation, Exception Handling, Testing) are missing. Phase 1 is NOT complete.

## D. Target Enterprise Architecture
```text
                     SWARNIKA CARE
                           |
       +-------------------+-------------------+
       |                   |                   |
 Patient Portal      Doctor Portal       Admin Portal
       |                   |                   |
       +-------------------+-------------------+
                           |
                      API GATEWAY
                           |
                    IAM / RBAC
                           |
        +------------------+------------------+
        |        |         |       |         |
     Patient  Doctor  Appointment  EHR   Facility
        |        |         |       |         |
        +--------+---------+-------+---------+
                           |
                         Kafka
                           |
             +-------------+-------------+
             |             |             |
            Lab         Billing      Notification
             |             |             |
             +-------------+-------------+
                           |
                        Pharmacy
```

## E. User Portals
- **Patient Portal:** Registration, appointments, history, EHR access.
- **Doctor Portal:** Calendar, patient queue, consultation notes, e-prescriptions.
- **Admin Portal:** Hospital/branch management, staff onboarding, RBAC configuration.
- **Reception Portal:** Front-desk booking, check-in/out workflows. (Not separate backend services).

## F. Domain Services & G. Responsibilities
- **Patient Service:** Patient CRUD, profiles, emergency contacts.
- **Doctor Service:** Profiles, schedules, specialization, leave management.
- **Appointment Service:** Slot generation/validation, booking, double-booking prevention.

## H. Database Ownership
Each service exclusively owns its data (e.g., Patient Service -> Patient DB; Doctor Service -> Doctor DB). Shared direct database access is forbidden.

## I. API Architecture
RESTful standards, JSON responses, explicit versioning (e.g., `/api/v1/patients`), and strict DTO mapping.

## J. Security & K. RBAC
Centralized JWT validation at the API Gateway. Strict RBAC for roles: `SUPER_ADMIN`, `DOCTOR`, `PATIENT`, `RECEPTIONIST`.

## L. Appointment Workflow
Find Doctor -> Select Slot -> Validate/Lock Slot -> Create -> Confirm -> Publish Kafka Event -> Notification. Double booking prevention is a critical P0 requirement.

## M - Q. Future Workflows
- **EHR:** Consultations, diagnoses, clinical notes.
- **Lab:** Catalog, orders, processing, reports.
- **Pharmacy:** Medicine inventory, dispensing.
- **Billing:** Invoicing, payments.
- **Facility:** Hospital/branch/ward/bed management.

## R - W. Enterprise Operations
- **Kafka:** Asynchronous event communication (e.g., `AppointmentConfirmed`).
- **Redis:** Specialized caching (e.g., available doctor slots).
- **Observability:** Centralized logging, Zipkin tracing.
- **Audit Logging:** Strict tracking of WHO accessed/modified WHAT.
- **Testing:** Unit, integration, and security tests required for definition of done.

## X. Phase-by-Phase Roadmap
1. **Phase 1:** Core Foundation (Current Focus - Services, DTOs, Repositories).
2. **Phase 2:** Appointment Engine.
3. **Phase 3:** IAM + Security.
4. **Phase 4:** EHR / Clinical.
5. **Phase 5:** Hospital Operations.
6. **Phase 6:** Diagnostics.
7. **Phase 7:** Finance.
8. **Phase 8:** Pharmacy.
9. **Phase 9:** Event-Driven Platform (Kafka).
10. **Phase 10:** Observability.
11. **Phase 11:** Enterprise Hardening.
12. **Phase 12:** Production (AWS).

## Y. Current Priorities
| Area | Priority | Status | Notes |
|------|----------|--------|-------|
| Eureka | P0 | Current | Working |
| API Gateway | P0 | Current | Audit |
| Patient Service | P0 | Incomplete | Service, DTOs, Tests missing |
| Doctor Service | P0 | Incomplete | Service, DTOs, Tests missing |
| Appointment Service | P0 | Incomplete | Service, DTOs, Tests missing |
| Database/JPA | P0 | Current | Audit |
| DTO/Validation | P0 | Incomplete | Missing entirely |
| Appointment Workflow | P0 | Incomplete | Logic missing |
| IAM/JWT | P1 | Planned | Future |

## Z. Architecture Change Log
| Date | Change | Reason |
|------|--------|--------|
| 2026-09-25 | Created baseline enterprise architecture document | Establish source of truth |
| 2026-09-25 | Implemented Transactional Outbox Pattern | Guarantee atomicity between DB state and Kafka publishing |
| 2026-09-25 | Hardened Notification Idempotency | DB-level uniqueness constraint & stale processing recovery |
