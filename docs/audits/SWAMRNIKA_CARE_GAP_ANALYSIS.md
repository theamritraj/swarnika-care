# Swarnika Care — Engineering Gap Analysis & Verification Audit
**Scope**: Discrepancy Analysis, Mock Data Audit, Microservice Topology, Security Vulnerabilities, and Remediation Roadmap  
**Audit Standard**: READ-ONLY Evidence-Based Audit  
**Date**: September 28, 2026  

---

## 1. Historical Claim Verification & Documentation Conflicts

Historical audit documents in `docs/audits/` claimed complete, locked, and production-ready status for several domains. Cross-referencing against the source code, databases, and running runtime reveals several **severe documentation claim conflicts**:

| Document Path | Document Claim | Codebase & Database Reality | Audit Conflict Status |
| :--- | :--- | :--- | :--- |
| `docs/audits/NURSE_PORTAL_COMPLETE_FINAL.md` | "Phase 3 Nurse Portal domain integrations are successfully completed... Fully integrated with API Gateway JWT verification. Backend routes strictly authorize X-User-Id. No placeholders exist." | 1. API Gateway `application.yml` has **NO route** for `nursing-service`.<br>2. All 10 tables in `swarnikacare_nursing` have **0 rows**.<br>3. `nursing-service` has **0 tests** in `src/test/java`.<br>4. Controllers lack `@PreAuthorize`.<br>5. Staff nurse dashboard (`staff/nurse/dashboard`) is a shell. | **DOCUMENTATION CLAIM CONFLICT (CRITICAL)** |
| `docs/audits/COMMUNICATION_SYSTEM_AUDIT.md` | "STATUS: INDEPENDENTLY AUDITED, COMPLETELY IMPLEMENTED, AND LOCKED... Centralized event-driven communication via Kafka listener and ProcessedEvent idempotency." | 1. Kafka broker on `localhost:9092` is **offline**.<br>2. `notification-service.log` is continuously logging connection failure exceptions.<br>3. `appointment_db.outbox_events` has **164 unconsumed events**.<br>4. `notifications` table has **0 rows**. | **DOCUMENTATION CLAIM CONFLICT (HIGH)** |
| `docs/audits/DOCTOR_PORTAL_COMPLETE_FEATURE_AUDIT.md` | "270-Feature Audit Matrix marked COMPLETE for doctor consultation, prescription dispatch, and diagnostic orders." | While doctor consultation and encounter saving works, prescription and order routing are **unconnected to any real dispensing or laboratory service** (No pharmacy or lab services exist in repo). | **DOCUMENTATION CLAIM CONFLICT (MEDIUM)** |

---

## 2. Mock Data, Static JSON, and UI Placeholder Audit

Direct codebase inspection scanned for keywords (`mock`, `fake`, `dummy`, `sample`, `demo`, `placeholder`):

### Summary Breakdown
- **Care Frontend UI Placeholders / Fallbacks**: **202 occurrences**
- **Public Website Placeholders / Samples**: **32 occurrences**
- **Backend Production Mocks / Bypasses**: **22 occurrences**
- **Test Fixtures**: **105 occurrences**

### Critical Backend Production Mocks
1. **JWT Filter Fallback to `mock-admin`**:
   - Encounter Service: `backend/encounter-service/src/main/java/com/swarnikacare/encounter/security/JwtAuthenticationFilter.java` (lines 49, 52)
   - Appointment Service: `backend/appointment-service/src/main/java/com/swarnikacare/appointment/security/JwtAuthenticationFilter.java` (lines 50, 53)
   - Doctor Service: `backend/doctor-service/src/main/java/com/swarnikacare/doctor/security/JwtAuthenticationFilter.java` (lines 52, 55)
   - Patient Service: `backend/patient-service/src/main/java/com/swarnikacare/patient/security/JwtAuthenticationFilter.java` (lines 50, 53)
   - Organization Service: `backend/organization-service/src/main/java/com/swarnikacare/organization/security/JwtAuthenticationFilter.java` (lines 50, 53)
   - Billing Service: `backend/billing-service/src/main/java/com/swarnikacare/billing/security/JwtAuthenticationFilter.java` (lines 50, 53)
   - API Gateway: `backend/api-gateway/src/main/java/com/swarnikacare/gateway/filter/JwtAuthenticationFilter.java` (line 65)
   *Risk*: When testing or when authorization headers are stripped, requests default to an identity with `mock-admin` and full privileges instead of failing closed with HTTP 401 Unauthorized.

2. **Crude JSON Event Parsing & Fallback ID**:
   - `backend/notification-service/src/main/java/com/swarnikacare/notification/service/NotificationConsumer.java` (lines 36, 84):
     `if (start == -1) return "mock-id-123"; // fallback for crude parsing`
     Hardcoded string parsing fallback instead of ObjectMapper DTO deserialization.

3. **Fallback User Generation in Workforce**:
   - `backend/organization-service/src/main/java/com/swarnikacare/organization/service/EmployeeService.java` (lines 295-299):
     Constructs a fake `IamUserResponse mock = new IamUserResponse();` when IAM service query fails.

---

## 3. Microservice Topology & Architectural Audit

### Bounded Context & Coupling Analysis
1. **Premature Microservice Partitioning**:
   - `billing-service` and `nursing-service` were isolated as standalone Spring Boot applications before core workflows and persistence were operational.
   - Result: 0 test coverage, empty database tables, and unconfigured Gateway routing.
2. **Database Isolation Violations**:
   - `notification-service` is configured in `application.yml` to connect to `jdbc:mysql://localhost:3306/swarnika_care` (the IAM database).
   - This leaves the allocated `notification_db` database empty with 0 tables while coupling the notification service to the IAM database lifecycle.
