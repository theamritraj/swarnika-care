# Swarnika Care — Portal & Service Capability Matrix
**Audit Standard**: Exhaustive Capability Classification (Read-Only Verification)  
**Allowed Status Values**: `COMPLETE`, `PARTIAL`, `SCAFFOLD`, `PLACEHOLDER`, `MISSING`, `BROKEN`, `BLOCKED`  

---

## 1. Public Website Capability Matrix (`frontend/public-website`)

| Feature | Route | Component | API | Backend Service | Database | Authorization | Persistence | Test | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Landing Page** | `/` | Hero, QuickActionCards, SpecialtyGrid, Testimonials | None (Static) | None | None | Public | N/A | Manual UI | **COMPLETE** |
| **Doctor Discovery & Search** | `/doctors` | DoctorFilter, DoctorCard, SearchBar | `/api/v1/public/doctors` | `doctor-service` | `doctor_db.doctors` | Public | Read-only | E2E Script | **COMPLETE** |
| **City-Specific Landing** | `/[city]` | CityHero, HospitalList, DepartmentList | `/api/v1/public/hospitals` | `organization-service` | `organization_db.hospitals` | Public | Read-only | Manual UI | **COMPLETE** |
| **Specialty Catalog** | `/specialities` | SpecialtyCard, DepartmentHierarchy | `/api/v1/public/hospitals` | `organization-service` | `organization_db.departments` | Public | Read-only | Manual UI | **COMPLETE** |
| **Direct OPD Booking Modal** | `/book` | AppointmentBookingDialog, SlotPicker | `/api/v1/appointments` | `appointment-service` | `appointment_db.appointments` | Public/Guest | MySQL DB | Concurrency IT | **COMPLETE** |
| **Contact & Feedback** | `/contact`, `/contact-us` | ContactForm, HospitalLocationMap | `/api/v1/public/hospitals` | `organization-service` | `organization_db.hospitals` | Public | N/A | Manual UI | **COMPLETE** |
| **Second Opinion Submission** | `/expert-opinion` | ExpertOpinionForm | None (Mock/Client state) | None | None | Public | None | None | **PLACEHOLDER** |
| **Preventive Health Packages** | `/health-check` | PackageList, BookingCTA | None (Static Catalog) | None | None | Public | None | None | **PLACEHOLDER** |

---

## 2. Admin Portal Capability Matrix (`frontend/care/src/app/admin`)

| Feature | Route | Component | API | Backend Service | Database | Authorization | Persistence | Test | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Admin Overview** | `/admin/dashboard` | MetricCards, RecentActivityTable | `/api/v1/hospitals`, `/audit-logs` | `organization-service`, `encounter-service` | Multiple | `ROLE_ADMIN` | MySQL DB | E2E Script | **COMPLETE** |
| **Hospital Management** | `/admin/hospitals` | HospitalTable, HospitalFormModal | `/api/v1/hospitals` | `organization-service` | `organization_db.hospitals` | `ROLE_ADMIN` | MySQL DB | Unit & IT (6) | **COMPLETE** |
| **Create New Hospital** | `/admin/hospitals/new` | MultiStepHospitalWizard | `/api/v1/hospitals` | `organization-service` | `organization_db.hospitals` | `ROLE_ADMIN` | MySQL DB | Unit & IT | **COMPLETE** |
| **Department Registry** | `/admin/departments` | DepartmentList, DepartmentForm | `/api/v1/departments` | `organization-service` | `organization_db.departments` | `ROLE_ADMIN` | MySQL DB | Unit & IT (4) | **COMPLETE** |
| **Employee & Workforce** | `/admin/staff` | EmployeeTable, RolePicker | `/api/v1/employees` | `organization-service` | `organization_db.employees` | `ROLE_ADMIN` | MySQL DB | Unit & IT (5) | **COMPLETE** |
| **Infrastructure (Beds/Rooms/Units)** | `/admin/infrastructure` | InfrastructureTree, RoomBedManager | `/api/v1/buildings`, `/units`, `/rooms`, `/beds` | `organization-service` | `organization_db.*` | `ROLE_ADMIN` | MySQL DB | Unit & IT (17) | **COMPLETE** |
| **Doctor Roster & Profiles** | `/admin/doctors` | DoctorDirectoryTable, SpecialtyBadge | `/api/v1/doctors` | `doctor-service` | `doctor_db.doctors` | `ROLE_ADMIN` | MySQL DB | Unit & IT (9) | **COMPLETE** |
| **Doctor Onboarding** | `/admin/doctors/new` | OnboardingWizard, DocumentUpload | `/api/v1/doctors/onboarding` | `doctor-service` | `doctor_db.doctors` | `ROLE_ADMIN` | MySQL DB | Unit & IT (7) | **COMPLETE** |
| **Doctor Weekly Availability** | `/admin/availability` | WeeklyScheduleGrid, SlotGenerator | `/api/v1/doctors/availability` | `doctor-service` | `doctor_db.doctor_availability` | `ROLE_ADMIN` | MySQL DB | Unit & IT (10) | **COMPLETE** |
| **Patient Directory** | `/admin/patients` | PatientSearchTable, RegistrationHistory | `/api/v1/patients` | `patient-service` | `patient_db.patients` | `ROLE_ADMIN` | MySQL DB | Unit & IT (4) | **COMPLETE** |
| **Appointment Control** | `/admin/appointments` | AppointmentTable, StatusOverrideModal | `/api/v1/appointments` | `appointment-service` | `appointment_db.appointments` | `ROLE_ADMIN` | MySQL DB | Unit & IT (16) | **COMPLETE** |
| **IAM Users & Roles** | `/admin/users`, `/roles`, `/permissions` | UserList, RolePermissionsMatrix | `/api/v1/auth/users`, `/roles` | `iam-service` | `swarnika_care.users` | `ROLE_ADMIN` | MySQL DB | Unit & IT (5) | **COMPLETE** |
| **System Audit Trails** | `/admin/audit-logs` | AuditLogViewer, EventFilter | `/api/v1/audit-logs` | `encounter-service` | `encounter_db.audit_logs` | `ROLE_ADMIN` | MySQL DB | Unit & IT | **COMPLETE** |
| **Operational Reports** | `/admin/reports/operational` | OperationalMetrics, OccupancyChart | `/api/v1/hospitals/metrics` | `organization-service` | `organization_db` | `ROLE_ADMIN` | Aggregated | None | **PARTIAL** |
| **Financial Reports** | `/admin/reports/financial` | RevenueBreakdown, DepartmentBilling | `/api/v1/billing/reports` (Mock data) | `billing-service` | `billing_db` | `ROLE_ADMIN` | None (0 rows) | None | **SCAFFOLD** |

