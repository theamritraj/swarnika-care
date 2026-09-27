#!/usr/bin/env python3
"""
Swarnika Care - Super Admin Dashboard E2E Verification
Verifies:
1. Route protection (unauthenticated -> /login redirect)
2. Authenticated Super Admin live metrics rendering
3. Removal of fake Pending Bills and mock placeholders
4. Integration with Patient, Doctor, Appointment, Organization, and Encounter microservices
"""

import requests
import base64
import time
import json
import hmac
import hashlib
import re

CARE_PORTAL_URL = "http://localhost:3001"
JWT_SECRET_B64 = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970"
JWT_SECRET = base64.b64decode(JWT_SECRET_B64)

def b64url(b): 
    return base64.urlsafe_b64encode(b).decode('utf-8').rstrip('=')

def create_super_admin_jwt():
    header = {"alg": "HS256", "typ": "JWT"}
    now = int(time.time())
    payload = {
        "sub": "admin@swarnikacare.com",
        "iss": "swarnika-iam",
        "aud": "swarnika-care",
        "roles": ["SUPER_ADMIN"],
        "permissions": ["HOSPITAL_VIEW", "PATIENT_VIEW", "DOCTOR_VIEW", "APPOINTMENT_VIEW", "ENCOUNTER_VIEW"],
        "iat": now,
        "exp": now + 7200
    }
    h = b64url(json.dumps(header).encode('utf-8'))
    p = b64url(json.dumps(payload).encode('utf-8'))
    sig = b64url(hmac.new(JWT_SECRET, f"{h}.{p}".encode('utf-8'), hashlib.sha256).digest())
    return f"{h}.{p}.{sig}"

def main():
    print("\n=======================================================")
    print("  SUPER ADMIN DASHBOARD (STEP 1) LIVE VERIFICATION")
    print("=======================================================")

    # 1. Unauthenticated Protection
    print("  1. Verifying unauthenticated route protection...")
    resp_unauth = requests.get(f"{CARE_PORTAL_URL}/admin", allow_redirects=False)
    assert resp_unauth.status_code in [307, 302, 308], f"Expected redirect, got {resp_unauth.status_code}"
    assert "/login" in resp_unauth.headers.get("Location", ""), "Redirect location is not /login"
    print(f"  ✓ Unauthenticated access safely redirected to /login (HTTP {resp_unauth.status_code})")

    # 2. Authenticated Dashboard Retrieval
    print("  2. Requesting /admin with Super Admin session...")
    token = create_super_admin_jwt()
    resp_auth = requests.get(f"{CARE_PORTAL_URL}/admin", cookies={"swarnika_session": token})
    assert resp_auth.status_code == 200, f"Expected HTTP 200, got {resp_auth.status_code}"
    html = resp_auth.text
    print("  ✓ Authenticated dashboard rendered with HTTP 200 OK")

    # 3. Check for No Fake Data & No Billing KPI
    print("  3. Validating absence of fabricated metrics...")
    assert "Pending Bills" not in html, "Pending Bills KPI is still present in HTML"
    assert "8.42" not in html, "Fake amount 8.42 is still present in HTML"
    assert "Chart Placeholder" not in html, "Fake chart placeholder is still present"
    print("  ✓ Confirmed: No fake billing cards or fabricated metrics exist")

    # 4. Check Real Microservice KPIs
    print("  4. Extracting live aggregated metrics...")
    labels = ["Total Patients", "Active Doctors", "Total Appointments", "Active Hospitals"]
    metrics = {}
    for label in labels:
        m = re.search(label + r'</p>\s*<h3[^>]*>([^<]+)</h3>', html)
        assert m, f"Metric '{label}' not found in rendered HTML"
        metrics[label] = m.group(1).strip()
        print(f"     • {label}: {metrics[label]}")

    assert metrics["Total Patients"] != "N/A" and int(metrics["Total Patients"]) > 0, "Patients count invalid"
    assert metrics["Active Doctors"] != "N/A" and int(metrics["Active Doctors"]) > 0, "Doctors count invalid"
    assert metrics["Active Hospitals"] != "N/A" and int(metrics["Active Hospitals"]) > 0, "Hospitals count invalid"
    print("  ✓ All 4 primary microservice KPIs verified with live data")

    # 5. Check Operations Breakdown
    print("  5. Checking Today's Operations breakdown...")
    for op in ["Appointments", "OPD Encounters", "Emergency Triage"]:
        m = re.search(op + r'</span>\s*<p[^>]*>([^<]+)</p>', html)
        assert m, f"Operation '{op}' missing in HTML"
        print(f"     • {op}: {m.group(1).strip()}")

    assert "Phase 5 — IPD" in html, "Phase 5 IPD indicators missing"
    print("  ✓ Today's clinical operations breakdown verified")

    # 6. Check Hospital Overview Table
    print("  6. Checking Hospital Overview table...")
    assert "Hospital Facilities Overview" in html, "Hospital overview table missing"
    assert "Hospital A" in html and "Hospital B" in html, "Live hospitals from organization-service missing"
    print("  ✓ Multi-hospital authoritative table verified")

    print("\n=======================================================")
    print("🎉 STEP 1: SUPER ADMIN DASHBOARD VERIFIED LIVE!")
    print("=======================================================\n")

if __name__ == "__main__":
    main()
