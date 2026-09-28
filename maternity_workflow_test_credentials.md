# Swarnika Care: Maternity & IPD Testing Credentials

The system has been seeded with internal staff credentials. The OTP delivery system has been modified for local testing to print the Secure OTP directly into your terminal logs.

## 🔐 Dummy Credentials

You can use the following emails to log in to their respective portals:

| Role | Email | Portal Usage |
|---|---|---|
| **Super Admin** | `admin@swarnikacare.com` | Setup Hospital, Add Doctors, Add Nurses |
| **Receptionist** | `frontdesk@swarnikacare.com` | Patient Registration, OPD Booking, IPD Check-in |
| **Doctor** | `dr.maternity@swarnikacare.com` | Consultations, Prescriptions, IPD Rounds, Discharges |
| **Nurse** | `nurse.jane@swarnikacare.com` | Daily Nursing Report, Vitals, Shift Roster |

## 🚀 How to Log In (Bypass Email)

Since we are running locally without a real SMTP server configured, I have overridden the `EmailSender` to print the OTP.

1. Open your browser and navigate to the frontend portal (e.g., `http://localhost:3000`).
2. Enter one of the emails above (e.g., `frontdesk@swarnikacare.com`) and click **Send OTP**.
3. Open your IDE terminal where `start_all.sh` or `iam-service` is running.
4. Look for the highlighted logs in `iam-service` output:
   ```text
   =============================================
   🚀 YOUR LOCAL DEVELOPMENT OTP IS: 123456
   =============================================
   ```
5. Enter that 6-digit number into the UI to log in successfully.

## 📋 Recommended Maternity Workflow Test

As requested, you can now manually test the complete Swarnika Bloom Maternity flow:

1. **Receptionist**: Register a pregnant mother.
2. **Receptionist**: Book an OPD Appointment.
3. **Doctor**: Conduct consultation and recommend IPD Maternity Admission.
4. **Receptionist**: Open an IPD Encounter and allocate a Bed.
5. **Nurse**: Record Vitals and Care Tasks in the Daily Nursing Report.
6. **Receptionist**: After birth, register the newborn twins as **two separate patients**.
7. **Receptionist**: Link the babies to the mother using the `MOTHER_OF` relationship in the system.
8. **Billing**: Open distinct invoices for the Mother, Child 1, and Child 2.
9. **Doctor**: Finalize rounds and execute **Discharge**.
10. **Billing**: Clear invoices to generate the final Release Gate Pass.

The backend fully supports these entity relationships, role isolations, and distinct billing models. Happy testing!