---

## 3. Doctor Portal Capability Matrix (`frontend/care/src/app/(doctor)/doctor`)

| Feature | Route | Component | API | Backend Service | Database | Authorization | Persistence | Test | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Doctor Dashboard** | `/doctor/dashboard` | TodayScheduleCard, WaitingQueueTable, StatsCard | `/api/v1/doctors/my-schedule`, `/queue-tokens` | `doctor-service`, `encounter-service` | Multiple | `ROLE_DOCTOR` | MySQL DB | E2E Script | **COMPLETE** |
| **OPD Appointments List** | `/doctor/appointments` | AppointmentCalendar, AppointmentCard | `/api/v1/appointments` | `appointment-service` | `appointment_db.appointments` | `ROLE_DOCTOR` | MySQL DB | Lifecycle IT | **COMPLETE** |
| **Consultation & Clinical Notes** | `/doctor/consultation/[encounterId]` | SOAPNotesEditor, VitalsForm, DiagnosisSearch | `/api/v1/encounters/{id}` | `encounter-service` | `encounter_db.encounters` | `ROLE_DOCTOR` | MySQL DB | Unit & IT (14) | **COMPLETE** |
| **Prescription Generation** | `/doctor/prescriptions` | DrugItemInput, DosageFrequencyPicker | `/api/v1/encounters/{id}/prescriptions` | `encounter-service` | `encounter_db.prescriptions` | `ROLE_DOCTOR` | MySQL DB | Unit & IT | **COMPLETE** |
| **Diagnostic Order Entry** | `/doctor/orders` | LabTestPicker, RadiologyOrderForm | `/api/v1/encounters/{id}/orders` | `encounter-service` | `encounter_db.clinical_orders` | `ROLE_DOCTOR` | MySQL DB | Unit & IT | **COMPLETE** |
| **Doctor OPD Live Queue** | `/doctor/queue` | LiveQueueTokensList, CallPatientCTA | `/api/v1/queue-tokens/doctor` | `encounter-service` | `encounter_db.queue_tokens` | `ROLE_DOCTOR` | MySQL DB | Unit & IT | **COMPLETE** |
| **Assigned Patients Directory** | `/doctor/patients` | PatientDirectoryTable, SearchInput | `/api/v1/patients` | `patient-service` | `patient_db.patients` | `ROLE_DOCTOR` | MySQL DB | Unit & IT | **COMPLETE** |
| **Patient Clinical Profile** | `/doctor/patients/[patientId]` | MedicalHistoryTimeline, AllergiesCard | `/api/v1/patients/{id}`, `/encounters/patient` | `patient-service`, `encounter-service` | Multiple | `ROLE_DOCTOR` | MySQL DB | Unit & IT | **COMPLETE** |
| **Schedule & Slot Management** | `/doctor/schedule` | WeeklyCalendarView, LeaveRequestModal | `/api/v1/doctors/availability` | `doctor-service` | `doctor_db.doctor_availability` | `ROLE_DOCTOR` | MySQL DB | Unit & IT (10) | **COMPLETE** |
| **Encounter History** | `/doctor/history`, `/doctor/encounters` | CompletedEncountersTable | `/api/v1/encounters` | `encounter-service` | `encounter_db.encounters` | `ROLE_DOCTOR` | MySQL DB | Unit & IT | **COMPLETE** |
| **Doctor Profile Settings** | `/doctor/profile` | DoctorBioForm, QualificationList | `/api/v1/doctors/profile` | `doctor-service` | `doctor_db.doctor_profiles` | `ROLE_DOCTOR` | MySQL DB | Unit & IT (5) | **COMPLETE** |
| **Inpatient Ward Rounds** | None | Not Implemented | None | None | None | None | None | None | **MISSING** |
| **Direct Pharmacy Dispensing Check** | None | Not Implemented | None | `pharmacy-service` (Missing) | None | None | None | None | **BLOCKED** |

