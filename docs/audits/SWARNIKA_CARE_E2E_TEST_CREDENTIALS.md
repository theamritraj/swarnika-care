# SWARNIKA CARE E2E TEST CREDENTIALS

==================================================
ACCOUNT         | EMAIL                           | ROLE           | HOSPITAL                | OTP METHOD         | USER ID | PURPOSE
==================================================
SUPER ADMIN     | e2e.admin@swarnikacare.test     | SUPER_ADMIN    | Swarnika Bloom E2E 2026 | Logged Secure OTP | 101     | Hospital Setup
DOCTOR          | e2e.doctor@swarnikacare.test    | DOCTOR         | Swarnika Bloom E2E 2026 | Logged Secure OTP | 102     | Clinical Encounters
DOCTOR 2        | e2e.doctor2@swarnikacare.test   | DOCTOR         | Swarnika Bloom E2E 2026 | Logged Secure OTP | 103     | Security Isolation
NURSE 1         | e2e.nurse1@swarnikacare.test    | NURSE          | Swarnika Bloom E2E 2026 | Logged Secure OTP | 104     | Daily Nursing Report
NURSE 2         | e2e.nurse2@swarnikacare.test    | NURSE          | Swarnika Bloom E2E 2026 | Logged Secure OTP | 105     | Daily Nursing Report
RECEPTION       | e2e.reception@swarnikacare.test | RECEPTIONIST   | Swarnika Bloom E2E 2026 | Logged Secure OTP | 106     | Patient Intake
LAB TECH        | e2e.labtech@swarnikacare.test   | LAB_TECHNICIAN | Swarnika Bloom E2E 2026 | Logged Secure OTP | 107     | Internal Lab Processing
BILLING         | e2e.billing@swarnikacare.test   | BILLING_STAFF  | Swarnika Bloom E2E 2026 | Logged Secure OTP | 108     | Invoicing

*Note: OTP is intercepted locally by the `EmailSenderImpl` and printed to the terminal console (`iam-service`) rather than sending a real email via AWS SES / Mailtrap, preventing spam during E2E.*
