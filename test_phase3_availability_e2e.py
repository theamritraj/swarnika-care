#!/usr/bin/env python3
"""
Step 4 Phase 3 E2E Verification Script:
Doctor Availability Management UI (/admin/availability) & BFF Data Lifecycle
"""
import sys
import time
import json
import base64
import hmac
import hashlib
import subprocess
import requests

CARE_URL = "http://localhost:3001"
GATEWAY_URL = "http://localhost:8080"
JWT_SECRET_B64 = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970"
JWT_SECRET = base64.b64decode(JWT_SECRET_B64)

def b64url(b):
    return base64.urlsafe_b64encode(b).decode('utf-8').rstrip('=')

def generate_jwt(sub: str, roles: list, permissions: list):
    header = {'alg': 'HS256', 'typ': 'JWT'}
    now = 1800000000
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
    "AVAILABILITY_VIEW", "AVAILABILITY_CREATE", "AVAILABILITY_DELETE",
    "ASSIGNMENT_VIEW", "ASSIGNMENT_CREATE", "ASSIGNMENT_DELETE",
    "HOSPITAL_VIEW", "DEPARTMENT_VIEW"
])

COOKIES = {'swarnika_session': SUPER_ADMIN_TOKEN}
HEADERS = {'Authorization': f'Bearer {SUPER_ADMIN_TOKEN}'}
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

def query_db(sql):
    cmd = f"mysql -u root -N -e \"USE doctor_db; {sql}\""
    return subprocess.check_output(cmd, shell=True).decode('utf-8').strip()

def test_route_protection():
    log("Testing Route Protection for /admin/availability...", "INFO")
    r_unauth = requests.get(f"{CARE_URL}/admin/availability", allow_redirects=False)
    if r_unauth.status_code == 307 and r_unauth.headers.get('location') == '/login':
        log("Unauthenticated access redirected to /login (HTTP 307).", "PASS")
        return True
    else:
        log(f"Expected 307 redirect to /login, got: {r_unauth.status_code}", "FAIL")
        return False

def test_page_render():
    log("Testing Authenticated /admin/availability Page Render...", "INFO")
    res = session.get(f"{CARE_URL}/admin/availability")
    if res.status_code == 200:
        html = res.text
        assert "Doctor Availability" in html, "Missing page header"
        assert "Add Schedule Slot" in html, "Missing 'Add Schedule Slot' button"
        assert "Total Active Slots" in html, "Missing KPI card"
        assert "All Hospitals" in html, "Missing Hospital filter"
        assert "All Departments" in html, "Missing Department filter"
        assert "All Days" in html, "Missing Days filter"
        log("Authenticated /admin/availability rendered cleanly with all KPIs and controls.", "PASS")
        return True
    else:
        log(f"Page render failed: HTTP {res.status_code}", "FAIL")
        return False

def test_availability_queries():
    log("Testing Availability Query endpoints via Care BFF...", "INFO")
    # Global
    res = session.get(f"{CARE_URL}/api/proxy/api/v1/doctors/availability")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    slots = res.json().get("data", [])
    log(f"Fetched {len(slots)} global availability slots.", "PASS")
    
    # Filter by Doctor 1
    res_d1 = session.get(f"{CARE_URL}/api/proxy/api/v1/doctors/availability?doctorId=1")
    assert res_d1.status_code == 200
    slots_d1 = res_d1.json().get("data", [])
    log(f"Doctor 1 availability filter: {len(slots_d1)} slots found.", "PASS")
    for s in slots_d1:
        assert s.get("doctorId") == 1
        log(f"  Slot: Day={s.get('dayOfWeek')} Time={s.get('startTime')}-{s.get('endTime')} Hosp={s.get('hospitalId')}", "INFO")

    # Filter by Hospital 101 & Department 101
    res_hd = session.get(f"{CARE_URL}/api/proxy/api/v1/doctors/availability?hospitalId=101&departmentId=101")
    assert res_hd.status_code == 200
    slots_hd = res_hd.json().get("data", [])
    log(f"Hospital 101 / Dept 101 filter: {len(slots_hd)} slots found.", "PASS")
    return True

def test_backend_rule_enforcement():
    log("Testing Backend Domain Rule Enforcements...", "INFO")
    
    # Rule 1: startTime >= endTime (e.g. 14:00 >= 10:00)
    bad_time_payload = {
        "hospitalId": 101,
        "departmentId": 101,
        "dayOfWeek": "TUESDAY",
        "startTime": "14:00:00",
        "endTime": "10:00:00"
    }
    r_bad_time = session.post(f"{CARE_URL}/api/proxy/api/v1/doctors/1/availability", json=bad_time_payload)
    if r_bad_time.status_code == 400:
        log("Rule 1 Verified: startTime >= endTime correctly rejected with HTTP 400 Bad Request.", "PASS")
    else:
        log(f"Rule 1 Failed: Expected 400 for bad time, got {r_bad_time.status_code}", "FAIL")
        return False

    # Rule 2: Doctor must be assigned to hospital/department
    # Doctor 1 is assigned only to Hospital 101 / Dept 101. Try assigning to Hospital 102 / Dept 102.
    unassigned_payload = {
        "hospitalId": 102,
        "departmentId": 102,
        "dayOfWeek": "TUESDAY",
        "startTime": "09:00:00",
        "endTime": "12:00:00"
    }
    r_unassigned = session.post(f"{CARE_URL}/api/proxy/api/v1/doctors/1/availability", json=unassigned_payload)
    if r_unassigned.status_code == 400:
        log("Rule 2 Verified: Unassigned hospital/department correctly rejected with HTTP 400 Bad Request.", "PASS")
    else:
        log(f"Rule 2 Failed: Expected 400 for unassigned doctor, got {r_unassigned.status_code}", "FAIL")
        return False

    # Rule 3: Overlapping slots
    # Doctor 1 already has FRIDAY 08:00:00 - 20:00:00. Try adding FRIDAY 10:00:00 - 14:00:00.
    overlap_payload = {
        "hospitalId": 101,
        "departmentId": 101,
        "dayOfWeek": "FRIDAY",
        "startTime": "10:00:00",
        "endTime": "14:00:00"
    }
    r_overlap = session.post(f"{CARE_URL}/api/proxy/api/v1/doctors/1/availability", json=overlap_payload)
    if r_overlap.status_code == 400:
        log("Rule 3 Verified: Overlapping time slot correctly rejected with HTTP 400 Bad Request.", "PASS")
    else:
        log(f"Rule 3 Failed: Expected 400 for slot overlap, got {r_overlap.status_code}", "FAIL")
        return False

    return True