3. **Cross-Service Communication**:
   - The system utilizes asynchronous Outbox events in `appointment_db` intended for Kafka.
   - Because no Kafka message broker is running, outbox events accumulate without delivery to consumers.

---

## 4. Security & Authorization Audit

### Controllers Lacking `@PreAuthorize` Annotations (23 Endpoints/Classes)

The following backend controllers do not enforce Spring Security method authorization:

1. **Nursing Service (Complete Absence of Role Checks)**:
   - `MedicationAdministrationController.java`
   - `ShiftHandoverController.java`
   - `ShiftTemplateController.java`
   - `NursingAssessmentController.java`
   - `NursingController.java`
   - `CareTaskController.java`
   - `RosterController.java`
   - `NursingNoteController.java`
2. **Encounter Service**:
   - `EmergencyController.java` (`/api/v1/emergency/**`)
   - `AuditLogController.java` (`/api/v1/audit-logs/**`)
   - `OpdController.java` (`/api/v1/opd/**`)
3. **Appointment Service**:
   - `AppointmentController.java` (`/api/v1/appointments/**` - relies on method-level manual checks)
   - `HealthController.java`
4. **Doctor Service**:
   - `DoctorOnboardingController.java`
   - `DoctorProfileController.java`
   - `PublicDoctorController.java` (Intentionally public, but needs rate-limiting)
5. **Patient Service**:
   - `PatientRelationshipController.java`
   - `PatientHospitalRegistrationController.java`
6. **Organization Service**:
   - `DepartmentController.java`
   - `HospitalController.java`
   - `PublicHospitalController.java` (Intentionally public)
7. **IAM Service**:
   - `InternalUserController.java` (Internal API exposed without mutual TLS or secret token)
   - `AuthController.java` (Public OTP endpoints)

### Object-Level Authorization & Hospital Scope Gaps
- **Cross-Hospital Document Access**: `PatientDocumentController` allows downloading files by `documentId` without verifying whether the requesting user's hospital matches the hospital that uploaded the document.
- **Patient Record Snooping**: If a patient user guesses another patient's UUID on certain proxy endpoints, patient identity validation in `PatientController` depends on frontend-supplied query parameters rather than extracting the user ID strictly from the authenticated JWT claims.

---

## 5. Top 10 Remaining Engineering Gaps (Prioritized)

| Rank | Gap Title | Current Reality | Impact | Effort | Blocked By Domain? | Recommendation |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **API Gateway Routing for Nursing Service** | `application.yml` lacks `/api/v1/nursing/**` route | All Nurse UI calls return HTTP 404 | 1 hour | No | Add route definition in Gateway and verify BFF proxy forwarding. |
| **2** | **Kafka Broker Deployment & Outbox Processor** | Local Kafka broker (9092) is down; 164 events unconsumed | Automated email/in-app notification delivery is halted | 3-4 hours | Infrastructure | Run Kafka via Docker or implement scheduled DB Outbox poller. |
| **3** | **Security Hardening: Method Authorization** | 23 controllers/methods lack `@PreAuthorize` | Insecure endpoints open to role bypass | 1-2 days | No | Add `@PreAuthorize("hasAnyRole('STAFF', 'NURSE', 'ADMIN')")` across all controllers. |
| **4** | **Elimination of `mock-admin` Security Filter Fallbacks** | 7 microservices inject `mock-admin` when headers missing | Major vulnerability if exposed to production traffic | 4-6 hours | No | Enforce strict 401 Unauthorized rejection when JWT is invalid. |
| **5** | **Nursing Service Automated Tests & DB Verification** | 0 tests in `src/test/java`; 0 rows in `swarnikacare_nursing` | Cannot verify clinical validity of inpatient care | 2-3 days | Gap 1 | Write unit tests for Vitals, MAR, and Roster services. |
| **6** | **Billing Service End-to-End Implementation** | 0 rows in `billing_db`; Staff Billing UI is shell | No revenue tracking, patient invoicing, or payments | 3-4 days | Gap 3 | Wire billing UI to service and test invoice/payment persistence. |
| **7** | **Laboratory Service Creation** | No lab microservice; shell UI at `staff/lab/dashboard` | Doctor diagnostic orders cannot be fulfilled or reviewed | 1-2 weeks | Yes (Encounter orders) | Create `lab-service` with sample tracking and test reports. |
| **8** | **Pharmacy Service Creation** | No pharmacy microservice; shell UI at `staff/pharmacy/dashboard` | Prescriptions cannot be dispensed or tracked | 1-2 weeks | Yes (Encounter prescriptions)| Create `pharmacy-service` with prescription queue and inventory. |
| **9** | **Object-Level Hospital Scoping for Documents** | Document download lacks hospital ID verification | Cross-hospital patient record leakage | 1 day | Gap 3 | Validate hospital claim against document owner hospital. |
| **10**| **Database Isolation for Notification Service** | Service writes to `swarnika_care` instead of `notification_db` | Violates DB-per-service microservice pattern | 2 hours | No | Update `application.yml` datasource URL to `notification_db`. |

---

## 6. Audit Summary

This gap analysis establishes an unvarnished baseline. Swarnika Care possesses a high-quality, verified core across Patient Identity, Organization/Infrastructure, Doctor Rostering, Appointment Booking, and OPD Encounters.

The primary engineering imperatives are:
1. **Fixing the broken Gateway routing for Nursing**,
2. **Starting the Kafka broker for notification delivery**,
3. **Closing security holes on the 23 unprotected controllers**, and
4. **Building real Laboratory and Pharmacy services to fulfill clinical orders and prescriptions.**
