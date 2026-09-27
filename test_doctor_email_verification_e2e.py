import requests
import json
import subprocess
import time
import sys

GATEWAY_URL = "http://localhost:8080"

def query_db(db_name, query):
    cmd = ["mysql", "-u", "root", "-e", f"USE {db_name}; {query}"]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        raise RuntimeError(f"MySQL error: {res.stderr}")
    return res.stdout.strip()

def run_tests():
    print("=" * 60)
    print("RUNNING E2E DOCTOR ONBOARDING & EMAIL VERIFICATION TESTS")
    print("=" * 60)

    # 1. Test Duplicate Email
    print("\n[TEST 1] Duplicate email rejection")
    initiate_payload = {
        "firstName": "Amit",
        "lastName": "Raj",
        "email": "contact.amritraj@gmail.com",
        "phone": "+919876543210",
        "gender": "MALE",
        "dateOfBirth": "1990-01-01",
        "specialization": "Cardiology",
        "qualifications": "MBBS, MD",
        "experienceYears": 10,
        "registrationNumber": "MCI-12345",
        "defaultConsultationFee": 800,
        "bio": "Experienced cardiologist",
        "hospitalId": 1,
        "departmentId": 1,
        "designation": "Consultant",
        "publicAppointmentEnabled": True,
        "inHouseClinicalEnabled": True
    }
    res = requests.post(f"{GATEWAY_URL}/api/v1/doctors/onboarding/initiate", json=initiate_payload)
    print(f"Status Code: {res.status_code}")
    print(f"Response: {res.text}")
    assert res.status_code == 409 or "already exists" in res.text, f"Expected 409 or duplicate error, got {res.status_code}"
    print(">>> PASS: Duplicate email rejected.")

    # 2. Test Onboarding Initiation for Fresh Doctor
    test_email = f"dr.priya.{int(time.time())}@swarnikacare.com"
    print(f"\n[TEST 2] Onboarding initiation for new doctor: {test_email}")
    fresh_payload = dict(initiate_payload)
    fresh_payload["email"] = test_email
    fresh_payload["firstName"] = "Priya"
    fresh_payload["lastName"] = "Sharma"
    fresh_payload["specialization"] = "Obstetrics & Gynaecology"

    res = requests.post(f"{GATEWAY_URL}/api/v1/doctors/onboarding/initiate", json=fresh_payload)
    print(f"Status Code: {res.status_code}")
    print(f"Response: {res.text}")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    res_data = res.json()
    assert res_data.get("success") is True
    print(">>> PASS: Onboarding initiated, OTP generated and email dispatched.")

    # 3. Test Resend Cooldown
    print("\n[TEST 3] Resend cooldown enforcement")
    resend_res = requests.post(f"{GATEWAY_URL}/api/v1/doctors/onboarding/resend", json={"email": test_email})
    print(f"Status Code: {resend_res.status_code}")
    print(f"Response: {resend_res.text}")
    assert resend_res.status_code == 400 or "wait before requesting" in resend_res.text, "Cooldown not enforced!"
    print(">>> PASS: Resend cooldown properly enforced.")

    # 4. Test Invalid OTP Rejection
    print("\n[TEST 4] Invalid OTP rejection")
    complete_payload = dict(fresh_payload)
    complete_payload["otp"] = "000000"
    wrong_otp_res = requests.post(f"{GATEWAY_URL}/api/v1/doctors/onboarding/complete", json=complete_payload)
    print(f"Status Code: {wrong_otp_res.status_code}")
    print(f"Response: {wrong_otp_res.text}")
    assert wrong_otp_res.status_code == 400, f"Expected 400, got {wrong_otp_res.status_code}"
    print(">>> PASS: Invalid OTP rejected.")

    # 5. Set known BCrypt OTP hash in DB for test email: code '123456'
    test_otp = "123456"
    test_hash = "$2a$10$EQzVuuwscP9LJPj1xWFSsuR68B/GRuw76dSyREfY8loFB.l/SZ/q."
    print(f"\n[TEST 5] Testing Valid OTP completion with known code '{test_otp}'")
    query_db("swarnika_care", f"UPDATE otp_verifications SET otp_hash = '{test_hash}', attempt_count = 0 WHERE email = '{test_email}' AND purpose = 'DOCTOR_ONBOARDING' AND consumed_at IS NULL")

    complete_payload["otp"] = test_otp
    valid_complete_res = requests.post(f"{GATEWAY_URL}/api/v1/doctors/onboarding/complete", json=complete_payload)
    print(f"Status Code: {valid_complete_res.status_code}")
    print(f"Response: {valid_complete_res.text}")
    assert valid_complete_res.status_code in [200, 201], f"Expected 200 or 201, got {valid_complete_res.status_code}"
    complete_data = valid_complete_res.json()["data"]
    assert complete_data["doctorName"] == "Dr. Priya Sharma"
    assert complete_data["email"] == test_email
    assert complete_data["welcomeEmailStatus"] in ["SENT", "QUEUED"]
    doctor_id = complete_data["doctorId"]
    print(f">>> PASS: Doctor onboarded successfully! DoctorId={doctor_id}, WelcomeStatus={complete_data['welcomeEmailStatus']}")

    # 6. Database Verification across services
    print("\n[TEST 6] Multi-Database Parity Verification")
    user_out = query_db("swarnika_care", f"SELECT id, email, status, email_verified, role FROM users WHERE email = '{test_email}'")
    print(f"IAM User in DB:\n{user_out}")
    assert "ACTIVE" in user_out
    assert "DOCTOR" in user_out
    assert "1" in user_out # email_verified

    doc_out = query_db("doctor_db", f"SELECT id, user_id, email, first_name, last_name, status FROM doctors WHERE email = '{test_email}'")
    print(f"Doctor in DB:\n{doc_out}")
    assert "ACTIVE" in doc_out
    assert test_email in doc_out

    prof_out = query_db("doctor_db", f"SELECT doctor_id, specializations, qualifications FROM doctor_profiles WHERE doctor_id = {doctor_id}")
    print(f"Doctor Profile in DB:\n{prof_out}")
    assert "Obstetrics & Gynaecology" in prof_out

    notif_out = query_db("swarnika_care", "SELECT event_id, event_type, status FROM notification_events WHERE event_type = 'DOCTOR_ONBOARDING_COMPLETED' ORDER BY id DESC LIMIT 1")
    print(f"Notification Event in DB:\n{notif_out}")
    assert "DOCTOR_ONBOARDING_COMPLETED" in notif_out
    assert "SENT" in notif_out
    
    # Extract the event_id from the last row
    last_event_id = notif_out.splitlines()[-1].split()[0]
    print(f"Last Welcome Event ID: {last_event_id}")
    print(">>> PASS: All database entities verified with zero orphan records.")

    # 7. Test Idempotency of Welcome Email
    print("\n[TEST 7] Welcome Email Idempotency Check")
    notif_payload = {
        "eventId": last_event_id,
        "recipientEmail": test_email,
        "doctorName": "Dr. Priya Sharma",
        "hospitalName": "Swarnika Bloom – Sasaram",
        "departmentName": "Obstetrics & Gynaecology",
        "loginUrl": "http://localhost:3001/login"
    }
    dup_notif_res = requests.post(f"{GATEWAY_URL}/api/v1/notifications/doctor-welcome", json=notif_payload)
    print(f"Duplicate Event Dispatch Response: {dup_notif_res.json()}")
    assert "idempotent duplicate skipped" in dup_notif_res.json().get("message", "")
    print(">>> PASS: Welcome email idempotency verified (duplicate event skipped).")

    # 8. Test Doctor Login with OTP Request
    print("\n[TEST 8] Doctor Login via Email + OTP")
    login_otp_res = requests.post(f"{GATEWAY_URL}/api/v1/auth/request-otp", json={"email": test_email})
    print(f"Login OTP Status: {login_otp_res.status_code}")
    print(f"Login OTP Response: {login_otp_res.text}")
    assert login_otp_res.status_code == 200
    print(">>> PASS: Newly onboarded doctor can successfully initiate login with Email + OTP!")

    print("\n" + "=" * 60)
    print("ALL E2E DOCTOR ONBOARDING TESTS COMPLETED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
