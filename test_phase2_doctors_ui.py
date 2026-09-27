#!/usr/bin/env python3
"""
Step 4 Phase 2 E2E Verification Script:
Super Admin Doctor Directory UI (/admin/doctors) & BFF Proxy Lifecycle
"""
import sys
import time
import json
import base64
import hmac
import hashlib
import requests

CARE_URL = "http://localhost:3001"
GATEWAY_URL = "http://localhost:8080"
JWT_SECRET_B64 = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970"
JWT_SECRET = base64.b64decode(JWT_SECRET_B64)

def b64url(b):
    return base64.urlsafe_b64encode(b).decode('utf-8').rstrip('=')

def generate_jwt(sub: str, roles: list, permissions: list):
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
    h = b64url(json.dumps(header).encode('utf-8'))
    p = b64url(json.dumps(payload).encode('utf-8'))
    sig = b64url(hmac.new(JWT_SECRET, f'{h}.{p}'.encode('utf-8'), hashlib.sha256).digest())
    return f'{h}.{p}.{sig}'

SUPER_ADMIN_TOKEN = generate_jwt("superadmin@swarnikacare.com", ["SUPER_ADMIN"], [
    "DOCTOR_VIEW", "DOCTOR_CREATE", "DOCTOR_UPDATE", "DOCTOR_DELETE",
    "ASSIGNMENT_VIEW", "ASSIGNMENT_CREATE", "ASSIGNMENT_DELETE",
    "HOSPITAL_VIEW", "DEPARTMENT_VIEW"
])

COOKIES = {'swarnika_session': SUPER_ADMIN_TOKEN}
session = requests.Session()
session.cookies.set('swarnika_session', SUPER_ADMIN_TOKEN)

def log(msg, status="INFO"):
    colors = {
        "INFO": "\033[94m",
        "PASS": "\033[92m",
        "FAIL": "\033[91m",
        "WARN": "\033[93m"
    }
    reset = "\033[0m"
    print(f"{colors.get(status, '')}[{status}] {msg}{reset}")

def test_route_protection():
    log("Testing Route Protection for /admin/doctors...", "INFO")
    r_unauth = requests.get(f"{CARE_URL}/admin/doctors", allow_redirects=False)
    if r_unauth.status_code == 307 and r_unauth.headers.get('location') == '/login':
        log("Unauthenticated access redirected to /login (HTTP 307).", "PASS")
        return True
    else:
        log(f"Expected 307 redirect to /login, got: {r_unauth.status_code}", "FAIL")
        return False

def test_page_render():
    log("Testing Authenticated /admin/doctors Page Render...", "INFO")
    res = session.get(f"{CARE_URL}/admin/doctors")
    if res.status_code == 200:
        html = res.text
        assert "Doctor Management" in html, "Missing 'Doctor Management' title"
        assert "Register Doctor" in html, "Missing 'Register Doctor' button"
        assert "All Hospitals" in html, "Missing 'All Hospitals' filter"
        assert "All Specializations" in html, "Missing 'All Specializations' filter"
        log("Authenticated /admin/doctors rendered with full controls and design system tokens.", "PASS")
        return True
    else:
        log(f"Page render failed: HTTP {res.status_code}", "FAIL")
        return False

def test_directory_fetch():
    log("Testing Doctor Directory fetch via Care BFF Proxy...", "INFO")
    res = session.get(f"{CARE_URL}/api/proxy/api/v1/doctors/directory")
    if res.status_code == 200:
        data = res.json().get("data", [])
        log(f"Fetched {len(data)} doctors from Directory endpoint.", "PASS")
        for d in data[:3]:
            log(f"  Doctor: DOC-{d.get('id')} Dr. {d.get('firstName')} {d.get('lastName')} | Specialization: {d.get('specialization')} | Deployments: {len(d.get('assignments', []))}", "INFO")
        return True
    else:
        log(f"Failed to fetch directory: HTTP {res.status_code} - {res.text}", "FAIL")
        return False

def test_hospital_filtered_directory():
    log("Testing Doctor Directory filtered by hospitalId=101...", "INFO")
    res = session.get(f"{CARE_URL}/api/proxy/api/v1/doctors/directory?hospitalId=101")
    if res.status_code == 200:
        data = res.json().get("data", [])
        log(f"Fetched {len(data)} doctors assigned to Hospital 101.", "PASS")
        for d in data:
            hosp_ids = [a.get("hospitalId") for a in d.get("assignments", [])]
            assert 101 in hosp_ids, f"Doctor {d.get('id')} lacks assignment to Hospital 101"
        log("All returned doctors verified to belong to Hospital 101.", "PASS")
        return True
    else:
        log(f"Failed to fetch filtered directory: HTTP {res.status_code} - {res.text}", "FAIL")
        return False

