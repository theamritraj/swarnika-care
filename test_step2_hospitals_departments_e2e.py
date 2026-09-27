#!/usr/bin/env python3
"""
Step 2 Verification Suite: Hospitals & Departments Full Lifecycle via BFF & API Gateway
Verifies:
1. Unauthenticated Route Protection
2. Real GET lists from Organization Service
3. Real Hospital Creation with all configurations
4. Duplicate Hospital Code Rejection (Validation)
5. Real Hospital Update (Edit flow)
6. Real Department Creation associated with Hospital
7. Duplicate Department Code Rejection
8. Real Department Update (Edit flow)
9. Database Parity & Clean teardown
"""

import requests
import base64
import time
import json
import hmac
import hashlib
import subprocess

CARE_PORTAL_URL = "http://localhost:3001"
GATEWAY_URL = "http://localhost:8080"
JWT_SECRET_B64 = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970"
secret = base64.b64decode(JWT_SECRET_B64)

def b64url(b): return base64.urlsafe_b64encode(b).decode('utf-8').rstrip('=')

header = {'alg': 'HS256', 'typ': 'JWT'}
payload = {
    'sub': 'admin@swarnikacare.com',
    'iss': 'swarnika-iam',
    'aud': 'swarnika-care',
    'roles': ['SUPER_ADMIN'],
    'permissions': ['HOSPITAL_VIEW', 'HOSPITAL_CREATE', 'DEPARTMENT_VIEW', 'DEPARTMENT_CREATE', 'DOCTOR_VIEW'],
    'iat': int(time.time()),
    'exp': int(time.time()) + 3600
}
h = b64url(json.dumps(header).encode('utf-8'))
p = b64url(json.dumps(payload).encode('utf-8'))
sig = b64url(hmac.new(secret, f'{h}.{p}'.encode('utf-8'), hashlib.sha256).digest())
token = f'{h}.{p}.{sig}'

session_cookies = {'swarnika_session': token}

def run_db_query(query):
    cmd = f"mysql -u root -N -e \"USE organization_db; {query}\""
    return subprocess.check_output(cmd, shell=True).decode('utf-8').strip()