def test_availability_crud_lifecycle():
    log("Testing Full Availability Creation, Verification, and Removal Lifecycle...", "INFO")
    
    # 1. Create a non-overlapping slot: Doctor 1 on MONDAY 09:00:00 - 13:00:00
    create_payload = {
        "hospitalId": 101,
        "departmentId": 101,
        "dayOfWeek": "MONDAY",
        "startTime": "09:00:00",
        "endTime": "13:00:00"
    }
    res_create = session.post(f"{CARE_URL}/api/proxy/api/v1/doctors/1/availability", json=create_payload)
    if res_create.status_code not in (200, 201):
        log(f"Failed to create availability slot: HTTP {res_create.status_code} - {res_create.text}", "FAIL")
        return False
    
    slot_data = res_create.json().get("data", {})
    slot_id = slot_data.get("id")
    log(f"Created availability slot: ID={slot_id} (Doctor 1, MONDAY 09:00-13:00)", "PASS")

    # 2. Verify slot in list query
    res_list = session.get(f"{CARE_URL}/api/proxy/api/v1/doctors/availability?doctorId=1")
    slots = res_list.json().get("data", [])
    found = next((s for s in slots if s.get("id") == slot_id), None)
    if not found:
        log(f"Slot {slot_id} not found in doctor's availability list!", "FAIL")
        return False
    assert found.get("dayOfWeek") == "MONDAY"
    assert "09:00" in found.get("startTime")
    assert "13:00" in found.get("endTime")
    log("Slot successfully verified via BFF query.", "PASS")

    # 3. Delete the slot
    res_del = session.delete(f"{CARE_URL}/api/proxy/api/v1/doctors/availability/{slot_id}")
    if res_del.status_code not in (200, 204):
        log(f"Failed to delete availability slot: HTTP {res_del.status_code}", "FAIL")
        return False
    log(f"Deleted availability slot {slot_id} successfully.", "PASS")

    # 4. Verify slot is gone
    res_list_after = session.get(f"{CARE_URL}/api/proxy/api/v1/doctors/availability?doctorId=1")
    slots_after = res_list_after.json().get("data", [])
    still_exists = any(s.get("id") == slot_id for s in slots_after)
    if still_exists:
        log("Slot still present after deletion!", "FAIL")
        return False
    log("Verified availability slot removal cleanly persisted.", "PASS")
    return True

def test_three_way_parity():
    log("Testing 3-Way Availability Parity (MySQL DB <-> API Gateway <-> Care BFF)...", "INFO")
    db_count = int(query_db("SELECT count(*) FROM doctor_availability WHERE is_active=1;"))
    
    gw_res = requests.get(f"{GATEWAY_URL}/api/v1/doctors/availability", headers=HEADERS)
    assert gw_res.status_code == 200
    gw_count = len(gw_res.json().get("data", []))
    
    bff_res = session.get(f"{CARE_URL}/api/proxy/api/v1/doctors/availability")
    assert bff_res.status_code == 200
    bff_count = len(bff_res.json().get("data", []))
    
    log(f"  DB Active Slots:     {db_count}", "INFO")
    log(f"  Gateway Slots:       {gw_count}", "INFO")
    log(f"  Care BFF Slots:      {bff_count}", "INFO")
    
    assert db_count == gw_count == bff_count, f"Parity mismatch: DB={db_count}, GW={gw_count}, BFF={bff_count}"
    log("3-Way Data Parity verified 100% across all layers.", "PASS")
    return True

def run_all_tests():
    log("==================================================", "INFO")
    log("   STEP 4 PHASE 3: AVAILABILITY MANAGEMENT UI     ", "INFO")
    log("==================================================", "INFO")

    if not test_route_protection():
        return False
    if not test_page_render():
        return False
    if not test_availability_queries():
        return False
    if not test_backend_rule_enforcement():
        return False
    if not test_availability_crud_lifecycle():
        return False
    if not test_three_way_parity():
        return False

    log("==================================================", "PASS")
    log("  ALL STEP 4 PHASE 3 AUDIT CHECKS PASSED (100%)  ", "PASS")
    log("==================================================", "PASS")
    return True

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
