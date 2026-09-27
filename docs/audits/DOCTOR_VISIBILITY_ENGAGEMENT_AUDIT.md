# DOCTOR VISIBILITY & ENGAGEMENT AUDIT

## 1. Current Architecture
- **Doctor Identity**: `Doctor` entity (stores name, email, phone, gender, dob, link to IAM `userId`).
- **Professional Profile**: `DoctorProfile` entity (stores bio, qualifications, specializations, experience, consultation fee, and `PublicProfileStatus` like DRAFT, PUBLISHED).
- **Hospital Assignment**: `DoctorHospitalAssignment` entity (stores `doctorId`, `hospitalId`, `departmentId`, `designation`).
- **Employment Identity**: Managed via `iam-service` and `organization-service` (Hospital structure).
- **Public Visibility**: Currently based *only* on `DoctorProfile.status = PUBLISHED` (as seen in `PublicDoctorController`).
- **Appointment Eligibility**: Implicit. If they exist in `DoctorHospitalAssignment` and have availability, they are bookable.
- **Can a doctor be both public and in-house?**: Technically yes, but there are no explicit toggles for this. Every published doctor is assumed public. Every assigned doctor is assumed in-house.

## 2. Gaps Discovered
1. **No Engagement Toggles**: There are no explicit boolean flags for `publicAppointmentEnabled` or `inHouseClinicalEnabled`.
2. **Global Publication vs Hospital Scoped**: The `PublicProfileStatus` is global per `DoctorProfile`, but a doctor might be public at Hospital A and in-house only at Hospital B. The current model doesn't support hospital-scoped public visibility.
3. **Admin UI Missing Step**: The `frontend/care/src/app/admin/doctors/new/page.tsx` has steps for Identity, Profile, and Hospital Assignment, but completely lacks "Step 4: Doctor Engagement".
4. **Public Directory Filter**: The public website `/book` and `/doctors` pages query the backend, but the backend doesn't filter by `publicAppointmentEnabled` (since it doesn't exist yet).
5. **Security/Internal Access**: Internal directory APIs in `DoctorController` are accessible by ADMINs, but the clinical workflows (Encounter, etc.) need an in-house directory that filters by `inHouseClinicalEnabled`.

## 3. Recommended Minimal Changes

### Database & Entity Changes
Instead of creating a new `DoctorEngagement` table, we should add the configuration directly to `DoctorHospitalAssignment` to support hospital-scoped engagement:
- `publicAppointmentEnabled` (BOOLEAN, default false)
- `inHouseClinicalEnabled` (BOOLEAN, default true)

### API Changes
- **Admin API**: Update `DoctorHospitalAssignmentRequest/Response` and `DoctorCreateRequest` to accept the two new engagement booleans.
- **Public API**: Modify `PublicDoctorController` to join `DoctorProfile` with `DoctorHospitalAssignment` and filter where `publicAppointmentEnabled = true`, `status = PUBLISHED`, and `DoctorHospitalAssignment.status = ACTIVE`.

### UI Changes
- **Onboarding (`admin/doctors/new/page.tsx`)**: Add "STEP 4 — DOCTOR ENGAGEMENT" with checkboxes for Public Appointment and In-House Clinical.
- **Doctor Directory (`admin/doctors/page.tsx`)**: Display engagement badges (PUBLIC APPOINTMENT, IN-HOUSE, BOTH) based on the assignment flags.
- **Public Website (`public-website/src/app/(public)/doctors/page.tsx`)**: No major UI change needed here, as the backend `PublicDoctorController` will automatically enforce the rules. We just need to make sure the frontend calls `/api/v1/public/doctors`.

## 4. Security Implications
- Internal fields (like `inHouseClinicalEnabled` or internal hospital ID) must not be exposed on the public API payload.
- Disabling `publicAppointmentEnabled` simply hides the doctor from the public directory; it MUST NOT delete the `Doctor` or their past appointments.

## 5. Next Steps
1. Create a Flyway migration to add `public_appointment_enabled` and `in_house_clinical_enabled` to `doctor_hospital_assignments`.
2. Update `DoctorHospitalAssignment` entity and DTOs.
3. Implement `PHASE 2` and `PHASE 3` (Admin onboarding).
