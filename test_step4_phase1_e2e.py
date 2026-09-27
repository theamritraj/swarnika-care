#!/usr/bin/env python3
"""
Step 4 Phase 1: Doctors & Availability Backend API Gap Closure E2E Verification Suite
Validates:
1. Backward compatibility for existing endpoints:
   - GET /api/v1/doctors/{id}
   - GET /api/v1/doctors/{id}/availability
   - GET /api/v1/doctors
2. Hospital Assignments Layer:
   - GET /api/v1/doctors/{doctorId}/assignments
   - POST /api/v1/doctors/{doctorId}/assignments
   - DELETE /api/v1/doctors/assignments/{assignmentId}
   - GET /api/v1/doctors/assignments?hospitalId={hospitalId}
3. Negative validations for Hospital Assignments:
   - Hospital not found -> 400
   - Department not found -> 400
   - Department belongs to another hospital -> 400 (InvalidHierarchy)
   - Duplicate assignment -> 409 (DuplicateResource)
4. Composite Doctor Directory API:
   - GET /api/v1/doctors/directory
   - Filtering by hospitalId, departmentId, and search query
5. Global & Filtered Availability API:
   - GET /api/v1/doctors/availability (?hospitalId, ?departmentId, ?doctorId)
   - POST /api/v1/doctors/{id}/availability (with validations: assignment check, hierarchy, overlap protection)
   - DELETE /api/v1/doctors/availability/{id}
6. Role & Hospital-Scope Security Authorization:
   - Unauthenticated access -> 401/403
   - PATIENT role access -> 403 Forbidden
   - Scoped HOSPITAL_ADMIN (102) rejected on Hospital 101 -> 403 Forbidden
   - SUPER_ADMIN authorized for all hospitals -> 200 OK
7. BFF Proxy Integration:
   - Verified via Next.js proxy route http://localhost:3001/api/proxy/...
"""

import sys
import time
import json
import base64
import hmac
import hashlib
import requests

GATEWAY_URL = "http://localhost:8080"
BFF_URL = "http://localhost:3001"
JWT_SECRET_B64 = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970"
JWT_SECRET = base64.b64decode(JWT_SECRET_B64)

def b64url(b):
    return base64.urlsafe_b64encode(b).decode('utf-8').rstrip('=')

def generate_jwt(sub: str, roles: list, permissions: list, hospital_id=None):
    header = {'alg': 'HS256', 'typ': 'JWT'}
    now = int(time.time())
    payload = {
        'sub': sub,
        'iss': 'swarnika-iam',
        'aud': 'swarnika-care',
        'roles': roles,
        'permissions': permissions,
        'iat': now,
        'exp': now + 7200
    }
    if hospital_id:
        payload['hospitalId'] = hospital_id
    h = b64url(json.dumps(header).encode('utf-8'))
    p = b64url(json.dumps(payload).encode('utf-8'))
    sig = b64url(hmac.new(JWT_SECRET, f'{h}.{p}'.encode('utf-8'), hashlib.sha256).digest())
    return f'{h}.{p}.{sig}'

SUPER_ADMIN_TOKEN = generate_jwt("superadmin@swarnikacare.com", ["SUPER_ADMIN"], [
    "DOCTOR_VIEW", "DOCTOR_CREATE", "DOCTOR_UPDATE", "DOCTOR_DELETE",
    "ASSIGNMENT_VIEW", "ASSIGNMENT_CREATE", "ASSIGNMENT_DELETE",
    "AVAILABILITY_VIEW", "AVAILABILITY_CREATE", "AVAILABILITY_DELETE"
])

H102_ADMIN_TOKEN = generate_jwt("admin_h102@swarnikacare.com", ["HOSPITAL_ADMIN"], [
    "DOCTOR_VIEW", "ASSIGNMENT_VIEW", "ASSIGNMENT_CREATE", "AVAILABILITY_VIEW", "AVAILABILITY_CREATE"
], hospital_id=102)

PATIENT_TOKEN = generate_jwt("patient@swarnikacare.com", ["PATIENT"], ["PATIENT_VIEW"])

SUPER_HEADERS = {'Authorization': f'Bearer {SUPER_ADMIN_TOKEN}', 'Content-Type': 'application/json'}
H102_HEADERS = {'Authorization': f'Bearer {H102_ADMIN_TOKEN}', 'Content-Type': 'application/json'}
PATIENT_HEADERS = {'Authorization': f'Bearer {PATIENT_TOKEN}', 'Content-Type': 'application/json'}
SUPER_COOKIES = {'swarnika_session': SUPER_ADMIN_TOKEN}