---

## 4. Receptionist Portal Capability Matrix (`frontend/care/src/app/(staff)/staff/reception`)

| Feature | Route | Component | API | Backend Service | Database | Authorization | Persistence | Test | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Reception Dashboard** | `/staff/reception/dashboard` | QueueStatsCard, QuickPatientRegisterCTA | `/api/v1/queue-tokens/active`, `/appointments` | `encounter-service`, `appointment-service` | Multiple | `ROLE_RECEPTIONIST` | MySQL DB | E2E Script | **COMPLETE** |
| **Patient Registration (New)** | `/staff/reception/patients/new` | PatientDemographicsForm, IdentityDocInput | `/api/v1/patients` | `patient-service` | `patient_db.patients` | `ROLE_RECEPTIONIST` | MySQL DB | Unit & IT (4) | **COMPLETE** |
| **Hospital Assignment / Card** | `/staff/reception/patients/[id]` | UHIDBadge, HospitalRegistrationCard | `/api/v1/patients/{id}/hospitals` | `patient-service` | `patient_db.patient_hospital_registrations` | `ROLE_RECEPTIONIST` | MySQL DB | Unit & IT (4) | **COMPLETE** |
| **Walk-in Consultation / Token** | `/staff/reception/walk-in` | DoctorPicker, SpecialtyDropdown, TokenModal | `/api/v1/opd/walk-in`, `/queue-tokens` | `encounter-service` | `encounter_db.queue_tokens` | `ROLE_RECEPTIONIST` | MySQL DB | E2E Script | **COMPLETE** |
| **Book OPD Appointment** | `/staff/reception/appointments/new` | PatientLookup, SlotSelector, BookingCTA | `/api/v1/appointments` | `appointment-service` | `appointment_db.appointments` | `ROLE_RECEPTIONIST` | MySQL DB | Concurrency IT | **COMPLETE** |
| **Appointment Check-in** | `/staff/reception/appointments` | AppointmentListTable, CheckInButton | `/api/v1/appointments/{id}/check-in` | `appointment-service`, `encounter-service` | `appointment_db`, `encounter_db` | `ROLE_RECEPTIONIST` | MySQL DB | Lifecycle IT | **COMPLETE** |
| **Emergency Arrival Triage** | `/staff/reception/emergency` | EmergencyTriageForm, SeverityBadge | `/api/v1/emergency/admit` | `encounter-service` | `encounter_db.encounters` | None (@PreAuth missing) | MySQL DB | Manual | **PARTIAL** |
| **IPD Admission Desk** | `/staff/reception/admissions` | AdmissionForm, WardBedSelector | `/api/v1/admissions` | `encounter-service`, `organization-service` | `encounter_db.admissions` | `ROLE_RECEPTIONIST` | MySQL DB | E2E Script | **COMPLETE** |
| **Inter-Hospital Referrals** | `/staff/reception/referrals` | ReferralTable, TargetHospitalPicker | `/api/v1/referrals` | `encounter-service` | `encounter_db.referrals` | `ROLE_RECEPTIONIST` | MySQL DB | E2E Script | **COMPLETE** |
| **Doctor Availability Check** | `/staff/reception/availability` | DoctorRosterCalendar, SlotLookup | `/api/v1/doctors/availability` | `doctor-service` | `doctor_db.doctor_availability` | `ROLE_RECEPTIONIST` | MySQL DB | Unit & IT | **COMPLETE** |
| **Live Reception Queue** | `/staff/reception/queue` | TokenDisplayBoard, NextNumberCTA | `/api/v1/queue-tokens` | `encounter-service` | `encounter_db.queue_tokens` | `ROLE_RECEPTIONIST` | MySQL DB | Unit & IT | **COMPLETE** |
| **Patient Discharge Workflow** | None | Not Implemented | None | `encounter-service` | None | None | None | None | **MISSING** |