def test_register_flow():
    log("Testing Complete Doctor Registration Flow (Identity + Profile + Assignment)...", "INFO")
    timestamp = int(time.time())
    unique_email = f"dr.ui.{timestamp}@swarnikacare.com"
    
    # 1. Register Core Doctor Identity
    create_payload = {
        "firstName": "PhaseTwo",
        "lastName": "Specialist",
        "email": unique_email,
        "phone": "+91 99887 76655",
        "gender": "FEMALE",
        "dateOfBirth": "1988-06-15"
    }
    res = session.post(f"{CARE_URL}/api/proxy/api/v1/doctors", json=create_payload)
    if res.status_code not in (200, 201):
        log(f"Failed to register doctor identity: HTTP {res.status_code} - {res.text}", "FAIL")
        return None
    
    created = res.json().get("data", {})
    doctor_id = created.get("id")
    log(f"Doctor core identity created: ID={doctor_id}, Email={unique_email}", "PASS")
    
    # 2. Update Profile
    profile_payload = {
        "specializations": "Pediatric Cardiology",
        "qualifications": "MBBS, MD (Pediatrics), DM (Cardiology)",
        "experienceYears": 12,
        "registrationNumber": f"MCI-P2-{timestamp}",
        "defaultConsultationFee": 1200.0,
        "bio": "Specialized in congenital heart defect management and pediatric interventional cardiology."
    }
    res_prof = session.put(f"{CARE_URL}/api/proxy/api/v1/doctors/{doctor_id}/profile", json=profile_payload)
    if res_prof.status_code not in (200, 201):
        log(f"Failed to update profile: HTTP {res_prof.status_code} - {res_prof.text}", "FAIL")
        return None
    log("Doctor professional profile updated.", "PASS")
    
    # 3. Create Hospital Assignment (Hospital 101, Dept 101)
    assign_payload = {
        "hospitalId": 101,
        "departmentId": 101,
        "designation": "Associate Professor & Consultant",
        "status": "ACTIVE"
    }
    res_assign = session.post(f"{CARE_URL}/api/proxy/api/v1/doctors/{doctor_id}/assignments", json=assign_payload)
    if res_assign.status_code not in (200, 201):
        log(f"Failed to assign doctor: HTTP {res_assign.status_code} - {res_assign.text}", "FAIL")
        return None
    assignment_id = res_assign.json().get("data", {}).get("id")
    log(f"Doctor assigned to Hospital 101 / Dept 101: Assignment ID={assignment_id}", "PASS")
    
    # 4. Verify in Directory Composite endpoint
    res_dir = session.get(f"{CARE_URL}/api/proxy/api/v1/doctors/directory")
    all_docs = res_dir.json().get("data", [])
    found = next((d for d in all_docs if d.get("id") == doctor_id), None)
    if not found:
        log("Doctor not found in directory listing!", "FAIL")
        return None
    
    assert found.get("specialization") == "Pediatric Cardiology"
    assert found.get("qualifications") == "MBBS, MD (Pediatrics), DM (Cardiology)"
    assert len(found.get("assignments", [])) >= 1
    log("Verified registered doctor composite attributes and assignment in directory response.", "PASS")
    
    return doctor_id, assignment_id

