# DOCTOR PORTAL — READ-ONLY PHASE 0 AUDIT REPORT
**Project:** Swarnika Care  
**Date:** September 27, 2026  
**Auditor:** Antigravity Autonomous Agent  
**Module:** Doctor Portal (`/doctor/*`) & Backend Clinical Workflow  

---

## 1. Executive Summary
A comprehensive read-only audit of `frontend/care` and the backend microservices (`doctor-service`, `patient-service`, `appointment-service`, `encounter-service`, `iam-service`, `organization-service`, and `notification-service`) was conducted to evaluate the readiness of the Doctor Portal operational clinical workspace.

The core infrastructure foundations—IAM OTP authentication, HttpOnly sessions, microservice routing via Spring Cloud Gateway, Doctor profile & availability management, and Encounter lifecycle basics—are established. However, the Doctor Portal in `frontend/care` exists only as a single `/doctor/dashboard` test slice, and the backend lacks clinical consultation sub-domains (structured diagnosis, prescriptions, and lab/imaging orders).

---

## 2. Audit Matrix (34 Target Areas)

| # | Target Capability | Status | Detailed Finding |
|---|---|---|---|
| 1 | Doctor Login | **PASS** | Supported via IAM email + OTP flow (`/api/v1/auth/request-otp` and `/api/v1/auth/verify`). |
| 2 | Doctor Session | **PASS** | HttpOnly `swarnika_session` cookie containing signed JWT with `DOCTOR` role; parsed server-side via `care/src/lib/server/auth.ts`. |
| 3 | Doctor Route Protection | **PARTIAL** | Only individual page-level checks exist in `/doctor/dashboard/page.tsx`. `proxy.ts` does not enforce `DOCTOR` role on `/doctor/*` routes, and is not properly mapped as Next.js `middleware.ts`. |
| 4 | Doctor Dashboard | **MISSING** | Existing `/doctor/dashboard` is a raw JSON test dump. No KPI metrics, no "Today's Schedule", no "Next Patient" workspace, and base `/doctor` route is unhandled. |
| 5 | Today's Appointment List | **PARTIAL** | Backend `appointment-service` has `GET /api/v1/appointments/doctor/{doctorId}`. Frontend lacks appointments page, today's filtering, and queue integration. |
| 6 | Doctor-specific Appointment Filtering | **PARTIAL** | Backend filters by `doctorId`. Frontend lacks UI for filtering by today, tomorrow, upcoming, completed, and cancelled. |
| 7 | Patient Queue | **MISSING** | No `/doctor/queue` route in frontend. Flow from appointment to arrival and consultation queue is not rendered. |
| 8 | Check-in Visibility | **MISSING** | Appointment and encounter statuses exist in backend, but there is no operational queue UI showing patient waiting/in-consultation states. |
| 9 | Patient Search | **MISSING** | `GET /api/v1/patients` exists in backend, but Doctor Portal has no patient search, list, or directory interface. |
| 10 | Patient Details | **PARTIAL** | Backend provides `GET /api/v1/patients/{id}` and hospital registrations (`/registrations`). Frontend `/doctor/patients/[patientId]` route is missing. |
| 11 | Encounter Creation / Opening | **PARTIAL** | Backend `POST /api/v1/encounters` and `GET /api/v1/encounters/{id}` exist. Missing `GET /api/v1/encounters/doctor/{doctorId}` endpoint and frontend UI pages. |
| 12 | Encounter Lifecycle | **PASS (Backend) / PARTIAL (Frontend)** | Backend transitions (`OPEN` -> `IN_PROGRESS` -> `COMPLETED`/`CANCELLED`) exist. Frontend interaction is completely missing. |
| 13 | Consultation Workspace | **MISSING** | No `/doctor/consultation/[encounterId]` clinical workspace in frontend. |
| 14 | Clinical Notes | **PARTIAL** | Encounter table has basic `notes TEXT` and `chief_complaint VARCHAR(500)`. No structured consultation notes, examination, or assessment sections. |
| 15 | Diagnosis | **MISSING** | No diagnosis model or persistence (primary/secondary diagnosis) in backend or frontend. |
| 16 | Prescription | **MISSING** | No prescription entity, table, or API in `encounter-service` or separate pharmacy service. No prescription creator UI. |
| 17 | Lab Orders | **MISSING** | No lab order entity or API for consultation order placement. |
| 18 | Imaging Orders | **MISSING** | No radiology/imaging order entity or API for consultation order placement. |
| 19 | Follow-up | **PARTIAL** | Encounter type `FOLLOW_UP` and appointment booking exist, but structured follow-up recommendations within consultation are missing. |
| 20 | Complete Encounter | **PARTIAL** | Backend `PATCH /api/v1/encounters/{id}/complete` exists. Frontend clinical completion form and validation are missing. |
| 21 | Visit History | **PARTIAL** | Encounters can be queried by patient or hospital in backend. Doctor visit history `/doctor/history` is missing in frontend. |
| 22 | Notifications | **PARTIAL** | `notification-service` is available in backend, but frontend `/doctor/notifications` view is missing. |
| 23 | Doctor Profile | **PARTIAL** | Backend `GET /api/v1/doctors/me` exists. Frontend lacks a dedicated `/doctor/profile` view. |
| 24 | Doctor Availability View | **PARTIAL** | Backend `GET /api/v1/doctors/{id}/availability` exists. Frontend schedule page `/doctor/availability` is missing. |
| 25 | Hospital/Department Scope | **PARTIAL** | Doctor has hospital assignments and department IDs; hospital scoping needs end-to-end enforcement across appointment and encounter lookups. |
| 26 | Object-Level Authorization | **PARTIAL** | `EncounterController` lacks ownership check ensuring the authenticated doctor only accesses and modifies encounters assigned to them. |
| 27 | Loading States | **PARTIAL** | Generic `loading.tsx` exists under `(doctor)`, but component-level skeletons for clinical tables and consultation cards are missing. |
| 28 | Empty States | **MISSING** | No empty states for queue, appointments, or consultation history. |
| 29 | Error States | **PARTIAL** | Generic `error.tsx` exists, but contextual error handling with retry actions is missing. |
| 30 | Audit Trail | **PARTIAL** | Entities have timestamps (`created_at`, `updated_at`). Explicit audit logs for clinical actions (diagnosis, prescription, orders) are missing. |
| 31 | API Parity | **PARTIAL** | Doctor identity and appointments map cleanly to DB. Clinical consultation contracts require new backend fields and full parity testing. |
| 32 | DB Persistence | **PASS** | MySQL databases (`swarnika_care`, `doctor_db`, `appointment_db`, `encounter_db`, `patient_db`) are operational with Flyway migrations. |
| 33 | Existing Tests | **PASS** | Existing test suites in backend microservices pass. |
| 34 | Production Build | **PARTIAL** | Current `frontend/care` builds, but doctor clinical features are not yet present. |

