# Nursing Service Architecture

## Bounded Context
The `nursing-service` is responsible for all clinical and administrative workflows executed by Nursing staff within Swarnika Care.

### Service Ownership
**Owns:**
- ShiftTemplates and Rosters
- Nurse Duty Assignments
- Patient Assignments
- Vitals and Clinical Observations
- Nursing Assessments
- Nursing Notes
- Care Tasks
- Medication Administration Records (MAR)
- Shift Handovers

**Does NOT Own:**
- Patient Demographics (Owned by Patient Service)
- Hospital/Ward Infrastructure (Owned by Organization Service)
- Admissions (Owned by Encounter Service)
- Doctor Orders/Prescriptions (Owned by Doctor/Encounter Service)

## Database Schema
Database: `swarnikacare_nursing`

## API Contracts
- `GET /api/v1/nursing/patients/assignments`
- `POST /api/v1/nursing/patients/{patientId}/vitals`
- (Full REST API implementation scoped for Phase 2 rollout)

## Security Controls
- Endpoints restricted to `NURSE` role.
- Inter-service communication via JWT relay.
- Hospital Scope: validated at controller boundary.