def test_edit_doctor_flow(doctor_id):
    log(f"Testing Doctor Profile & Details Edit for Doctor ID {doctor_id}...", "INFO")
    update_payload = {
        "firstName": "PhaseTwoEdited",
        "lastName": "ChiefSurgeon",
        "email": f"dr.edited.{doctor_id}@swarnikacare.com",
        "phone": "+91 99887 00000",
        "gender": "FEMALE",
        "dateOfBirth": "1988-06-15",
        "status": "ACTIVE"
    }
    res = session.put(f"{CARE_URL}/api/proxy/api/v1/doctors/{doctor_id}", json=update_payload)
    if res.status_code != 200:
        log(f"Failed to update core doctor: HTTP {res.status_code} - {res.text}", "FAIL")
        return False
    
    profile_update = {
        "specializations": "Chief Pediatric Cardiologist",
        "qualifications": "MBBS, MD, DM, FACC",
        "experienceYears": 14,
        "registrationNumber": f"MCI-P2-EDIT-{doctor_id}",
        "defaultConsultationFee": 1500.0,
        "bio": "Lead pediatric cardiac surgeon and research fellow."
    }
    res_prof = session.put(f"{CARE_URL}/api/proxy/api/v1/doctors/{doctor_id}/profile", json=profile_update)
    if res_prof.status_code != 200:
        log(f"Failed to update profile: HTTP {res_prof.status_code} - {res_prof.text}", "FAIL")
        return False
    
    # Verify update
    res_dir = session.get(f"{CARE_URL}/api/proxy/api/v1/doctors/directory")
    all_docs = res_dir.json().get("data", [])
    found = next((d for d in all_docs if d.get("id") == doctor_id), None)
    assert found.get("firstName") == "PhaseTwoEdited"
    assert found.get("specialization") == "Chief Pediatric Cardiologist"
    assert found.get("defaultConsultationFee") == 1500.0
    log("Doctor core details and profile update verified successfully.", "PASS")
    return True

def test_assignment_lifecycle(doctor_id, first_assignment_id):
    log(f"Testing Multiple Assignments & Removal for Doctor ID {doctor_id}...", "INFO")
    
    # 1. Duplicate assignment check (409 expected)
    duplicate_payload = {
        "hospitalId": 101,
        "departmentId": 101,
        "designation": "Duplicate Try"
    }
    res_dup = session.post(f"{CARE_URL}/api/proxy/api/v1/doctors/{doctor_id}/assignments", json=duplicate_payload)
    if res_dup.status_code == 409:
        log("Duplicate assignment correctly returned HTTP 409 Conflict.", "PASS")
    else:
        log(f"Expected 409 for duplicate assignment, got: {res_dup.status_code}", "FAIL")
        return False
        
    # 2. Add second assignment to Hospital 102 / Dept 102
    res_second = session.post(f"{CARE_URL}/api/proxy/api/v1/doctors/{doctor_id}/assignments", json={
        "hospitalId": 102,
        "departmentId": 102,
        "designation": "Visiting Consultant"
    })
    if res_second.status_code not in (200, 201):
        log(f"Failed to create second assignment: HTTP {res_second.status_code} - {res_second.text}", "FAIL")
        return False
    second_assignment_id = res_second.json().get("data", {}).get("id")
    log(f"Second assignment created to Hospital 102: ID={second_assignment_id}", "PASS")
    
    # 3. Check doctor assignments
    res_list = session.get(f"{CARE_URL}/api/proxy/api/v1/doctors/{doctor_id}/assignments")
    assignments = res_list.json().get("data", [])
    assert len(assignments) == 2, f"Expected 2 assignments, got {len(assignments)}"
    log(f"Doctor now has {len(assignments)} active assignments across hospitals.", "PASS")
    
    # 4. Remove second assignment
    res_del = session.delete(f"{CARE_URL}/api/proxy/api/v1/doctors/assignments/{second_assignment_id}")
    if res_del.status_code not in (200, 204):
        log(f"Failed to delete assignment: HTTP {res_del.status_code}", "FAIL")
        return False
    log(f"Deleted assignment ID {second_assignment_id} successfully.", "PASS")
    
    # 5. Verify remaining assignment
    res_list_after = session.get(f"{CARE_URL}/api/proxy/api/v1/doctors/{doctor_id}/assignments")
    assignments_after = res_list_after.json().get("data", [])
    assert len(assignments_after) == 1
    assert assignments_after[0].get("id") == first_assignment_id
    log("Verified assignment removal persisted cleanly.", "PASS")
    return True

def run_all_tests():
    log("==================================================", "INFO")
    log("   STEP 4 PHASE 2: SUPER ADMIN DOCTOR DIRECTORY   ", "INFO")
    log("==================================================", "INFO")
    
    if not test_route_protection():
        return False
    if not test_page_render():
        return False
    if not test_directory_fetch():
        return False
    if not test_hospital_filtered_directory():
        return False
    
    res = test_register_flow()
    if not res:
        return False
    doctor_id, first_assignment_id = res
    
    if not test_edit_doctor_flow(doctor_id):
        return False
    if not test_assignment_lifecycle(doctor_id, first_assignment_id):
        return False
        
    log("==================================================", "PASS")
    log("  ALL STEP 4 PHASE 2 AUDIT CHECKS PASSED (100%)  ", "PASS")
    log("==================================================", "PASS")
    return True

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
