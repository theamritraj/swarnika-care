# PUBLIC DOCTOR DIRECTORY AUDIT

## 1. Root cause of current "Total Doctors: 0"
The public Next.js website (in `frontend/public-website/src/app/(public)/doctors/page.tsx`) attempts to fetch doctors by calling:
`http://localhost:8080/api/v1/doctors/specialty/${specialtyParam}` or `http://localhost:8080/api/v1/doctors`.
However, the `DoctorController` (which is mapped to `/api/v1/doctors`) does not have a `/specialty/{specialty}` endpoint, which results in a 404 error. The UI catches this error, logs it, and sets `doctors = []`, leading to "Total Doctors: 0".
Additionally, the `/api/v1/doctors` endpoint is a private admin endpoint that requires authentication/roles.

## 2. Existing API reused/modified
The `doctor-service` has a `PublicDoctorController` mapped to `/api/v1/public/doctors`.
Currently, this endpoint simply returns a list of published `DoctorProfileResponse` objects without taking any filters (like specialty, hospitalId, search). It also does not return nested hospital or department names.

We need to update `PublicDoctorController` and `DoctorProfileService` to support:
`GET /api/v1/public/doctors?specialty=GENERAL_SURGERY&hospitalId=...&search=...`

## 3. Specialty data source
The backend currently uses a string-based `specializations` field on `DoctorProfile` or the `departmentId` in `DoctorDirectoryResponse`. The `specializations` field is free text. We should standardise it or filter by department.

## 4. Hospital/location data source
Currently, the public UI hardcodes "Sasaram, Rohtas" and "Swarnika Hospital, Sasaram".
The doctor service has `DoctorHospitalAssignment` and `DoctorDirectoryResponse` which can provide the associated hospitals. The public API needs to join `DoctorProfile` with `DoctorHospitalAssignment` to filter by hospital.

## 5. Publication filtering
`PublicDoctorController` correctly filters by `PublicProfileStatus.PUBLISHED` by calling `profileRepository.findByStatus(PublicProfileStatus.PUBLISHED)`. This rule is correctly in place but needs to be preserved when filtering by specialty/hospital.

## 6. Frontend changes needed
- Modify `doctors/page.tsx` and `book/page.tsx` to call `/api/v1/public/doctors?specialty=...`
- Remove all hardcoded dummy texts (e.g. `11+ Years`, `MBBS, MD, DNB` fallback, `Available on sunday`).
- Remove static dropdown items and replace them with dynamic ones if possible, or map standard dropdown values to backend specialties.
- Pass the correct `doctorId` to the booking flow.

## 7. Backend changes needed
- Update `DoctorProfileResponse` to include the hospital names, department names, etc. (Or create a `PublicDoctorResponse`).
- Update `DoctorProfileService.getPublishedProfiles` to take `specialty`, `hospitalId`, and `search` arguments.
- Join with `DoctorHospitalAssignment` to filter by `hospitalId`.

## 8. Remaining gaps
- There is no public endpoint to list all available specialties. We may need to add one or derive it from published doctors.
- We need to ensure that the API Gateway passes the request through without authentication (this was done previously, but we should verify).
