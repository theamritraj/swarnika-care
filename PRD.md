# Swarnika Care — Product Requirements Document

## 1. Product Overview

Swarnika Care is an enterprise-grade, multi-hospital Hospital Information System (HIS/HMS) designed to digitally manage hospital operations, patient journeys, doctors, staff workflows, appointments, clinical workflows, billing, communication, administration, and public hospital information.

The product consists of two primary frontend experiences:

1. Swarnika Hospitals Public Website
2. Swarnika Care authenticated operational portal

The system is designed as a modular, multi-hospital platform where hospitals, departments, doctors, staff, patients, and operational workflows can coexist while maintaining clear domain ownership.

---

# 2. Product Vision

Build a scalable digital hospital operating platform where:

- Patients can discover hospitals and doctors.
- Patients can book and manage appointments.
- Doctors can manage appointments and clinical workflows.
- Nurses can manage nursing workflows.
- Reception staff can manage front-desk operations.
- Laboratory staff can manage laboratory workflows.
- Pharmacists can manage pharmacy workflows.
- Billing staff can manage billing operations.
- Hospital administrators can manage their hospital.
- Super administrators can manage the overall platform.
- Public hospital information can be safely published without exposing internal operational data.

The long-term goal is to support multiple hospitals and hospital branches from one platform.

---

# 3. Product Goals

## Primary Goals

- Multi-hospital support
- Centralized identity and access management
- Role-based workflows
- Hospital and department management
- Doctor management
- Patient management
- Appointment management
- Public doctor discovery
- Public hospital discovery
- Clinical workflow support
- Billing
- Laboratory
- Pharmacy
- Notifications
- Reporting
- Auditability
- Secure service architecture
- Scalable microservice architecture

## Secondary Goals

- Mobile-friendly Care experience
- Event-driven workflows
- Analytics
- Operational dashboards
- Future telemedicine support
- Future insurance workflows

---

# 4. Non-Goals

The platform should not:

- Give every user administrative privileges.
- Allow public users to create privileged accounts.
- Store medical information in authentication tokens.
- Allow public APIs to expose internal administrative data.
- Couple all domains through shared databases.
- Create separate frontend applications unnecessarily for every role.
- Treat future features as implemented features.

---

# 5. User Types

## Platform Users

- SUPER_ADMIN

## Hospital Management

- HOSPITAL_ADMIN
- OPERATIONS_MANAGER

## Clinical Users

- DOCTOR
- NURSE

## Operational Users

- FRONT_DESK_MANAGER
- RECEPTIONIST
- LAB_TECHNICIAN
- PHARMACIST
- BILLING_STAFF

## Patients

- PATIENT

## Future Roles

- HR_MANAGER
- INVENTORY_MANAGER
- INSURANCE_EXECUTIVE
- MEDICAL_RECORDS_STAFF

Future roles must not be implemented merely because they appear in this document.

---

# 6. Hospital Organization Model

The core organization hierarchy is:

Hospital
  |
  +-- Departments
  |      |
  |      +-- Doctors
  |
  +-- Staff
         |
         +-- Reception
         +-- Nursing
         +-- Laboratory
         +-- Pharmacy
         +-- Billing

A doctor may potentially work across multiple hospital locations.

A doctor-to-hospital relationship is therefore represented as an assignment rather than assuming a doctor belongs permanently to only one hospital.

---

# 7. Administrative Model

## SUPER_ADMIN

Platform-level responsibilities:

- Create hospitals
- Configure platform
- Assign hospital administrators
- Manage platform-level users
- Manage global roles and permissions
- View platform-level reports
- View audit information

SUPER_ADMIN should not perform daily reception, nursing, laboratory, pharmacy, or billing operations.

## HOSPITAL_ADMIN

Hospital-level responsibilities:

- Manage hospital information
- Manage departments
- Manage doctors
- Manage hospital staff
- Configure hospital-specific settings
- Manage hospital operational configuration

## OPERATIONS_MANAGER

Operational responsibilities:

- Daily hospital operations
- Front desk coordination
- Appointment operations
- Schedule coordination
- Staff coordination
- Operational dashboards

---

# 8. Patient Product

Patients should eventually be able to:

- Register using email
- Authenticate using OTP
- Manage profile
- Search hospitals
- Search doctors
- View doctor profiles
- View doctor availability
- Book appointments
- Reschedule appointments
- Cancel appointments
- View appointment history
- View prescriptions
- View laboratory reports
- View bills
- View payment information
- Receive notifications
- Manage family members
- View medical records according to authorization

---

# 9. Doctor Product

Doctors should eventually be able to:

