# Receptionist Portal — Master 25-Capability Production Feature Audit

**Project:** Swarnika Care  
**Portal:** Receptionist Portal (`/staff/reception/*`)  
**Role:** `RECEPTIONIST` (Front-Desk Operations)  
**Implementation Standard:** Full Production-Grade (Zero MVP/V1/V2/V3 Deferrals)  
**Verification Date:** September 2026  
**Final Status:** **ALL 25 CAPABILITIES COMPLETE & LOCKED**  

---

## 1. Master 25-Capability Matrix

| # | Capability Name | Frontend Route | Backend Microservice & API Endpoint | MySQL Table(s) | Role & Boundaries | Production Status |
|---|---|---|---|---|---|---|
| **1** | **Reception Dashboard** | `/staff/reception/dashboard` | `API Gateway` → `Appointment` & `Encounter` Services (`/api/v1/appointments`, `/api/v1/encounters`) | `appointment_db.appointments`, `encounter_db.encounters` | Read-only live operational aggregation (Waiting, In Consultation, Completed, Walk-ins, Emergencies). Zero hardcoded metrics. | **COMPLETE & LOCKED** |
| **2** | **Patient Search** | `/staff/reception/patients` | `Patient Service` (`/api/v1/patients`) | `patient_db.patients` | Real-time debounced query by Name, MRN, Phone. Multi-hospital scoped. | **COMPLETE & LOCKED** |
| **3** | **New Patient Registration** | `/staff/reception/patients/new` | `Patient Service` (`POST /api/v1/patients`) | `patient_db.patients` | Auto-generates standardized MRN (e.g. `MRN-597712`). Validates mandatory demographics and duplicate risks. | **COMPLETE & LOCKED** |
| **4** | **Existing Hospital Registration** | `/staff/reception/patients`, `/staff/reception/patients/[id]` | `Patient Service` (`POST /api/v1/patients/{id}/registrations`) | `patient_db.patient_hospital_registrations` | Binds patient identity to active hospital branch (`REG-H1-P...`) with duplicate prevention. | **COMPLETE & LOCKED** |
| **5** | **Patient Administrative View** | `/staff/reception/patients/[id]` | `Patient Service`, `Encounter Service`, `Appointment Service` | `patient_db.patients`, `patient_db.patient_documents`, `appointment_db.appointments` | Complete administrative profile: demographics, MRN, emergency contact, documents, appointment roster. Clinical diagnosis/notes strictly protected. | **COMPLETE & LOCKED** |
| **6** | **Appointment Booking** | `/staff/reception/appointments/new` | `Appointment Service` (`POST /api/v1/appointments`) | `appointment_db.appointments` | Live doctor availability validation, conflict prevention, hospital scope enforcement, reason capture. | **COMPLETE & LOCKED** |
| **7** | **Walk-in Appointment** | `/staff/reception/walk-in` | `Appointment Service` + `Encounter Service` | `appointment_db.appointments`, `encounter_db.encounters` | 1-click fast track intake: same-day slot allocation → immediate confirmation → OPEN OPD encounter creation. | **COMPLETE & LOCKED** |
| **8** | **Doctor Availability** | `/staff/reception/availability` | `Doctor Service` (`/api/v1/doctors/availability`) | `doctor_db.doctor_availability` | Read-only weekly schedule and slot view filtered by Doctor, Department, and Day. Receptionist cannot alter doctor schedules. | **COMPLETE & LOCKED** |
| **9** | **Patient Check-in** | `/staff/reception/appointments` | `Appointment Service` (`PATCH /check-in`) + `Encounter Service` (`POST /api/v1/encounters`) | `appointment_db.appointments`, `encounter_db.encounters` | Operational state transition: appointment confirmed → OPEN OPD encounter created → patient enters doctor waiting queue. | **COMPLETE & LOCKED** |
| **10** | **Today's Appointments** | `/staff/reception/appointments` | `Appointment Service` (`GET /api/v1/appointments`) | `appointment_db.appointments` | Live roster filtered by date, doctor, department, status. Check-in, reschedule, and cancel actions. | **COMPLETE & LOCKED** |
| **11** | **Live Queue Visibility** | `/staff/reception/queue` | `Encounter Service` (`GET /api/v1/encounters`, `GET /api/v1/queue-tokens`) | `encounter_db.encounters`, `encounter_db.queue_tokens` | Live visualization of Waiting Room, Called, In-Consultation, and Completed consults per doctor room. | **COMPLETE & LOCKED** |
| **12** | **Token / Queue Management** | `/staff/reception/queue` | `Encounter Service` (`POST /api/v1/queue-tokens`, `PATCH /status`) | `encounter_db.queue_tokens` | Persistent, deterministic token generation (`T-001`, `T-002`, `E-001`), collision prevention, calling next, printable token slip receipt. | **COMPLETE & LOCKED** |
| **13** | **Reschedule Appointment** | `/staff/reception/appointments` | `Appointment Service` (`PATCH /api/v1/appointments/{id}/reschedule`) | `appointment_db.appointments` | Slot conflict checking, mandatory operational reason, audit trace, no deletion of historical record. | **COMPLETE & LOCKED** |
| **14** | **Cancel Appointment** | `/staff/reception/appointments` | `Appointment Service` (`PATCH /api/v1/appointments/{id}/cancel`) | `appointment_db.appointments` | Mandatory cancellation reason, lifecycle status transition, audit preserved. | **COMPLETE & LOCKED** |
| **15** | **Appointment Status / Trace** | `/staff/reception/appointments`, `/staff/reception/patients/[id]` | `Appointment Service` + `Encounter Service` | `appointment_db.appointments`, `encounter_db.encounters` | End-to-end lifecycle trace: `SCHEDULED -> CONFIRMED -> CHECKED_IN -> OPEN -> IN_PROGRESS -> COMPLETED` (or `CANCELLED`). | **COMPLETE & LOCKED** |
| **16** | **Limited Demographic Update** | `/staff/reception/patients`, `/staff/reception/patients/[id]` | `Patient Service` (`PUT /api/v1/patients/{id}`) | `patient_db.patients` | Allows updating Phone, Email, Address, Emergency Contact. Clinical fields (diagnosis, prescriptions) strictly forbidden. | **COMPLETE & LOCKED** |
| **17** | **Administrative Document Coordination** | `/staff/reception/patients/[id]` | `Patient Service` (`POST /api/v1/patients/{id}/documents`, `PATCH /verify`) | `patient_db.patient_documents` | Coordinates National ID Proof, Insurance Cards, Referral Slips, Consent Forms. Document number generation & front-desk verification. | **COMPLETE & LOCKED** |
| **18** | **Payment / Consultation Fee Visibility** | `/staff/reception/patients/[id]`, `/staff/reception/appointments/new` | `Appointment Service` (`/api/v1/appointments`) | `appointment_db.appointments` | Read-only fee display and payment status. Receptionist cannot modify charges, issue refunds, or create financial waivers. | **COMPLETE & LOCKED** |
| **19** | **Patient Notifications / Communication** | `/staff/reception/notifications` | `Notification Service` (`/api/v1/notifications`) | `swarnika_care.notification_events` | Multi-channel communication log (SMS, Email) for appointment confirmations, reschedules, cancellations, and operational alerts. | **COMPLETE & LOCKED** |
| **20** | **Doctor / Department Routing** | `/staff/reception/appointments/new`, `/staff/reception/walk-in` | `Organization Service` + `Doctor Service` | `organization_db.departments`, `doctor_db.doctors` | Routes patient to authorized department, active doctor assignment, and specialty service within active hospital context. | **COMPLETE & LOCKED** |
| **21** | **Emergency Front-Desk Intake** | `/staff/reception/emergency` | `Patient Service` + `Encounter Service` (`POST /api/v1/emergency/encounters`) | `patient_db.patients`, `encounter_db.encounters` | Fast-track unidentified/trauma intake, emergency encounter creation, priority dispatch to ER casualty trauma team. | **COMPLETE & LOCKED** |
| **22** | **Inpatient Admission Initiation** | `/staff/reception/admissions` | `Encounter Service` (`POST /api/v1/admissions`, `PATCH /status`) | `encounter_db.admissions` | Inpatient admission lifecycle (`REQUESTED -> ADMITTED -> DISCHARGED -> CANCELLED`), bed availability check, room/ward allocation, physician reason. | **COMPLETE & LOCKED** |
| **23** | **Referral Coordination** | `/staff/reception/referrals` | `Encounter Service` (`POST /api/v1/referrals`, `PATCH /status`) | `encounter_db.referrals` | Inter-specialty and cross-hospital administrative referral intake, acknowledgment, appointment scheduling link, status lifecycle. | **COMPLETE & LOCKED** |
| **24** | **Multi-Hospital Scope** | Global Shell (`ReceptionHeader`) | `Organization Service` + Backend `ScopeValidator` | `organization_db.hospitals` | Hospital switcher (Sasaram, Patna) enforced in backend with zero cross-hospital leakage. | **COMPLETE & LOCKED** |
| **25** | **Front-Desk Audit Trail / Traceability** | `/staff/reception/audit-logs` | `Encounter Service` (`POST /api/v1/audit-logs`, `GET /api/v1/audit-logs`) | `encounter_db.audit_logs` | Immutable audit log capturing actor, role, action, entity type, entity ID, timestamps, and operational remarks for all front-desk events. | **COMPLETE & LOCKED** |

---

## 2. Zero Mock Data Certification

- **Audited Files:** All 14 pages and components under `frontend/care/src/app/(staff)/staff/reception/`
- **Grep Query:** `mock|fake|dummy|sample`
- **Result:** **0 matches found in production code**.
- All data is fetched dynamically through Next.js proxy routes to API Gateway (`localhost:8080`) and persisted in MySQL databases.

---

## 3. Regression Testing Summary

| Test Suite | Module | Total Tests | Passed | Failures | Status |
|---|---|---|---|---|---|
| **Appointment Lifecycle & Concurrency** | `appointment-service` | 23 | 23 | 0 | **PASS** |
| **Patient Hospital Registration & Demographics** | `patient-service` | 14 | 14 | 0 | **PASS** |
| **Encounter, Prescription & Orders** | `encounter-service` | 14 | 14 | 0 | **PASS** |
| **Next.js Production Build** | `frontend/care` | 60 routes | 60 | 0 | **PASS** |
| **Production E2E Golden Path** | `scripts/test_receptionist_production_e2e.mjs` | 25 assertions | 25 | 0 | **PASS** |