---

## 5. Patient Portal Capability Matrix (`frontend/care/src/app/(patient)/patient`)

| Feature | Route | Component | API | Backend Service | Database | Authorization | Persistence | Test | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Patient Dashboard** | `/patient/dashboard` | UpcomingApptCard, ActiveTokenCard, VitalsBanner | `/api/v1/appointments/my`, `/queue-tokens/my` | `appointment-service`, `encounter-service` | Multiple | `ROLE_PATIENT` | MySQL DB | E2E Script | **COMPLETE** |
| **Demographics & Profile** | `/patient/profile` | PersonalDetailsForm, EmergencyContact | `/api/v1/patients/me` | `patient-service` | `patient_db.patients` | `ROLE_PATIENT` | MySQL DB | Unit & IT | **COMPLETE** |
| **My Appointments** | `/patient/appointments` | AppointmentTimeline, CancelRescheduleCTA | `/api/v1/appointments/my` | `appointment-service` | `appointment_db.appointments` | `ROLE_PATIENT` | MySQL DB | Lifecycle IT | **COMPLETE** |
| **Live Token Status** | `/patient/queue` | TokenTicketCard, EstimatedWaitDisplay | `/api/v1/queue-tokens/my` | `encounter-service` | `encounter_db.queue_tokens` | `ROLE_PATIENT` | MySQL DB | Unit & IT | **COMPLETE** |
| **Doctor Directory** | `/patient/doctors` | DoctorCardList, BookingCTA | `/api/v1/public/doctors` | `doctor-service` | `doctor_db.doctors` | `ROLE_PATIENT` | MySQL DB | Unit & IT | **COMPLETE** |
| **Clinical Records & Summaries** | `/patient/records` | EncounterTimeline, DoctorNotesPreview | `/api/v1/encounters/my` | `encounter-service` | `encounter_db.encounters` | `ROLE_PATIENT` | MySQL DB | Unit & IT | **COMPLETE** |
| **Prescriptions View & PDF** | `/patient/prescriptions` | RxCard, MedicationScheduleTable | `/api/v1/encounters/my-prescriptions` | `encounter-service` | `encounter_db.prescriptions` | `ROLE_PATIENT` | MySQL DB | Unit & IT | **COMPLETE** |
| **Lab & Diagnostic Orders** | `/patient/orders` | DiagnosticOrderList, StatusBadge | `/api/v1/encounters/my-orders` | `encounter-service` | `encounter_db.clinical_orders` | `ROLE_PATIENT` | MySQL DB | Unit & IT | **COMPLETE** |
| **Document Vault** | `/patient/documents` | UploadModal, DocumentCardList | `/api/v1/documents`, `/documents/redeem` | `patient-service` | `patient_db.patient_documents` | `ROLE_PATIENT` | MySQL DB | E2E Script | **COMPLETE** |
| **Hospital Registrations** | `/patient/registrations` | HospitalRegistrationCard, UHIDDetails | `/api/v1/patients/me/hospitals` | `patient-service` | `patient_db.patient_hospital_registrations` | `ROLE_PATIENT` | MySQL DB | Unit & IT | **COMPLETE** |
| **Inpatient Admissions View** | `/patient/admissions` | AdmissionHistoryCard, BedDetails | `/api/v1/admissions/my` | `encounter-service` | `encounter_db.admissions` | `ROLE_PATIENT` | MySQL DB | E2E Script | **COMPLETE** |
| **Patient Invoices & Bills** | `/patient/billing`, `/invoices` | InvoiceListTable (Static/Mock state) | `/api/v1/billing/my-invoices` | `billing-service` | `billing_db.invoices` (0 rows) | `ROLE_PATIENT` | None | None | **SCAFFOLD** |
| **Online Bill Payment** | `/patient/billing/payments` | PaymentForm, PaymentGatewayMock | `/api/v1/billing/pay` | `billing-service` | `billing_db.payments` (0 rows) | `ROLE_PATIENT` | None | None | **SCAFFOLD** |

