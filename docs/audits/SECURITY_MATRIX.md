# Swarnika Care — Comprehensive Security & Authorization Matrix
**Baseline Audit Standard**: READ-ONLY Exhaustive Service & Endpoint Inventory  
**Generated Date**: September 28, 2026  
**Total Identified REST Endpoints**: 178  

---

## 1. Summary of Endpoint Protection

- **Total Endpoints**: 178
- **Protected with Method-Level `@PreAuthorize`**: 106
- **Public Endpoints (Intentional & Whitelisted)**: 6
- **Internal Service Endpoints**: 7
- **VULNERABLE (Missing `@PreAuthorize`)**: 59

---

## 2. Exhaustive Endpoint Authorization Matrix

| Service | Controller | Method | Endpoint | Auth Required | Allowed Roles | Rule Type | Hospital Scope | Object Ownership | Current Status | Risk Level |
| :--- | :--- | :---: | :--- | :---: | :--- | :--- | :---: | :--- | :--- | :---: |
| `appointment-service` | `AppointmentController.java` | **GET** | `/api/v1/appointments/{` | Yes | MISSING | Authenticated User | Unenforced | Role-based | VULNERABLE (Missing @PreAuthorize) | **High** |
| `appointment-service` | `AppointmentController.java` | **POST** | `/api/v1/appointments` | Yes | MISSING | Authenticated User | Unenforced | Role-based | VULNERABLE (Missing @PreAuthorize) | **High** |
| `appointment-service` | `AppointmentController.java` | **GET** | `/api/v1/appointments/{id}` | Yes | MISSING | Authenticated User | Unenforced | Role-based | VULNERABLE (Missing @PreAuthorize) | **High** |
| `appointment-service` | `AppointmentController.java` | **GET** | `/api/v1/appointments/patient/{patientId}` | Yes | MISSING | Authenticated User | Unenforced | Role-based | VULNERABLE (Missing @PreAuthorize) | **High** |
| `appointment-service` | `AppointmentController.java` | **GET** | `/api/v1/appointments/doctor/{doctorId}` | Yes | MISSING | Authenticated User | Unenforced | Role-based | VULNERABLE (Missing @PreAuthorize) | **High** |
| `appointment-service` | `AppointmentController.java` | **PUT** | `/api/v1/appointments/{id}` | Yes | MISSING | Authenticated User | Unenforced | Role-based | VULNERABLE (Missing @PreAuthorize) | **High** |
| `appointment-service` | `AppointmentController.java` | **PATCH** | `/api/v1/appointments/{id}/cancel` | Yes | MISSING | Authenticated User | Unenforced | Role-based | VULNERABLE (Missing @PreAuthorize) | **High** |
| `appointment-service` | `AppointmentController.java` | **PATCH** | `/api/v1/appointments/{id}/complete` | Yes | MISSING | Authenticated User | Unenforced | Role-based | VULNERABLE (Missing @PreAuthorize) | **High** |
| `appointment-service` | `AppointmentController.java` | **PATCH** | `/api/v1/appointments/{id}/confirm` | Yes | MISSING | Authenticated User | Unenforced | Role-based | VULNERABLE (Missing @PreAuthorize) | **High** |
| `appointment-service` | `AppointmentController.java` | **PATCH** | `/api/v1/appointments/{id}/no-show` | Yes | MISSING | Authenticated User | Unenforced | Role-based | VULNERABLE (Missing @PreAuthorize) | **High** |
| `appointment-service` | `AppointmentController.java` | **PATCH** | `/api/v1/appointments/{id}/reschedule` | Yes | MISSING | Authenticated User | Unenforced | Role-based | VULNERABLE (Missing @PreAuthorize) | **High** |
| `appointment-service` | `HealthController.java` | **GET** | `/{` | Yes | MISSING | Authenticated User | Unenforced | Role-based | VULNERABLE (Missing @PreAuthorize) | **High** |
| `billing-service` | `PatientBillingController.java` | **GET** | `/api/v1/billing/me/summary` | Yes | PATIENT | Authenticated User | Unenforced | Owner or Scoped | Protected | **Low** |
| `billing-service` | `PatientBillingController.java` | **GET** | `/api/v1/billing/me/invoices` | Yes | PATIENT | Authenticated User | Unenforced | Owner or Scoped | Protected | **Low** |
| `billing-service` | `PatientBillingController.java` | **GET** | `/api/v1/billing/me/invoices/{invoiceId}` | Yes | PATIENT | Authenticated User | Unenforced | Owner or Scoped | Protected | **Low** |
| `billing-service` | `PatientBillingController.java` | **GET** | `/api/v1/billing/me/payments` | Yes | PATIENT | Authenticated User | Unenforced | Owner or Scoped | Protected | **Low** |
| `billing-service` | `PatientBillingController.java` | **GET** | `/api/v1/billing/me/receipts` | Yes | PATIENT | Authenticated User | Unenforced | Owner or Scoped | Protected | **Low** |
| `doctor-service` | `DoctorAssignmentController.java` | **GET** | `/api/v1/doctors/{doctorId}/assignments` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN, DOCTOR, NURSE, RECEPTIONIST, STAFF | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `doctor-service` | `DoctorAssignmentController.java` | **POST** | `/api/v1/doctors/{doctorId}/assignments` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN | Authenticated User | Enforced | Role-based | Protected | **Low** |
| `doctor-service` | `DoctorAssignmentController.java` | **GET** | `/api/v1/doctors/assignments` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN | Authenticated User | Enforced | Role-based | Protected | **Low** |
| `doctor-service` | `DoctorAssignmentController.java` | **DELETE** | `/api/v1/doctors/assignments/{assignmentId}` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `doctor-service` | `DoctorController.java` | **GET** | `/api/v1/doctors` | Yes | MISSING | Authenticated User | Unenforced | Role-based | VULNERABLE (Missing @PreAuthorize) | **High** |
| `doctor-service` | `DoctorController.java` | **GET** | `/api/v1/doctors/directory` | Yes | Inherited | Authenticated User | Enforced | Role-based | Protected | **Low** |
| `doctor-service` | `DoctorController.java` | **POST** | `/api/v1/doctors` | Yes | SUPER_ADMIN | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `doctor-service` | `DoctorController.java` | **GET** | `/api/v1/doctors/{id}` | Yes | MISSING | Authenticated User | Unenforced | Role-based | VULNERABLE (Missing @PreAuthorize) | **High** |
| `doctor-service` | `DoctorController.java` | **PUT** | `/api/v1/doctors/{id}` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `doctor-service` | `DoctorController.java` | **DELETE** | `/api/v1/doctors/{id}` | Yes | SUPER_ADMIN | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `doctor-service` | `DoctorController.java` | **GET** | `/api/v1/doctors/me` | Yes | MISSING | Authenticated User | Unenforced | Owner or Scoped | VULNERABLE (Missing @PreAuthorize) | **High** |
| `doctor-service` | `DoctorController.java` | **GET** | `/api/v1/doctors/availability` | Yes | Inherited | Authenticated User | Enforced | Role-based | Protected | **Low** |
| `doctor-service` | `DoctorController.java` | **POST** | `/api/v1/doctors/{id}/availability` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN | Authenticated User | Enforced | Role-based | Protected | **Low** |
| `doctor-service` | `DoctorController.java` | **GET** | `/api/v1/doctors/{id}/availability` | Yes | MISSING | Authenticated User | Unenforced | Role-based | VULNERABLE (Missing @PreAuthorize) | **High** |
| `doctor-service` | `DoctorController.java` | **DELETE** | `/api/v1/doctors/availability/{availabilityId}` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `doctor-service` | `DoctorOnboardingController.java` | **POST** | `/api/v1/doctors/onboarding/initiate` | Yes | MISSING | Authenticated User | Unenforced | Role-based | VULNERABLE (Missing @PreAuthorize) | **High** |
| `doctor-service` | `DoctorOnboardingController.java` | **POST** | `/api/v1/doctors/onboarding/complete` | Yes | MISSING | Authenticated User | Unenforced | Role-based | VULNERABLE (Missing @PreAuthorize) | **High** |
| `doctor-service` | `DoctorOnboardingController.java` | **POST** | `/api/v1/doctors/onboarding/resend` | Yes | MISSING | Authenticated User | Unenforced | Role-based | VULNERABLE (Missing @PreAuthorize) | **High** |
| `doctor-service` | `DoctorProfileController.java` | **GET** | `/api/v1/doctors/{doctorId}/profile` | Yes | MISSING | Authenticated User | Unenforced | Role-based | VULNERABLE (Missing @PreAuthorize) | **High** |
| `doctor-service` | `DoctorProfileController.java` | **PUT** | `/api/v1/doctors/{doctorId}/profile` | Yes | MISSING | Authenticated User | Unenforced | Role-based | VULNERABLE (Missing @PreAuthorize) | **High** |
| `doctor-service` | `DoctorProfileController.java` | **PATCH** | `/api/v1/doctors/{doctorId}/profile/status` | Yes | MISSING | Authenticated User | Unenforced | Role-based | VULNERABLE (Missing @PreAuthorize) | **High** |
| `doctor-service` | `PublicDoctorController.java` | **GET** | `/api/v1/public/doctors` | No | Public | Public | N/A | Role-based | Public Intentional | **Low** |
| `doctor-service` | `PublicDoctorController.java` | **GET** | `/api/v1/public/doctors/specialities` | No | Public | Public | N/A | Role-based | Public Intentional | **Low** |
| `encounter-service` | `AdmissionController.java` | **POST** | `/api/v1/admissions` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN, RECEPTIONIST, DOCTOR, NURSE | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `encounter-service` | `AdmissionController.java` | **GET** | `/api/v1/admissions` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN, RECEPTIONIST, DOCTOR, NURSE | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `encounter-service` | `AdmissionController.java` | **GET** | `/api/v1/admissions/{id}` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN, RECEPTIONIST, DOCTOR, NURSE | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `encounter-service` | `AdmissionController.java` | **PATCH** | `/api/v1/admissions/{id}/status` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN, RECEPTIONIST, DOCTOR, NURSE | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `encounter-service` | `AdmissionController.java` | **GET** | `/api/v1/admissions/me` | Yes | PATIENT | Authenticated User | Unenforced | Owner or Scoped | Protected | **Low** |
| `encounter-service` | `AuditLogController.java` | **POST** | `/api/v1/audit-logs` | Yes | MISSING | Authenticated User | Unenforced | Role-based | VULNERABLE (Missing @PreAuthorize) | **High** |
| `encounter-service` | `AuditLogController.java` | **GET** | `/api/v1/audit-logs` | Yes | MISSING | Authenticated User | Unenforced | Role-based | VULNERABLE (Missing @PreAuthorize) | **High** |
| `encounter-service` | `EmergencyController.java` | **POST** | `/api/v1/emergency/encounters` | Yes | MISSING | Authenticated User | Unenforced | Role-based | VULNERABLE (Missing @PreAuthorize) | **High** |
| `encounter-service` | `EncounterController.java` | **POST** | `/api/v1/encounters` | Yes | DOCTOR, SUPER_ADMIN, HOSPITAL_ADMIN, RECEPTIONIST | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `encounter-service` | `EncounterController.java` | **GET** | `/api/v1/encounters` | Yes | DOCTOR, SUPER_ADMIN, HOSPITAL_ADMIN, RECEPTIONIST, NURSE | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `encounter-service` | `EncounterController.java` | **GET** | `/api/v1/encounters/{id}` | Yes | DOCTOR, SUPER_ADMIN, HOSPITAL_ADMIN, RECEPTIONIST, NURSE | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `encounter-service` | `EncounterController.java` | **GET** | `/api/v1/encounters/patient/{patientId}` | Yes | DOCTOR, SUPER_ADMIN, HOSPITAL_ADMIN, RECEPTIONIST, NURSE | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `encounter-service` | `EncounterController.java` | **GET** | `/api/v1/encounters/hospital/{hospitalId}` | Yes | DOCTOR, SUPER_ADMIN, HOSPITAL_ADMIN, RECEPTIONIST, NURSE | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `encounter-service` | `EncounterController.java` | **GET** | `/api/v1/encounters/doctor/{doctorId}` | Yes | DOCTOR, SUPER_ADMIN, HOSPITAL_ADMIN | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `encounter-service` | `EncounterController.java` | **PUT** | `/api/v1/encounters/{id}/consultation` | Yes | DOCTOR, SUPER_ADMIN | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `encounter-service` | `EncounterController.java` | **POST** | `/api/v1/encounters/{id}/prescriptions` | Yes | DOCTOR, SUPER_ADMIN | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `encounter-service` | `EncounterController.java` | **GET** | `/api/v1/encounters/{id}/prescriptions` | Yes | DOCTOR, SUPER_ADMIN, HOSPITAL_ADMIN, RECEPTIONIST, NURSE | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `encounter-service` | `EncounterController.java` | **GET** | `/api/v1/encounters/prescriptions/patient/{patientId}` | Yes | DOCTOR, SUPER_ADMIN, HOSPITAL_ADMIN, RECEPTIONIST, NURSE | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `encounter-service` | `EncounterController.java` | **POST** | `/api/v1/encounters/{id}/orders` | Yes | DOCTOR, SUPER_ADMIN | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `encounter-service` | `EncounterController.java` | **GET** | `/api/v1/encounters/{id}/orders` | Yes | DOCTOR, SUPER_ADMIN, HOSPITAL_ADMIN, RECEPTIONIST, NURSE | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `encounter-service` | `EncounterController.java` | **GET** | `/api/v1/encounters/orders/patient/{patientId}` | Yes | DOCTOR, SUPER_ADMIN, HOSPITAL_ADMIN, RECEPTIONIST, NURSE | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `encounter-service` | `EncounterController.java` | **PATCH** | `/api/v1/encounters/{id}/start` | Yes | DOCTOR, SUPER_ADMIN | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `encounter-service` | `EncounterController.java` | **PATCH** | `/api/v1/encounters/{id}/complete` | Yes | DOCTOR, SUPER_ADMIN | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `encounter-service` | `EncounterController.java` | **PATCH** | `/api/v1/encounters/{id}/cancel` | Yes | DOCTOR, SUPER_ADMIN, HOSPITAL_ADMIN | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `encounter-service` | `EncounterController.java` | **GET** | `/api/v1/encounters/me/encounters` | Yes | PATIENT | Authenticated User | Unenforced | Owner or Scoped | Protected | **Low** |
| `encounter-service` | `EncounterController.java` | **GET** | `/api/v1/encounters/me/prescriptions` | Yes | PATIENT | Authenticated User | Unenforced | Owner or Scoped | Protected | **Low** |
| `encounter-service` | `EncounterController.java` | **GET** | `/api/v1/encounters/me/orders` | Yes | PATIENT | Authenticated User | Unenforced | Owner or Scoped | Protected | **Low** |
| `encounter-service` | `OpdController.java` | **POST** | `/api/v1/opd/encounters` | Yes | MISSING | Authenticated User | Unenforced | Role-based | VULNERABLE (Missing @PreAuthorize) | **High** |
| `encounter-service` | `QueueTokenController.java` | **POST** | `/api/v1/queue-tokens/{` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN, RECEPTIONIST, DOCTOR, NURSE, PATIENT | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `encounter-service` | `QueueTokenController.java` | **GET** | `/api/v1/queue-tokens` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN, RECEPTIONIST, DOCTOR, NURSE | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `encounter-service` | `QueueTokenController.java` | **GET** | `/api/v1/queue-tokens/{id}` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN, RECEPTIONIST, DOCTOR, NURSE | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `encounter-service` | `QueueTokenController.java` | **PATCH** | `/api/v1/queue-tokens/{id}/status` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN, RECEPTIONIST, DOCTOR, NURSE | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `encounter-service` | `QueueTokenController.java` | **GET** | `/api/v1/queue-tokens/me` | Yes | PATIENT | Authenticated User | Unenforced | Owner or Scoped | Protected | **Low** |
| `encounter-service` | `ReferralController.java` | **POST** | `/api/v1/referrals` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN, RECEPTIONIST, DOCTOR | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `encounter-service` | `ReferralController.java` | **GET** | `/api/v1/referrals` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN, RECEPTIONIST, DOCTOR | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `encounter-service` | `ReferralController.java` | **GET** | `/api/v1/referrals/{id}` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN, RECEPTIONIST, DOCTOR | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `encounter-service` | `ReferralController.java` | **PATCH** | `/api/v1/referrals/{id}/status` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN, RECEPTIONIST, DOCTOR | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `encounter-service` | `ReferralController.java` | **GET** | `/api/v1/referrals/me` | Yes | PATIENT | Authenticated User | Unenforced | Owner or Scoped | Protected | **Low** |
| `iam-service` | `AdminController.java` | **POST** | `/api/v1/admin/doctors` | Yes | SUPER_ADMIN | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `iam-service` | `AuthController.java` | **POST** | `/api/v1/auth/register/patient` | No | Public | Public | N/A | Role-based | Public Intentional | **Low** |
| `iam-service` | `AuthController.java` | **POST** | `/api/v1/auth/request-otp` | No | Public | Public | N/A | Role-based | Public Intentional | **Low** |
| `iam-service` | `AuthController.java` | **POST** | `/api/v1/auth/verify-otp` | No | Public | Public | N/A | Role-based | Public Intentional | **Low** |
| `iam-service` | `InternalUserController.java` | **POST** | `/api/v1/internal/users/send-verification-otp` | Yes | Internal Service | Internal (Secret Header) | Unenforced | Role-based | Internal Protected | **Medium** |
| `iam-service` | `InternalUserController.java` | **POST** | `/api/v1/internal/users/verify-otp` | Yes | Internal Service | Internal (Secret Header) | Unenforced | Role-based | Internal Protected | **Medium** |
| `iam-service` | `InternalUserController.java` | **POST** | `/api/v1/internal/users/provision-doctor` | Yes | Internal Service | Internal (Secret Header) | Unenforced | Role-based | Internal Protected | **Medium** |
| `iam-service` | `InternalUserController.java` | **POST** | `/api/v1/internal/users/provision-staff` | Yes | Internal Service | Internal (Secret Header) | Unenforced | Role-based | Internal Protected | **Medium** |
| `iam-service` | `InternalUserController.java` | **GET** | `/api/v1/internal/users/{id}` | Yes | Internal Service | Internal (Secret Header) | Unenforced | Role-based | Internal Protected | **Medium** |
| `iam-service` | `InternalUserController.java` | **GET** | `/api/v1/internal/users/by-email` | Yes | Internal Service | Internal (Secret Header) | Unenforced | Role-based | Internal Protected | **Medium** |
| `iam-service` | `InternalUserController.java` | **DELETE** | `/api/v1/internal/users/{id}` | Yes | Internal Service | Internal (Secret Header) | Unenforced | Role-based | Internal Protected | **Medium** |
| `nursing-service` | `CareTaskController.java` | **GET** | `/api/v1/nursing/tasks/my` | Yes | MISSING | Authenticated User | Unenforced | Role-based | VULNERABLE (Missing @PreAuthorize) | **High** |
| `nursing-service` | `CareTaskController.java` | **POST** | `/api/v1/nursing/tasks` | Yes | MISSING | Authenticated User | Unenforced | Role-based | VULNERABLE (Missing @PreAuthorize) | **High** |
| `nursing-service` | `CareTaskController.java` | **PATCH** | `/api/v1/nursing/tasks/{id}/start` | Yes | MISSING | Authenticated User | Unenforced | Role-based | VULNERABLE (Missing @PreAuthorize) | **High** |
| `nursing-service` | `CareTaskController.java` | **PATCH** | `/api/v1/nursing/tasks/{id}/complete` | Yes | MISSING | Authenticated User | Unenforced | Role-based | VULNERABLE (Missing @PreAuthorize) | **High** |
| `nursing-service` | `MedicationAdministrationController.java` | **POST** | `/api/v1/nursing/mar` | Yes | MISSING | Authenticated User | Unenforced | Role-based | VULNERABLE (Missing @PreAuthorize) | **High** |
| `nursing-service` | `NursingAssessmentController.java` | **POST** | `/api/v1/nursing/assessments` | Yes | MISSING | Authenticated User | Unenforced | Role-based | VULNERABLE (Missing @PreAuthorize) | **High** |
| `nursing-service` | `NursingController.java` | **GET** | `/api/v1/nursing/patients/my-patients` | Yes | MISSING | Authenticated User | Unenforced | Role-based | VULNERABLE (Missing @PreAuthorize) | **High** |
| `nursing-service` | `NursingController.java` | **POST** | `/api/v1/nursing/patients/assignments` | Yes | MISSING | Authenticated User | Unenforced | Role-based | VULNERABLE (Missing @PreAuthorize) | **High** |
| `nursing-service` | `NursingController.java` | **POST** | `/api/v1/nursing/patients/{patientId}/vitals` | Yes | MISSING | Authenticated User | Unenforced | Role-based | VULNERABLE (Missing @PreAuthorize) | **High** |
| `nursing-service` | `NursingNoteController.java` | **GET** | `/api/v1/nursing/patients/{patientId}/notes` | Yes | MISSING | Authenticated User | Unenforced | Role-based | VULNERABLE (Missing @PreAuthorize) | **High** |
| `nursing-service` | `NursingNoteController.java` | **POST** | `/api/v1/nursing/patients/{patientId}/notes` | Yes | MISSING | Authenticated User | Unenforced | Role-based | VULNERABLE (Missing @PreAuthorize) | **High** |
| `nursing-service` | `RosterController.java` | **GET** | `/api/v1/nursing/rosters/me` | Yes | MISSING | Authenticated User | Unenforced | Owner or Scoped | VULNERABLE (Missing @PreAuthorize) | **High** |
| `nursing-service` | `ShiftHandoverController.java` | **POST** | `/api/v1/nursing/handovers` | Yes | MISSING | Authenticated User | Unenforced | Role-based | VULNERABLE (Missing @PreAuthorize) | **High** |
| `nursing-service` | `ShiftTemplateController.java` | **GET** | `/api/v1/nursing/shifts/templates` | Yes | MISSING | Authenticated User | Unenforced | Role-based | VULNERABLE (Missing @PreAuthorize) | **High** |
| `nursing-service` | `ShiftTemplateController.java` | **POST** | `/api/v1/nursing/shifts/templates` | Yes | MISSING | Authenticated User | Unenforced | Role-based | VULNERABLE (Missing @PreAuthorize) | **High** |
| `organization-service` | `BedController.java` | **GET** | `/api/v1/beds` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN, OPERATIONS_MANAGER, DOCTOR, NURSE, RECEPTIONIST, STAFF | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `organization-service` | `BedController.java` | **GET** | `/api/v1/beds/{id}` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN, OPERATIONS_MANAGER, DOCTOR, NURSE, RECEPTIONIST, STAFF | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `organization-service` | `BedController.java` | **POST** | `/api/v1/beds` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN, OPERATIONS_MANAGER | Authenticated User | Enforced | Role-based | Protected | **Low** |
| `organization-service` | `BedController.java` | **PUT** | `/api/v1/beds/{id}` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN, OPERATIONS_MANAGER | Authenticated User | Enforced | Role-based | Protected | **Low** |
| `organization-service` | `BedController.java` | **PATCH** | `/api/v1/beds/{id}/status` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN, OPERATIONS_MANAGER, DOCTOR, NURSE | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `organization-service` | `BedController.java` | **DELETE** | `/api/v1/beds/{id}` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN, OPERATIONS_MANAGER | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `organization-service` | `BuildingController.java` | **GET** | `/api/v1/buildings` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN, OPERATIONS_MANAGER, DOCTOR, NURSE, RECEPTIONIST, STAFF | Authenticated User | Enforced | Role-based | Protected | **Low** |
| `organization-service` | `BuildingController.java` | **GET** | `/api/v1/buildings/{id}` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN, OPERATIONS_MANAGER, DOCTOR, NURSE, RECEPTIONIST, STAFF | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `organization-service` | `BuildingController.java` | **POST** | `/api/v1/buildings` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN, OPERATIONS_MANAGER | Authenticated User | Enforced | Role-based | Protected | **Low** |
| `organization-service` | `BuildingController.java` | **PUT** | `/api/v1/buildings/{id}` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN, OPERATIONS_MANAGER | Authenticated User | Enforced | Role-based | Protected | **Low** |
| `organization-service` | `BuildingController.java` | **DELETE** | `/api/v1/buildings/{id}` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN, OPERATIONS_MANAGER | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `organization-service` | `DepartmentController.java` | **POST** | `/api/v1/departments` | Yes | MISSING | Authenticated User | Unenforced | Role-based | VULNERABLE (Missing @PreAuthorize) | **High** |
| `organization-service` | `DepartmentController.java` | **GET** | `/api/v1/departments` | Yes | MISSING | Authenticated User | Unenforced | Role-based | VULNERABLE (Missing @PreAuthorize) | **High** |
| `organization-service` | `DepartmentController.java` | **GET** | `/api/v1/departments/{id}` | Yes | MISSING | Authenticated User | Unenforced | Role-based | VULNERABLE (Missing @PreAuthorize) | **High** |
| `organization-service` | `DepartmentController.java` | **GET** | `/api/v1/departments/hospital/{hospitalId}` | Yes | MISSING | Authenticated User | Unenforced | Role-based | VULNERABLE (Missing @PreAuthorize) | **High** |
| `organization-service` | `DepartmentController.java` | **PUT** | `/api/v1/departments/{id}` | Yes | MISSING | Authenticated User | Unenforced | Role-based | VULNERABLE (Missing @PreAuthorize) | **High** |
| `organization-service` | `DesignationController.java` | **GET** | `/api/v1/designations` | Yes | MISSING | Authenticated User | Unenforced | Role-based | VULNERABLE (Missing @PreAuthorize) | **High** |
| `organization-service` | `DesignationController.java` | **POST** | `/api/v1/designations` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `organization-service` | `EmployeeController.java` | **GET** | `/api/v1/employees/directory` | Yes | Inherited | Authenticated User | Enforced | Role-based | Protected | **Low** |
| `organization-service` | `EmployeeController.java` | **GET** | `/api/v1/employees/{id}` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN, OPERATIONS_MANAGER | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `organization-service` | `EmployeeController.java` | **POST** | `/api/v1/employees/onboard` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN | Authenticated User | Enforced | Role-based | Protected | **Low** |
| `organization-service` | `EmployeeController.java` | **PUT** | `/api/v1/employees/{id}` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `organization-service` | `EmployeeController.java` | **PATCH** | `/api/v1/employees/{id}/status` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `organization-service` | `EmployeeController.java` | **DELETE** | `/api/v1/employees/{id}` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `organization-service` | `EmployeeController.java` | **GET** | `/api/v1/employees` | Yes | SUPER_ADMIN | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `organization-service` | `EmployeeController.java` | **POST** | `/api/v1/employees` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN, OPERATIONS_MANAGER | Authenticated User | Enforced | Role-based | Protected | **Low** |
| `organization-service` | `FloorController.java` | **GET** | `/api/v1/floors` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN, OPERATIONS_MANAGER, DOCTOR, NURSE, RECEPTIONIST, STAFF | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `organization-service` | `FloorController.java` | **GET** | `/api/v1/floors/{id}` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN, OPERATIONS_MANAGER, DOCTOR, NURSE, RECEPTIONIST, STAFF | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `organization-service` | `FloorController.java` | **POST** | `/api/v1/floors` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN, OPERATIONS_MANAGER | Authenticated User | Enforced | Role-based | Protected | **Low** |
| `organization-service` | `FloorController.java` | **PUT** | `/api/v1/floors/{id}` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN, OPERATIONS_MANAGER | Authenticated User | Enforced | Role-based | Protected | **Low** |
| `organization-service` | `FloorController.java` | **DELETE** | `/api/v1/floors/{id}` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN, OPERATIONS_MANAGER | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `organization-service` | `HospitalController.java` | **POST** | `/api/v1/hospitals` | Yes | MISSING | Authenticated User | Unenforced | Role-based | VULNERABLE (Missing @PreAuthorize) | **High** |
| `organization-service` | `HospitalController.java` | **GET** | `/api/v1/hospitals` | Yes | MISSING | Authenticated User | Unenforced | Role-based | VULNERABLE (Missing @PreAuthorize) | **High** |
| `organization-service` | `HospitalController.java` | **GET** | `/api/v1/hospitals/{id}` | Yes | MISSING | Authenticated User | Unenforced | Role-based | VULNERABLE (Missing @PreAuthorize) | **High** |
| `organization-service` | `HospitalController.java` | **PUT** | `/api/v1/hospitals/{id}` | Yes | MISSING | Authenticated User | Unenforced | Role-based | VULNERABLE (Missing @PreAuthorize) | **High** |
| `organization-service` | `HospitalScopeController.java` | **GET** | `/api/v1/hospitals/{hospitalId}/employees` | Yes | Inherited | Authenticated User | Enforced | Role-based | Protected | **Low** |
| `organization-service` | `HospitalScopeController.java` | **GET** | `/api/v1/hospitals/{hospitalId}/positions` | Yes | Inherited | Authenticated User | Enforced | Role-based | Protected | **Low** |
| `organization-service` | `NursingStationController.java` | **GET** | `/api/v1/nursing-stations` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN, OPERATIONS_MANAGER, DOCTOR, NURSE, RECEPTIONIST, STAFF | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `organization-service` | `NursingStationController.java` | **GET** | `/api/v1/nursing-stations/{id}` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN, OPERATIONS_MANAGER, DOCTOR, NURSE, RECEPTIONIST, STAFF | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `organization-service` | `NursingStationController.java` | **POST** | `/api/v1/nursing-stations` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN, OPERATIONS_MANAGER | Authenticated User | Enforced | Role-based | Protected | **Low** |
| `organization-service` | `NursingStationController.java` | **PUT** | `/api/v1/nursing-stations/{id}` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN, OPERATIONS_MANAGER | Authenticated User | Enforced | Role-based | Protected | **Low** |
| `organization-service` | `NursingStationController.java` | **DELETE** | `/api/v1/nursing-stations/{id}` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN, OPERATIONS_MANAGER | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `organization-service` | `PositionController.java` | **GET** | `/api/v1/positions` | Yes | SUPER_ADMIN | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `organization-service` | `PositionController.java` | **POST** | `/api/v1/positions` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN, OPERATIONS_MANAGER | Authenticated User | Enforced | Role-based | Protected | **Low** |
| `organization-service` | `PublicHospitalController.java` | **GET** | `/api/v1/public/hospitals` | No | Public | Public | N/A | Role-based | Public Intentional | **Low** |
| `organization-service` | `RoomController.java` | **GET** | `/api/v1/rooms` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN, OPERATIONS_MANAGER, DOCTOR, NURSE, RECEPTIONIST, STAFF | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `organization-service` | `RoomController.java` | **GET** | `/api/v1/rooms/{id}` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN, OPERATIONS_MANAGER, DOCTOR, NURSE, RECEPTIONIST, STAFF | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `organization-service` | `RoomController.java` | **POST** | `/api/v1/rooms` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN, OPERATIONS_MANAGER | Authenticated User | Enforced | Role-based | Protected | **Low** |
| `organization-service` | `RoomController.java` | **PUT** | `/api/v1/rooms/{id}` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN, OPERATIONS_MANAGER | Authenticated User | Enforced | Role-based | Protected | **Low** |
| `organization-service` | `RoomController.java` | **PATCH** | `/api/v1/rooms/{id}/status` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN, OPERATIONS_MANAGER, DOCTOR, NURSE | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `organization-service` | `RoomController.java` | **DELETE** | `/api/v1/rooms/{id}` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN, OPERATIONS_MANAGER | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `organization-service` | `UnitController.java` | **GET** | `/api/v1/units` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN, OPERATIONS_MANAGER, DOCTOR, NURSE, RECEPTIONIST, STAFF | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `organization-service` | `UnitController.java` | **GET** | `/api/v1/units/{id}` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN, OPERATIONS_MANAGER, DOCTOR, NURSE, RECEPTIONIST, STAFF | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `organization-service` | `UnitController.java` | **POST** | `/api/v1/units` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN, OPERATIONS_MANAGER | Authenticated User | Enforced | Role-based | Protected | **Low** |
| `organization-service` | `UnitController.java` | **PUT** | `/api/v1/units/{id}` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN, OPERATIONS_MANAGER | Authenticated User | Enforced | Role-based | Protected | **Low** |
| `organization-service` | `UnitController.java` | **DELETE** | `/api/v1/units/{id}` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN, OPERATIONS_MANAGER | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `patient-service` | `PatientController.java` | **GET** | `/api/v1/patients` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN, RECEPTIONIST, NURSE, DOCTOR | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `patient-service` | `PatientController.java` | **POST** | `/api/v1/patients` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN, RECEPTIONIST | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `patient-service` | `PatientController.java` | **GET** | `/api/v1/patients/{id}` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN, RECEPTIONIST, NURSE, DOCTOR | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `patient-service` | `PatientController.java` | **PUT** | `/api/v1/patients/{id}` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN, RECEPTIONIST | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `patient-service` | `PatientController.java` | **DELETE** | `/api/v1/patients/{id}` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `patient-service` | `PatientController.java` | **GET** | `/api/v1/patients/me` | Yes | MISSING | Authenticated User | Unenforced | Owner or Scoped | VULNERABLE (Missing @PreAuthorize) | **High** |
| `patient-service` | `PatientController.java` | **PATCH** | `/api/v1/patients/me` | Yes | MISSING | Authenticated User | Unenforced | Owner or Scoped | VULNERABLE (Missing @PreAuthorize) | **High** |
| `patient-service` | `PatientDocumentController.java` | **POST** | `/api/v1/patients/{patientId}/documents` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN, RECEPTIONIST | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `patient-service` | `PatientDocumentController.java` | **GET** | `/api/v1/patients/{patientId}/documents` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN, RECEPTIONIST | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `patient-service` | `PatientDocumentController.java` | **PATCH** | `/api/v1/patients/{patientId}/documents/{documentId}/verify` | Yes | SUPER_ADMIN, HOSPITAL_ADMIN, RECEPTIONIST | Authenticated User | Unenforced | Role-based | Protected | **Low** |
| `patient-service` | `PatientDocumentController.java` | **GET** | `/api/v1/patients/me/documents` | Yes | PATIENT | Authenticated User | Unenforced | Owner or Scoped | Protected | **Low** |
| `patient-service` | `PatientDocumentController.java` | **GET** | `/api/v1/patients/me/documents/{documentId}/access` | Yes | PATIENT | Authenticated User | Unenforced | Owner or Scoped | Protected | **Low** |
| `patient-service` | `PatientDocumentController.java` | **GET** | `/api/v1/documents/redeem` | Yes | MISSING | Authenticated User | Unenforced | Role-based | VULNERABLE (Missing @PreAuthorize) | **High** |
| `patient-service` | `PatientHospitalRegistrationController.java` | **POST** | `/api/v1/patients/{patientId}/registrations` | Yes | MISSING | Authenticated User | Unenforced | Role-based | VULNERABLE (Missing @PreAuthorize) | **High** |
| `patient-service` | `PatientHospitalRegistrationController.java` | **GET** | `/api/v1/patients/{patientId}/registrations` | Yes | MISSING | Authenticated User | Unenforced | Role-based | VULNERABLE (Missing @PreAuthorize) | **High** |
| `patient-service` | `PatientRelationshipController.java` | **POST** | `/api/v1/patients/{patientId}/relationships` | Yes | MISSING | Authenticated User | Unenforced | Role-based | VULNERABLE (Missing @PreAuthorize) | **High** |
| `patient-service` | `PatientRelationshipController.java` | **GET** | `/api/v1/patients/{patientId}/relationships` | Yes | MISSING | Authenticated User | Unenforced | Role-based | VULNERABLE (Missing @PreAuthorize) | **High** |
| `patient-service` | `PatientRelationshipController.java` | **DELETE** | `/api/v1/patients/{patientId}/relationships/{relationshipId}` | Yes | MISSING | Authenticated User | Unenforced | Role-based | VULNERABLE (Missing @PreAuthorize) | **High** |
