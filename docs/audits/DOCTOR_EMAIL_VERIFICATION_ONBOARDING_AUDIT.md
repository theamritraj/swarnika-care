# DOCTOR EMAIL VERIFICATION + ONBOARDING WELCOME EMAIL AUDIT

**Date:** 2026-09-27  
**Project:** Swarnika Care / Swarnika Hospitals  
**Status:** AUDIT COMPLETE (PHASE 0)  

---

## 1. Executive Summary

This audit assesses the readiness of Swarnika Care's distributed architecture (IAM Service, Doctor Service, Organization Service, Notification Service, API Gateway, and Care BFF) to support **Secure Doctor Email Verification + Onboarding Welcome Email**.

The goal is to ensure a doctor cannot be created or activated without email OTP verification, that no credentials or sensitive URLs leak to the UI, and that a formal Welcome Email is dispatched via Notification Service upon successful onboarding.

---

## 2. Component-by-Component Inspection & Status

| # | Inspection Item | Component / Location | Current Implementation Assessment | Status |
|---|---|---|---|:---:|
| 1 | **Admin Doctor Onboarding Page** | `frontend/care/src/app/admin/doctors/new/page.tsx` | Four structured sections (Personal, Profile, Hospital Assignment, Engagement). Form directly creates doctor without email OTP verification modal. | **PARTIAL** |
| 2 | **DoctorCreateRequest** | `doctor-service` (`DoctorCreateRequest.java`) | Clean Jakarta-validated DTO (`firstName`, `lastName`, `email`, `phone`, `gender`, `dateOfBirth`). | **PASS** |
| 3 | **Doctor Provisioning Flow** | `doctor-service` (`DoctorServiceImpl.java`) | Eagerly provisions IAM user, then saves Doctor entity with compensation rollback. Does not wait for email OTP verification. | **PARTIAL** |
| 4 | **IAM Doctor Provisioning API** | `iam-service` (`InternalUserController.java`) | Exposes `POST /api/v1/internal/users/provision-doctor`. Creates user with `UserStatus.ACTIVE` immediately. | **PARTIAL** |
| 5 | **IAM User Entity** | `iam-service` (`User.java`) | Entity has `emailVerified` (boolean) and `status` (`UserStatus.PENDING`, `ACTIVE`, `INACTIVE`, `LOCKED`). Full foundational support is present. | **PASS** |
| 6 | **IAM OTP Implementation** | `iam-service` (`OtpServiceImpl.java`) | Cryptographically secure `SecureRandom`, BCrypt hashed storage, 60s resend cooldown, 3-attempt cap, 5-minute expiry. | **PASS** |
| 7 | **OTP Persistence** | `iam-service` (`OtpVerification.java`) | Persistent JPA entity `otp_verifications` tracking `email`, `otpHash`, `purpose`, `expiresAt`, `attemptCount`, `consumedAt`. | **PASS** |
| 8 | **OTP Verification** | `iam-service` (`OtpServiceImpl.java`) | Full validation logic with attempt incrementing and immediate consumption on success. | **PASS** |
| 9 | **User Status Lifecycle** | `iam-service` (`UserStatus.java`, `AuthServiceImpl.java`) | Enum supports `PENDING`. However, `AuthServiceImpl.verifyOtp()` does not explicitly reject login for `PENDING` accounts. | **PARTIAL** |
| 10 | **Doctor Service Core** | `doctor-service` (:8082) | Manages core doctors, profiles, hospital assignments, and availability slots. 28 tests passing. | **PASS** |
| 11 | **Organization Service** | `organization-service` (:8085) | Authoritative source for Hospitals (101, 102) and Departments (101, 102). | **PASS** |
| 12 | **Notification Service** | `notification-service` (:8084) | Configured with live Gmail SMTP (`swarnikahospitals@gmail.com`), Thymeleaf engine, and Kafka listener. | **PARTIAL** |
| 13 | **Notification Outbox / Event System** | `notification-service` (`notification_events`), `appointment-service` | `notification_events` provides event deduplication/idempotency. `doctor-service` does not yet publish `DoctorOnboardingCompletedEvent`. | **PARTIAL** |
| 14 | **Existing Email Sender** | `iam-service` & `notification-service` | `JavaMailSender` configured. Plaintext OTP logging in `iam-service`'s `EmailSenderImpl` must be sanitized. | **PASS** |
| 15 | **Existing Email Templates** | `notification-service/src/main/resources/templates` | Only `appointment-confirmation.html` exists. No `doctor-welcome.html` template. | **MISSING** |
| 16 | **API Gateway** | `api-gateway` (:8080) | Properly routes `/api/v1/auth/**`, `/api/v1/doctors/**`, `/api/v1/hospitals/**`, `/api/v1/departments/**`. | **PASS** |
| 17 | **Care BFF** | `frontend/care/src/app/api/proxy` | Provides cookie-based HttpOnly session proxying with security headers. | **PASS** |
| 18 | **Existing Service Tests** | Backend test suites | 28 tests pass in `doctor-service`, full test suite in `iam-service`. | **PASS** |
| 19 | **Existing Doctor E2E Tests** | `test_phase2_doctors_ui.py`, `test_step5_phase1_e2e.py` | Python E2E suites verifying super-admin doctor directory and permissions. | **PASS** |