def print_header(title):
    print("\n" + "=" * 80)
    print(f"  {title}")
    print("=" * 80)

def assert_status(resp, expected_status, msg):
    if resp.status_code != expected_status:
        print(f"  ❌ FAILED: {msg}")
        print(f"     Expected: {expected_status}, Got: {resp.status_code}")
        try:
            print(f"     Body: {resp.json()}")
        except Exception:
            print(f"     Body: {resp.text}")
        sys.exit(1)
    else:
        print(f"  ✓ {msg} (HTTP {resp.status_code})")

def main():
    print_header("STEP 4 PHASE 1: DOCTORS & AVAILABILITY BACKEND API & PARITY VERIFICATION")

    # SECTION 1: Backward Compatibility for Appointment Service Contracts
    print("\n▶ SECTION 1: Existing Contracts Compatibility (used by appointment-service)")
    # 1. GET /api/v1/doctors/{id}
    r = requests.get(f"{GATEWAY_URL}/api/v1/doctors/1", headers=SUPER_HEADERS)
    assert_status(r, 200, "GET /api/v1/doctors/1 via Gateway")
    data = r.json().get("data", {})
    assert data.get("id") == 1 and data.get("firstName") == "Uttpal", "Doctor 1 fields mismatch"

    # 2. GET /api/v1/doctors/{id}/availability
    r = requests.get(f"{GATEWAY_URL}/api/v1/doctors/1/availability", headers=SUPER_HEADERS)
    assert_status(r, 200, "GET /api/v1/doctors/1/availability via Gateway")
    avail_list = r.json().get("data", [])
    assert len(avail_list) > 0, "Doctor 1 should have availability slots"

    # 3. GET /api/v1/doctors
    r = requests.get(f"{GATEWAY_URL}/api/v1/doctors", headers=SUPER_HEADERS)
    assert_status(r, 200, "GET /api/v1/doctors via Gateway")
    assert len(r.json().get("data", [])) >= 7, "All doctors returned"

    # SECTION 2: Doctor Hospital Assignment Layer
    print("\n▶ SECTION 2: Doctor Hospital Assignment Lifecycle & Validation")
    # 1. Query assignments for doctor 1 (seeded in V3 migration)
    r = requests.get(f"{GATEWAY_URL}/api/v1/doctors/1/assignments", headers=SUPER_HEADERS)
    assert_status(r, 200, "GET /api/v1/doctors/1/assignments")
    assignments = r.json().get("data", [])
    assert len(assignments) >= 1, "Doctor 1 should have an assignment"
    assert assignments[0]["hospitalId"] == 101, "Assignment hospital should be 101"

    # 2. Duplicate assignment rejection (Doctor 1 to Hospital 101, Department 101)
    dup_payload = {
        "hospitalId": 101,
        "departmentId": 101,
        "designation": "Senior Consultant",
        "status": "ACTIVE"
    }
    r = requests.post(f"{GATEWAY_URL}/api/v1/doctors/1/assignments", headers=SUPER_HEADERS, json=dup_payload)
    assert_status(r, 409, "Duplicate assignment correctly rejected with 409 Conflict")

    # 3. Hospital invalid rejection
    inv_hosp_payload = {
        "hospitalId": 9999,
        "departmentId": 101,
        "designation": "Specialist",
        "status": "ACTIVE"
    }
    r = requests.post(f"{GATEWAY_URL}/api/v1/doctors/2/assignments", headers=SUPER_HEADERS, json=inv_hosp_payload)
    assert_status(r, 400, "Invalid hospital rejected with 400 Bad Request")

    # 4. Department invalid rejection
    inv_dept_payload = {
        "hospitalId": 101,
        "departmentId": 9999,
        "designation": "Specialist",
        "status": "ACTIVE"
    }
    r = requests.post(f"{GATEWAY_URL}/api/v1/doctors/2/assignments", headers=SUPER_HEADERS, json=inv_dept_payload)
    assert_status(r, 400, "Invalid department rejected with 400 Bad Request")

    # 5. Invalid hierarchy rejection (Department 102 belongs to Hospital 102, attempted on Hospital 101)
    mismatch_payload = {
        "hospitalId": 101,
        "departmentId": 102,
        "designation": "Consultant",
        "status": "ACTIVE"
    }
    r = requests.post(f"{GATEWAY_URL}/api/v1/doctors/2/assignments", headers=SUPER_HEADERS, json=mismatch_payload)
    assert_status(r, 400, "Department-hospital mismatch rejected with 400 Bad Request (InvalidHierarchy)")

    # 6. Valid assignment creation (Doctor 2 to Hospital 101, Department 101)
    valid_payload = {
        "hospitalId": 101,
        "departmentId": 101,
        "designation": "Associate Specialist",
        "status": "ACTIVE"
    }
    r = requests.post(f"{GATEWAY_URL}/api/v1/doctors/2/assignments", headers=SUPER_HEADERS, json=valid_payload)
    assert_status(r, 201, "Valid assignment created for Doctor 2 (HTTP 201)")
    created_assignment = r.json().get("data", {})
    created_assignment_id = created_assignment.get("id")

    # 7. List assignments by hospital
    r = requests.get(f"{GATEWAY_URL}/api/v1/doctors/assignments?hospitalId=101", headers=SUPER_HEADERS)
    assert_status(r, 200, "GET /api/v1/doctors/assignments?hospitalId=101")
    hosp_assignments = r.json().get("data", [])
    assert any(a["id"] == created_assignment_id for a in hosp_assignments), "Created assignment in hospital list"

    # 8. Delete assignment
    r = requests.delete(f"{GATEWAY_URL}/api/v1/doctors/assignments/{created_assignment_id}", headers=SUPER_HEADERS)
    assert_status(r, 200, "DELETE /api/v1/doctors/assignments/{id}")

    # SECTION 3: Composite Doctor Directory API
    print("\n▶ SECTION 3: Composite Doctor Directory API")
    # 1. Global directory
    r = requests.get(f"{GATEWAY_URL}/api/v1/doctors/directory", headers=SUPER_HEADERS)
    assert_status(r, 200, "GET /api/v1/doctors/directory")
    directory = r.json().get("data", [])
    assert len(directory) >= 7, "Doctor directory returns full list"
    doc7 = next((d for d in directory if d["id"] == 7), None)
    assert doc7 is not None, "Doctor 7 present in directory"
    assert doc7.get("specialization") == "Cardiology", "Doctor 7 specialization populated from profile"
    assert len(doc7.get("assignments", [])) >= 1, "Doctor 7 assignments populated"

    # 2. Filter directory by hospital
    r = requests.get(f"{GATEWAY_URL}/api/v1/doctors/directory?hospitalId=101", headers=SUPER_HEADERS)
    assert_status(r, 200, "GET /api/v1/doctors/directory?hospitalId=101")
    hosp101_docs = r.json().get("data", [])
    assert len(hosp101_docs) >= 3, "Filtered directory returns hospital 101 doctors"

    # 3. Filter directory by search query
    r = requests.get(f"{GATEWAY_URL}/api/v1/doctors/directory?search=deepak", headers=SUPER_HEADERS)
    assert_status(r, 200, "GET /api/v1/doctors/directory?search=deepak")
    search_docs = r.json().get("data", [])
    assert len(search_docs) == 1 and search_docs[0]["firstName"] == "Deepak", "Search filter matches Deepak"

    # SECTION 4: Global & Filtered Availability API
    print("\n▶ SECTION 4: Global & Filtered Availability API")
    # 1. Global list
    r = requests.get(f"{GATEWAY_URL}/api/v1/doctors/availability", headers=SUPER_HEADERS)
    assert_status(r, 200, "GET /api/v1/doctors/availability")
    all_avail = r.json().get("data", [])
    assert len(all_avail) >= 5, "Global availability returns all active slots"

    # 2. Filter by hospital
    r = requests.get(f"{GATEWAY_URL}/api/v1/doctors/availability?hospitalId=101", headers=SUPER_HEADERS)
    assert_status(r, 200, "GET /api/v1/doctors/availability?hospitalId=101")

    # 3. Filter by doctor
    r = requests.get(f"{GATEWAY_URL}/api/v1/doctors/availability?doctorId=6", headers=SUPER_HEADERS)
    assert_status(r, 200, "GET /api/v1/doctors/availability?doctorId=6")
    doc6_avail = r.json().get("data", [])
    assert len(doc6_avail) >= 2, "Doctor 6 filtered slots"

    # 4. Availability validation: Doctor not assigned to hospital
    unassigned_req = {
        "hospitalId": 102,
        "departmentId": 102,
        "dayOfWeek": "MONDAY",
        "startTime": "09:00:00",
        "endTime": "12:00:00"
    }
    r = requests.post(f"{GATEWAY_URL}/api/v1/doctors/1/availability", headers=SUPER_HEADERS, json=unassigned_req)
    assert_status(r, 400, "Adding availability for unassigned hospital rejected (HTTP 400)")

    # 5. Availability validation: start >= end time
    inv_time_req = {
        "hospitalId": 101,
        "departmentId": 101,
        "dayOfWeek": "MONDAY",
        "startTime": "14:00:00",
        "endTime": "10:00:00"
    }
    r = requests.post(f"{GATEWAY_URL}/api/v1/doctors/1/availability", headers=SUPER_HEADERS, json=inv_time_req)
    assert_status(r, 400, "Start time after end time rejected (HTTP 400)")

    # 6. Availability validation: Overlapping slot protection
    # Doctor 1 already has Friday 08:00 - 20:00. Adding Friday 10:00 - 15:00 should fail.
    overlap_req = {
        "hospitalId": 101,
        "departmentId": 101,
        "dayOfWeek": "FRIDAY",
        "startTime": "10:00:00",
        "endTime": "15:00:00"
    }
    r = requests.post(f"{GATEWAY_URL}/api/v1/doctors/1/availability", headers=SUPER_HEADERS, json=overlap_req)
    assert_status(r, 400, "Overlapping availability slot rejected (HTTP 400)")

    # 7. Add valid availability for Doctor 7 (Monday 10:00 - 14:00 on Hospital 101, Dept 101)
    valid_avail_req = {
        "hospitalId": 101,
        "departmentId": 101,
        "dayOfWeek": "MONDAY",
        "startTime": "10:00:00",
        "endTime": "14:00:00"
    }
    r = requests.post(f"{GATEWAY_URL}/api/v1/doctors/7/availability", headers=SUPER_HEADERS, json=valid_avail_req)
    assert_status(r, 201, "Valid availability slot created for Doctor 7 (HTTP 201)")
    new_avail_id = r.json().get("data", {}).get("id")

    # 8. Delete availability slot
    r = requests.delete(f"{GATEWAY_URL}/api/v1/doctors/availability/{new_avail_id}", headers=SUPER_HEADERS)
    assert_status(r, 200, "DELETE /api/v1/doctors/availability/{id}")

    # SECTION 5: Scope & Role Authorization Boundaries
    print("\n▶ SECTION 5: Scope & Role Authorization Enforcements")
    # 1. Unauthenticated request to assignments
    r = requests.get(f"{GATEWAY_URL}/api/v1/doctors/assignments?hospitalId=101")
    assert r.status_code in [401, 403], f"Unauthenticated access rejected (Got {r.status_code})"
    print(f"  ✓ Unauthenticated access to assignments rejected (HTTP {r.status_code})")

    # 2. PATIENT role blocked from assignment creation
    r = requests.post(f"{GATEWAY_URL}/api/v1/doctors/1/assignments", headers=PATIENT_HEADERS, json=valid_payload)
    assert_status(r, 403, "PATIENT role rejected from assignment creation (HTTP 403)")

    # 3. Scoped Hospital 102 Admin attempting to view Hospital 101 assignments
    r = requests.get(f"{GATEWAY_URL}/api/v1/doctors/assignments?hospitalId=101", headers=H102_HEADERS)
    assert_status(r, 403, "Hospital 102 Admin cross-hospital access to 101 rejected (HTTP 403)")

    # 4. Scoped Hospital 102 Admin attempting to create assignment on Hospital 101
    r = requests.post(f"{GATEWAY_URL}/api/v1/doctors/1/assignments", headers=H102_HEADERS, json=valid_payload)
    assert_status(r, 403, "Hospital 102 Admin cross-hospital creation on 101 rejected (HTTP 403)")

    # 5. SUPER_ADMIN authorized across all hospitals
    r = requests.get(f"{GATEWAY_URL}/api/v1/doctors/assignments?hospitalId=101", headers=SUPER_HEADERS)
    assert_status(r, 200, "SUPER_ADMIN authorized for Hospital 101 assignments (HTTP 200)")

    # SECTION 6: Next.js BFF Proxy Compatibility
    print("\n▶ SECTION 6: Next.js BFF Proxy Forwarding (port 3001)")
    # Test GET through BFF
    r = requests.get(f"{BFF_URL}/api/proxy/api/v1/doctors/directory?hospitalId=101", cookies=SUPER_COOKIES)
    assert_status(r, 200, "BFF GET /api/proxy/api/v1/doctors/directory")
    bff_data = r.json().get("data", [])
    assert len(bff_data) >= 3, "BFF forwarded doctor directory successfully"

    # Test GET global availability through BFF
    r = requests.get(f"{BFF_URL}/api/proxy/api/v1/doctors/availability?hospitalId=101", cookies=SUPER_COOKIES)
    assert_status(r, 200, "BFF GET /api/proxy/api/v1/doctors/availability")

    print_header("🎉 ALL SECTIONS PASSED: STEP 4 PHASE 1 BACKEND API GAP CLOSURE VERIFIED!")

if __name__ == "__main__":
    main()
