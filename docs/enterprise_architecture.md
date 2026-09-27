# Enterprise Hospital Management System Architecture & Workflow (Fortis/Apollo Standard)

Building an enterprise-grade hospital management system similar to Fortis or Apollo requires scaling beyond basic appointment booking. It involves handling end-to-end hospital operations, strict data security, and seamless user experiences for different roles (Patients, Doctors, Staff, and Superadmin).

## 1. Core User Portals & Workflows

### A. Patient Portal
In enterprise systems, patients have a comprehensive dashboard to manage their entire healthcare lifecycle.
* **Authentication & Profiles:** Secure login with OTP/MFA. Complete patient demographics and insurance details.
* **Appointment Booking & Management:** Real-time doctor availability, tele-consultation vs. in-person options, reminders, and easy rescheduling/cancellations.
* **Electronic Health Records (EHR):** Patients can view past consultation summaries, digital prescriptions, and treatment plans.
* **Lab Reports & Diagnostics:** Direct integration with the lab system to view and download test results (Pathology/Radiology).
* **Billing & Payments:** Consolidated view of invoices, advance payments, and insurance claims processing.

### B. Doctor Portal
Doctors need an optimized, distraction-free interface to manage high patient volumes.
* **Dashboard & Schedule Management:** Calendar view of today's appointments, prioritized by urgency (OPD, IPD rounds, Surgeries). Ability to block calendars for leaves or emergencies.
* **Patient History (EHR Access):** Before consulting, doctors can view the patient's complete medical history, previous treatments, allergies, and past reports in a single timeline view.
* **E-Prescription & Treatment Plans:** Digital tools to quickly prescribe medicines (integrated with pharmacy inventory), order lab tests, and write clinical notes.
* **Tele-consultation Hub:** Integrated video calling and chat for online follow-ups.

### C. Superadmin / Hospital Admin Portal
Centralized control for hospital operations and staff management.
* **Staff Onboarding:** Create profiles for Doctors, Nurses, Receptionists, and support staff. 
* **Role-Based Access Control (RBAC):** Strict permission mapping (e.g., a receptionist can book appointments but cannot view medical reports; a nurse can view reports but cannot prescribe medication).
* **Department & Facility Management:** Managing hospital branches, wards, beds, and operating theaters.
* **Analytics & Reporting:** High-level dashboards showing hospital revenue, daily footfall, doctor performance, and bed occupancy rates.

## 2. Recommended Microservices Architecture

To achieve this, we will expand our existing 4 microservices into a more robust ecosystem:

1. **Patient Service:** Manages patient profiles, medical history links, and demographics.
2. **Doctor Service:** Manages doctor profiles, specializations, schedules, and leave management.
3. **Appointment Service:** Handles booking logic, queues, and scheduling algorithms.
4. **Identity & Access Management (IAM) / Superadmin Service:** Centralized authentication (JWT/OAuth2), RBAC, and staff onboarding.
5. **Electronic Health Records (EHR) Service:** Secure storage of consultation notes, prescriptions, and historical medical data.
6. **Billing & Insurance Service:** Invoicing, payment gateway integration, and insurance claim workflows.
7. **Lab & Pharmacy Service:** Managing diagnostic test orders, report generation, and pharmacy inventory.
8. **Notification Service (Kafka Driven):** SMS, Email, and Push notifications for OTPs, appointment reminders, and report readiness.

## 3. Enterprise Tech Stack & Characteristics

To make the system truly "Enterprise-Level":
* **Security & Compliance:** 
  * Data encryption at rest and in transit.
  * Audit logs for every action (e.g., tracking exactly who viewed a patient's medical record and when).
  * Compliance with health data regulations (like HIPAA/ABDM in India).
* **Scalability:** 
  * Event-driven architecture using **Apache Kafka** (e.g., when a doctor writes a prescription, an event is sent to the Pharmacy Service automatically).
  * **Redis Caching** for fast retrieval of doctor lists and available slots.
* **API Gateway & Service Discovery:** Using Spring Cloud Gateway and Eureka for centralized routing, rate limiting, and load balancing.
* **Observability:** Distributed tracing (Zipkin) and centralized logging (ELK Stack) to quickly diagnose failures in any microservice.

---
**Next Steps for Swarnika Care:**
1. Finalize database schemas for the new Superadmin and EHR structures.
2. Implement robust RBAC (Role-Based Access Control) using Spring Security.
3. Design the UI wireframes for the Doctor Dashboard and Superadmin panel.
### Architectural Decisions
- Removed Lombok from Patient service and replaced with explicit getters/setters/constructors to avoid JDK 21+ compiler compatibility issues (TypeTag :: UNKNOWN).
- Doctor Service: Refactored to layered architecture and removed Lombok. Introduced basic `DoctorAvailability` model as part of the Doctor domain context to prevent database coupling with Appointment Service.
- Appointment Service: Upgraded to a Booking Engine. Utilizes Spring Cloud OpenFeign for inter-service communication (checking Patient & Doctor Availability) to maintain database boundary integrity. Handles overlap double-booking scenarios using explicit timestamp comparison.
- Appointment Service: Upgraded to a Booking Engine. Utilizes Spring Cloud OpenFeign for inter-service communication (checking Patient & Doctor Availability) to maintain database boundary integrity. Handles overlap double-booking scenarios using explicit timestamp comparison.