---

## 3. Key Architectural Gaps & Implementation Roadmap

### A. Backend Gap Closure (`encounter-service`)
1. **Extend Encounter Domain**:
   - Add structured clinical fields to `encounters` or related tables:
     - `primary_diagnosis VARCHAR(255)`
     - `secondary_diagnosis VARCHAR(255)`
     - `clinical_notes TEXT`
     - `treatment_plan TEXT`
     - `follow_up_date DATE`
     - `follow_up_notes VARCHAR(500)`
2. **Add Prescription Foundation**:
   - Create `prescriptions` and `prescription_items` table/entity in `encounter-service` associated with `encounter_id`, `doctor_id`, `patient_id`, and `hospital_id`.
   - Implement `POST /api/v1/encounters/{id}/prescriptions` and `GET /api/v1/encounters/{id}/prescriptions`.
3. **Add Lab & Imaging Order Foundation**:
   - Create `clinical_orders` table/entity in `encounter-service` supporting order type (`LAB` / `IMAGING`), test name, priority, and clinical indication.
   - Implement `POST /api/v1/encounters/{id}/orders` and `GET /api/v1/encounters/{id}/orders`.
4. **Encounter Doctor Endpoint & Authorization**:
   - Add `GET /api/v1/encounters/doctor/{doctorId}` to `EncounterController`.
   - Implement object-level authorization ensuring a doctor can only modify encounters assigned to them or their hospital.

### B. Frontend Implementation (`frontend/care`)
1. **Route Protection & Middleware**:
   - Ensure `src/middleware.ts` guards all `/doctor/*` routes and checks for `DOCTOR` role.
2. **Layout & Navigation**:
   - Create `src/app/(doctor)/doctor/layout.tsx`, `DoctorSidebar.tsx`, and `DoctorHeader.tsx` adhering to the Care design system.
3. **Doctor Workspace Pages**:
   - `/doctor`: Operational Dashboard with real KPIs, Today's Schedule, and Next Patient card.
   - `/doctor/appointments`: Filterable appointments (Today, Upcoming, Completed, Cancelled).
   - `/doctor/queue`: Operational patient queue (Waiting, In Consultation, Completed).
   - `/doctor/patients`: My Patients list with search and patient details link.
   - `/doctor/patients/[patientId]`: Comprehensive patient clinical profile.
   - `/doctor/consultation/[encounterId]`: Full clinical consultation workspace (Summary, Notes, Diagnosis, Prescription, Orders, Follow-up, Complete).
   - `/doctor/history`: Patient visit and encounter history.
   - `/doctor/schedule`: Read-only doctor availability schedule.
   - `/doctor/profile`: Professional doctor profile and hospital assignments.

---

## 4. Audit Conclusion
The project has a solid multi-tenant microservices and BFF foundation. Proceeding to **Phase 1: Backend Gap Closure**, followed by **Frontend Implementation**, **Security Matrix Verification**, and **End-to-End Golden Path Testing**.