- Login securely
- View dashboard
- View appointments
- View assigned patients
- View patient information according to permissions
- Conduct consultations
- Create prescriptions
- Order laboratory investigations
- Manage availability
- View notifications
- Maintain professional profile
- Manage hospital assignments where authorized

---

# 10. Reception Product

Reception staff should eventually be able to:

- Register patients
- Search patients
- Create appointments
- Reschedule appointments
- Cancel appointments
- Check appointment schedules
- Manage check-in
- Manage front-desk workflows
- Collect or initiate permitted payments

Reception staff should not access unrestricted clinical or administrative data.

---

# 11. Nursing Product

Nurses should eventually be able to:

- View assigned patients
- View relevant clinical information
- Manage nursing workflows
- Record nursing observations
- Manage assigned tasks
- Support inpatient workflows

Access must follow authorization rules.

---

# 12. Laboratory Product

Laboratory staff should eventually be able to:

- View lab orders
- Manage sample workflows
- Update investigation status
- Upload/report results
- Publish reports to authorized users

---

# 13. Pharmacy Product

Pharmacy staff should eventually be able to:

- View prescriptions
- Manage medication dispensing
- Track inventory
- Process pharmacy orders
- Maintain medication-related operational records

---

# 14. Billing Product

Billing should be a domain-level capability.

Expected future capabilities include:

- Invoice
- Invoice items
- Payments
- Payment methods
- Receipts
- Refunds
- Credit notes
- Discounts
- Taxes
- Insurance claims

Role-specific access:

Patient:
- Own bills
- Own payments
- Own receipts

Reception:
- Limited payment collection capabilities

Billing Staff:
- Full billing operations

Doctor:
- Limited billing information where necessary

Admin:
- Oversight and configuration

---

# 15. Public Website

The public website should provide:

- Hospital directory
- Hospital details
- Department information
- Doctor directory
- Doctor profiles
- Services
- Facilities
- Contact information
- Appointment discovery

Public website data must come through dedicated public APIs.

The public website must not directly consume administrative database tables.

---

# 16. Doctor Public Profile

A doctor may have:

- Name
- Professional title
- Profile photo
- Qualifications
- Registration information
- Specialty
- Experience
- Expertise
- Consultation fee
- Hospital/location
- Department
- Availability
- Public biography

Public profile publication states:

DRAFT
REVIEW
APPROVED
PUBLISHED

Only PUBLISHED profiles should be visible through public doctor APIs.

Operational status and public publication status are separate concepts.

---

# 17. Authentication

Authentication is owned by IAM.

Current authentication direction:

- Email
- OTP
- JWT
- Role-based authorization
- Permission-based authorization

Patients can self-register.

Privileged users such as doctors and staff should be provisioned by authorized administrators.

Users should never choose a privileged role during public registration.

---

# 18. Authorization

Authorization uses:

- Roles
- Permissions
- Object-level access rules

Roles are not assumed to be hierarchical.

Backend authorization is authoritative.

Frontend permission checks exist only for UI visibility and user experience.

---

# 19. Current Product Status

The following areas have been structurally implemented or are under active development.

Current platform services include:

- API Gateway
- IAM Service
- Patient Service
- Doctor Service
- Appointment Service
- Notification Service
- Organization Service
- Eureka / Service Registry

The exact implementation status must be verified against the repository.

---

# 20. Current Doctor Vertical

The current doctor vertical is designed as:

Hospital
  ↓
Department
  ↓
Doctor
  ├── DoctorProfile
  ├── DoctorHospitalAssignment
  └── DoctorAvailability

Doctor identity:

IAM User
  ↓
userId
  ↓
Doctor.userId

Doctor provisioning communicates with IAM through an internal service-to-service API.

---

# 21. Future Modules

Future domains may include:

- Billing Service
- Insurance Service
- Pharmacy Service
- Laboratory Service
- EHR / Clinical Records Service
- Audit Service
- Reporting / Analytics Service
- Telemedicine
- Inventory
- HR
- Search

These are future roadmap items unless verified as implemented.

---

# 22. Non-Functional Requirements

The platform should be:

- Secure
- Scalable
- Maintainable
- Observable
- Highly available where required
- Auditable
- Multi-hospital capable
- Responsive
- Accessible
- Testable

---

# 23. Product Success Criteria

The system should eventually support a complete hospital workflow:

Public Website
    ↓
Doctor Discovery
    ↓
Patient Authentication
    ↓
Appointment Booking
    ↓
Doctor Consultation
    ↓
Prescription / Lab
    ↓
Pharmacy / Billing
    ↓
Notifications
    ↓
Reports / Audit

## Workforce Foundation
- IMPLEMENTED: Employee, Designation, and Position in organization-service.
- [x] Phase 3 Appointments Foundation