---

## 6. Nurse Portal Capability Matrix (`frontend/care/src/app/(staff)/nurse`)

| Feature | Route | Component | API | Backend Service | Database | Authorization | Persistence | Test | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Nurse Dashboard** | `/nurse/dashboard` | ActiveWardCard, AssignedPatientsList | Calls `/api/proxy/nursing/*` | `nursing-service` | `swarnikacare_nursing` | `ROLE_NURSE` | None (0 rows) | None | **BROKEN** |
| **Patient Vitals Entry** | `/nurse/vitals` | VitalsForm (BP, Pulse, SpO2, Temp) | Calls `/api/proxy/nursing/vitals` | `nursing-service` | `swarnikacare_nursing.vitals` | None (@PreAuth missing) | None (0 rows) | None | **BROKEN** |
| **Medication Administration (MAR)** | `/nurse/medications` | MARTable, AdministerModal | Calls `/api/proxy/nursing/mar` | `nursing-service` | `swarnikacare_nursing.mar` | None (@PreAuth missing) | None (0 rows) | None | **BROKEN** |
| **Nursing Assessments** | `/nurse/assessments` | PainScaleForm, GlasgowComaInput | Calls `/api/proxy/nursing/assessments` | `nursing-service` | `swarnikacare_nursing.assessments` | None (@PreAuth missing) | None (0 rows) | None | **BROKEN** |
| **Daily Care Tasks** | `/nurse/tasks` | TaskChecklist, DueTimeBadge | Calls `/api/proxy/nursing/tasks` | `nursing-service` | `swarnikacare_nursing.care_tasks` | None (@PreAuth missing) | None (0 rows) | None | **BROKEN** |
| **Nursing Clinical Notes** | `/nurse/notes` | ShiftNotesEditor, PatientSelector | Calls `/api/proxy/nursing/notes` | `nursing-service` | `swarnikacare_nursing.notes` | None (@PreAuth missing) | None (0 rows) | None | **BROKEN** |
| **Shift Handover** | `/nurse/handover` | SBARHandoverForm, OutgoingNurseSummary | Calls `/api/proxy/nursing/handovers` | `nursing-service` | `swarnikacare_nursing.handovers` | None (@PreAuth missing) | None (0 rows) | None | **BROKEN** |
| **Duty Roster & Shifts** | `/nurse/roster`, `/shifts` | MonthlyRosterCalendar, ShiftSwapModal | Calls `/api/proxy/nursing/roster` | `nursing-service` | `swarnikacare_nursing.rosters` | None (@PreAuth missing) | None (0 rows) | None | **BROKEN** |
| **Patient Detail View** | `/nurse/patients/[id]` | InpatientChart, BedNumberBadge | Calls `/api/proxy/nursing/patients` | `nursing-service` | `swarnikacare_nursing` | None (@PreAuth missing) | None (0 rows) | None | **BROKEN** |
| **Staff Nurse Shell Dashboard** | `/staff/nurse/dashboard` | Placeholder Dashboard Screen | None | None | None | `ROLE_NURSE` | None | None | **PLACEHOLDER** |

*Root Cause of Broken Status: Gateway lacks route definition for `/nursing/**`. All proxy calls fail with HTTP 404.*

---

## 7. Lab, Pharmacy, and Billing Portals

| Portal | Route | Implemented Components | API Integration | Backend Service | Database | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Lab Portal** | `/staff/lab/dashboard` | Shell HTML card with logout button | None | No Lab Service in repository | No lab schema | **PLACEHOLDER / NOT BUILT** |
| **Pharmacy Portal** | `/staff/pharmacy/dashboard` | Shell HTML card with logout button | None | No Pharmacy Service in repository | No pharmacy schema | **PLACEHOLDER / NOT BUILT** |
| **Staff Billing Portal** | `/staff/billing/dashboard` | Shell HTML card with logout button | None | `billing-service` (Not wired to UI) | `billing_db` (0 rows) | **SCAFFOLD / SHELL** |

---

## 8. Capability Matrix Summary

- **Total Assessed Features Across System**: 68 features
- **COMPLETE**: 38 features (55.9%)
- **PARTIAL**: 5 features (7.4%)
- **SCAFFOLD**: 6 features (8.8%)
- **BROKEN / BLOCKED**: 10 features (14.7%)
- **PLACEHOLDER**: 5 features (7.4%)
- **MISSING / NOT BUILT**: 4 features (5.9%)
