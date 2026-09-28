# IPD (Inpatient Management) Current State Audit

## 1. Existing Architecture & Components
Based on the repository inspection, Swarnika-Care already possesses a significant portion of the foundation required for IPD:

- **Encounter Service:** Already owns the `Admission` entity and provides `/api/v1/admissions` endpoints. It handles `AdmissionStatus` (REQUESTED, etc.), maps to a `bedId`, `wardId`, `roomId`, and `patientId`. 
- **Organization Service:** Already owns Bed management. It has entities for `Building`, `Floor`, `Unit`, `Room`, and `Bed`. The `BedController` exposes `/api/v1/beds/{id}/status` allowing for status updates (e.g., OCCUPIED, AVAILABLE).
- **Patient Service:** Manages patient records (`/api/v1/patients`).
- **Billing Service:** Manages charges (`/api/v1/billing/charges`).
- **Pharmacy Service & Lab Service (LIS):** Both locked, ready for consumption.

## 2. Missing IPD Functionality
While Admissions and Beds are structurally handled, the specific clinical workflows for Inpatients are missing. This includes:
- **Bed Transfers & Bed Assignments:** While `Admission` points to a bed, a transactional workflow linking `organization-service` and `encounter-service` safely is required to prevent race conditions during bed assignments/transfers.
- **Inpatient Care (Doctor/Nursing):** Missing entities for Doctor Rounds, Vitals, Clinical Notes, and Discharge Summaries. 
- **Discharge Workflow:** No formal workflow to move an admission to DISCHARGED, release the bed, and finalize billing.
- **Frontend UI:** There is no `/staff/ipd` section in the Next.js app. The frontend needs Dashboards, Admission management, Bed/Ward views, and clinical interfaces for Doctors/Nurses.

## 3. Potential Conflicts & Duplications (WARNINGS)
- **Do not create an `ipd-service` that duplicates `Admission` or `Bed`.** If we create an `ipd-service`, it should purely act as an orchestrator/clinical service (handling Rounds, Notes, Vitals, Discharge Summaries), or we should expand `encounter-service` to encompass the rest of the IPD workflows to prevent distributed transaction headaches with admissions.
- *Recommendation:* Since `encounter-service` already handles Admissions and OPD/Emergency, it makes architectural sense to extend `encounter-service` for core IPD workflows (Transfers, Discharges) OR create `ipd-service` purely for the clinical documentation (Rounds, Vitals) and orchestration. I will implement `ipd-service` to manage the **Clinical IPD** (Vitals, Rounds, Clinical Notes, Discharge Summaries) and **Orchestration** (Bed Assignments, Transfers, Discharge orchestration), while treating `encounter-service` and `organization-service` as the source of truth for Admission and Bed respectively via Feign clients.

## 4. Integration Strategy
- **Authentication:** IPD Service will reuse `JwtAuthenticationFilter` and IAM roles (`DOCTOR`, `NURSE`, `RECEPTIONIST`).
- **API Gateway:** Map `/api/v1/ipd/**` -> `lb://ipd-service`.
- **Database:** `ipd_db` will manage `ipd_vitals`, `ipd_rounds`, `ipd_notes`, `discharge_summaries`.
- **Kafka:** IPD Service will publish `IPD_DISCHARGE_REQUESTED` and `IPD_PATIENT_DISCHARGED`.

## 5. Risks
- **Distributed Transactions:** Assigning a bed requires updating `Bed` status in `organization-service` and `Admission` in `encounter-service`. If one succeeds and the other fails, we have an inconsistent state. We will implement basic idempotency and safe failure handling (or a saga-lite pattern).
- **Concurrent Transfers:** Two users trying to assign the same bed must be prevented. 