---

## 3. Specific Architectural Determinations

1. **Does OTP already support email verification?**
   - **YES**. `OtpService` in `iam-service` supports `generateAndSendOtp` and `verifyOtp` with purpose-based segregation (`LOGIN`, `REGISTRATION`, `INVITATION`).
2. **Is IAM user created before verification?**
   - Currently, **YES** (eagerly during `POST /api/v1/doctors`). The target design will introduce a dedicated onboarding email verification lifecycle so accounts are either created in `PENDING` state or activated only upon successful OTP verification.
3. **Can IAM user be provisioned in PENDING state?**
   - **YES**. `UserStatus.PENDING` is already an enum constant in `UserStatus.java`. `UserServiceImpl.createDoctor` can accept an initial status of `PENDING` and switch to `ACTIVE` upon verification.
4. **Does Notification Service already support transactional emails?**
   - **YES**. It has Thymeleaf integration and active Gmail SMTP credentials.
5. **Does outbox/event publishing already exist?**
   - **PARTIAL**. Exists in `appointment-service` via `outbox_events` and Kafka. `doctor-service` will be equipped with event publishing and a resilient REST/Kafka notification client with failure isolation.
6. **Do existing welcome emails exist?**
   - **MISSING**. No welcome email is currently sent to newly onboarded doctors.
7. **Do existing email templates exist for doctor onboarding?**
   - **MISSING**. Need `templates/doctor-welcome.html` in `notification-service`.

---

## 4. Remediation Plan by Phase

1. **Phase 1-3 (Backend Lifecycle & IAM Pending State)**:
   - Enhance `iam-service` to support initiating doctor email verification OTP (`OtpPurpose.REGISTRATION` or `INVITATION`).
   - Guard `AuthServiceImpl.verifyOtp()` so `PENDING` users cannot authenticate or obtain a JWT until onboarding completes.
   - Update `doctor-service` onboarding APIs to orchestrate OTP initiation and verification.
2. **Phase 4-6 (Admin UI OTP Modal & Duplicate Protection)**:
   - Update `/admin/doctors/new/page.tsx` with clean 6-digit OTP verification modal, 60s cooldown timer, resend functionality, and error handling.
   - Pre-check duplicate emails gracefully.
3. **Phase 7-9 (Atomic Provisioning & Completion State)**:
   - On valid OTP, activate IAM user to `ACTIVE`, save Doctor, DoctorProfile, and DoctorHospitalAssignment.
   - Maintain full rollback compensation.
4. **Phase 10-15 (Notification Service Welcome Email & Idempotency)**:
   - Create Thymeleaf template `doctor-welcome.html` with hospital and department variables.
   - Provide REST & Kafka consumption in `notification-service` with `NotificationEvent` idempotency check.
   - Ensure SMTP/provider errors are isolated and do not roll back successful doctor creation.
5. **Phase 16-37 (E2E Verification & Regression)**:
   - Comprehensive test suite, golden path verification, and production build (`npm run build`).