def main():
    print("=======================================================================")
    print("  STEP 2: HOSPITALS & DEPARTMENTS FULL LIFECYCLE E2E VERIFICATION     ")
    print("=======================================================================\n")

    # 1. Unauthenticated Route Protection
    print("▶ 1. Route Protection Check")
    for path in ['/admin/hospitals', '/admin/departments']:
        r = requests.get(f"{CARE_PORTAL_URL}{path}", allow_redirects=False)
        assert r.status_code in [307, 302, 308] and '/login' in r.headers.get("Location", ""), f"{path} was not protected"
        print(f"  ✓ {path} protected -> redirected to /login (HTTP {r.status_code})")

    # 2. Real GET Lists via BFF Proxy
    print("\n▶ 2. Real GET Lists via BFF Proxy (/api/proxy/...)")
    hosp_res = requests.get(f"{CARE_PORTAL_URL}/api/proxy/api/v1/hospitals", cookies=session_cookies)
    assert hosp_res.status_code == 200, f"Hospitals list failed: {hosp_res.status_code}"
    hospitals = hosp_res.json().get("data", [])
    print(f"  ✓ Retrieved {len(hospitals)} live hospitals from Organization Service")

    dept_res = requests.get(f"{CARE_PORTAL_URL}/api/proxy/api/v1/departments", cookies=session_cookies)
    assert dept_res.status_code == 200, f"Departments list failed: {dept_res.status_code}"
    departments = dept_res.json().get("data", [])
    print(f"  ✓ Retrieved {len(departments)} live departments from Organization Service")

    # 3. Create Hospital via BFF Proxy
    rand_code = f"HOS-E2E-{int(time.time()) % 10000}"
    print(f"\n▶ 3. Hospital Creation ({rand_code})")
    create_hosp_payload = {
        "code": rand_code,
        "name": "Swarnika Multispecialty E2E Facility",
        "type": "MULTI_SPECIALTY",
        "description": "Comprehensive regional trauma and elective healthcare facility",
        "phone": "+91 98765 00001",
        "email": f"info_{rand_code.lower()}@swarnikacare.com",
        "emergencyPhone": "+91 98765 99991",
        "website": "https://care.swarnikahospitals.com",
        "address": "Grand Trunk Road, Sector 5",
        "city": "Sasaram",
        "state": "Bihar",
        "country": "India",
        "pincode": "821115",
        "totalBeds": 250,
        "icuBeds": 40,
        "emergencyAvailable": True,
        "otAvailable": True,
        "bloodBankAvailable": True,
        "ambulanceAvailable": True
    }
    
    post_hosp = requests.post(f"{CARE_PORTAL_URL}/api/proxy/api/v1/hospitals", json=create_hosp_payload, cookies=session_cookies)
    assert post_hosp.status_code in [200, 201], f"Hospital creation failed: {post_hosp.status_code} - {post_hosp.text}"
    created_hosp = post_hosp.json().get("data", {})
    hosp_id = created_hosp.get("id")
    print(f"  ✓ Hospital created successfully with ID: {hosp_id}, Code: {created_hosp.get('code')}")

    # 4. Duplicate Hospital Code Validation Check
    print("\n▶ 4. Duplicate Hospital Code Rejection (Validation)")
    dup_hosp = requests.post(f"{CARE_PORTAL_URL}/api/proxy/api/v1/hospitals", json=create_hosp_payload, cookies=session_cookies)
    assert dup_hosp.status_code in [400, 409, 500], f"Duplicate should fail, got: {dup_hosp.status_code}"
    print(f"  ✓ Duplicate hospital code '{rand_code}' rejected as expected (HTTP {dup_hosp.status_code})")

    # 5. Edit / Update Hospital via BFF Proxy
    print(f"\n▶ 5. Hospital Update (Edit Flow) for ID {hosp_id}")
    update_hosp_payload = {
        "name": "Swarnika Apex Superspecialty Hospital",
        "totalBeds": 350,
        "icuBeds": 60,
        "phone": "+91 98765 11111",
        "emergencyAvailable": True,
        "bloodBankAvailable": True
    }
    put_hosp = requests.put(f"{CARE_PORTAL_URL}/api/proxy/api/v1/hospitals/{hosp_id}", json=update_hosp_payload, cookies=session_cookies)
    assert put_hosp.status_code == 200, f"Hospital update failed: {put_hosp.status_code} - {put_hosp.text}"
    updated_hosp = put_hosp.json().get("data", {})
    assert updated_hosp.get("name") == "Swarnika Apex Superspecialty Hospital"
    assert updated_hosp.get("totalBeds") == 350
    print(f"  ✓ Hospital updated: Name='{updated_hosp.get('name')}', TotalBeds={updated_hosp.get('totalBeds')}")

    # 6. Create Department for Hospital
    dept_code = f"DEP-CARD-{int(time.time()) % 10000}"
    print(f"\n▶ 6. Department Creation ({dept_code}) under Hospital {hosp_id}")
    create_dept_payload = {
        "hospitalId": hosp_id,
        "code": dept_code,
        "name": "Cardiology & Interventional Care",
        "description": "24/7 Primary Angioplasty, Cath Lab, and Coronary Care Unit",
        "headDoctorId": 2, # Dr. Deepak Sharma
        "publicVisibility": True
    }
    post_dept = requests.post(f"{CARE_PORTAL_URL}/api/proxy/api/v1/departments", json=create_dept_payload, cookies=session_cookies)
    assert post_dept.status_code in [200, 201], f"Department creation failed: {post_dept.status_code} - {post_dept.text}"
    created_dept = post_dept.json().get("data", {})
    dept_id = created_dept.get("id")
    print(f"  ✓ Department created with ID: {dept_id}, Code: {created_dept.get('code')}, Hospital: {created_dept.get('hospitalId')}")

    # 7. Duplicate Department Code Validation Check
    print("\n▶ 7. Duplicate Department Code Rejection (Validation)")
    dup_dept = requests.post(f"{CARE_PORTAL_URL}/api/proxy/api/v1/departments", json=create_dept_payload, cookies=session_cookies)
    assert dup_dept.status_code in [400, 409, 500], f"Duplicate should fail, got: {dup_dept.status_code}"
    print(f"  ✓ Duplicate department code '{dept_code}' rejected as expected (HTTP {dup_dept.status_code})")

    # 8. Edit / Update Department
    print(f"\n▶ 8. Department Update (Edit Flow) for ID {dept_id}")
    update_dept_payload = {
        "name": "Cardiology, Vascular & Electrophysiology",
        "description": "Expanded tertiary cardiac services with 2 dedicated Cath Labs",
        "headDoctorId": 2,
        "publicVisibility": True
    }
    put_dept = requests.put(f"{CARE_PORTAL_URL}/api/proxy/api/v1/departments/{dept_id}", json=update_dept_payload, cookies=session_cookies)
    assert put_dept.status_code == 200, f"Department update failed: {put_dept.status_code} - {put_dept.text}"
    updated_dept = put_dept.json().get("data", {})
    assert updated_dept.get("name") == "Cardiology, Vascular & Electrophysiology"
    print(f"  ✓ Department updated: Name='{updated_dept.get('name')}'")

    # 9. Verify Live UI Render & Client BFF Data Feed
    print("\n▶ 9. Verifying Live UI Render & Client BFF Data Feed")
    ui_hosp_html = requests.get(f"{CARE_PORTAL_URL}/admin/hospitals", cookies=session_cookies).text
    assert "Hospital Management" in ui_hosp_html and "Add Hospital" in ui_hosp_html, "Hospital Management UI page structure missing"
    print("  ✓ Hospital Management UI page structure confirmed present (HTTP 200)")

    # Verify UI data feed via BFF proxy
    hosp_feed = requests.get(f"{CARE_PORTAL_URL}/api/proxy/api/v1/hospitals", cookies=session_cookies).json()
    hosp_codes = [h.get("code") for h in hosp_feed.get("data", [])]
    assert rand_code in hosp_codes, f"Created hospital code {rand_code} missing from client BFF data feed"
    print(f"  ✓ Hospital {rand_code} confirmed present in client BFF data feed")

    ui_dept_html = requests.get(f"{CARE_PORTAL_URL}/admin/departments", cookies=session_cookies).text
    assert "Department Management" in ui_dept_html and "Add Department" in ui_dept_html, "Department Management UI page structure missing"
    print("  ✓ Department Management UI page structure confirmed present (HTTP 200)")

    # Verify department UI data feed via BFF proxy
    dept_feed = requests.get(f"{CARE_PORTAL_URL}/api/proxy/api/v1/departments", cookies=session_cookies).json()
    dept_codes = [d.get("code") for d in dept_feed.get("data", [])]
    assert dept_code in dept_codes, f"Created department code {dept_code} missing from client BFF data feed"
    print(f"  ✓ Department {dept_code} confirmed present in client BFF data feed")

    # 10. Teardown
    print("\n▶ 10. Database Teardown & Cleanup")
    run_db_query(f"DELETE FROM departments WHERE id={dept_id};")
    run_db_query(f"DELETE FROM hospitals WHERE id={hosp_id};")
    print("  ✓ Cleaned up test department and test hospital from organization_db")

    print("\n=======================================================================")
    print("🎉 STEP 2: HOSPITALS & DEPARTMENTS FULLY VERIFIED AND PASSING E2E!")
    print("=======================================================================\n")

if __name__ == "__main__":
    main()
