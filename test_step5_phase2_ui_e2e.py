#!/usr/bin/env python3
"""
Step 5 Phase 2 E2E Verification Script: Super Admin Staff Directory UI & BFF Integration
Tests the full chain:
  Client / Browser -> Next.js BFF (:3001) -> API Gateway (:8080) -> Organization Service (:8085) -> IAM Service (:8081)
"""
import sys
import time
import json
import base64
import hmac
import hashlib
import requests

BFF_URL = "http://localhost:3001"
GATEWAY_URL = "http://localhost:8080"
IAM_SERVICE_URL = "http://localhost:8081"
ORG_SERVICE_URL = "http://localhost:8085"

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

SUPER_ADMIN_TOKEN = generate_jwt("superadmin@swarnikacare.com", ["SUPER_ADMIN"], ["*"])
HOSP_101_ADMIN_TOKEN = generate_jwt("hospadmin101@swarnikacare.com", ["HOSPITAL_ADMIN"], [
    "STAFF_VIEW", "STAFF_CREATE", "STAFF_UPDATE", "EMPLOYEE_VIEW", "EMPLOYEE_CREATE"
], hospital_id=101)

results = {}

def check(name, success, detail=""):
    status = "✅ PASS" if success else "❌ FAIL"
    results[name] = success
    print(f"[{status}] {name}" + (f" - {detail}" if detail else ""))
    if not success:
        print(f"    FAILURE DETAILS: {detail}")

def extract_data(response_obj):
    try:
        j = response_obj.json()
        if isinstance(j, dict) and "data" in j:
            return j["data"]
        return j
    except Exception:
        return None

def run_tests():
    print("=" * 80)
    print("STEP 5 PHASE 2: SUPER ADMIN STAFF DIRECTORY UI & BFF E2E VERIFICATION")
    print("=" * 80)

    # Setup Session with Super Admin JWT
    sa_session = requests.Session()
    sa_session.cookies.set('swarnika_session', SUPER_ADMIN_TOKEN)

    ha_session = requests.Session()
    ha_session.cookies.set('swarnika_session', HOSP_101_ADMIN_TOKEN)

    # 1. Page Route Protection: Unauthenticated access redirects to /login
    try:
        r_unauth = requests.get(f"{BFF_URL}/admin/staff", allow_redirects=False, timeout=5)
        check("1. Route Protection: Unauthenticated Access Redirects to /login",
              r_unauth.status_code in (302, 307, 401),
              f"Status {r_unauth.status_code}")
    except Exception as e:
        check("1. Route Protection: Unauthenticated Access Redirects to /login", False, str(e))

    # 2. Page Rendering: Authenticated Super Admin loads /admin/staff
    try:
        r_page = sa_session.get(f"{BFF_URL}/admin/staff", timeout=10)
        check("2. Page Rendering: /admin/staff loads 200 OK",
              r_page.status_code == 200 and "Staff" in r_page.text,
              f"Status {r_page.status_code}")
    except Exception as e:
        check("2. Page Rendering: /admin/staff loads 200 OK", False, str(e))

    # 3. BFF Proxy: Fetch Hospitals lookup
    hosp_101_id = None
    try:
        r_hosp = sa_session.get(f"{BFF_URL}/api/proxy/api/v1/hospitals", timeout=5)
        hosps = extract_data(r_hosp)
        if r_hosp.status_code == 200 and isinstance(hosps, list) and len(hosps) > 0:
            hosp_101_id = hosps[0].get("id")
            check("3. BFF Proxy: Hospitals Lookup", True, f"Found {len(hosps)} hospitals, id={hosp_101_id}")
        else:
            check("3. BFF Proxy: Hospitals Lookup", False, f"Status {r_hosp.status_code}")
    except Exception as e:
        check("3. BFF Proxy: Hospitals Lookup", False, str(e))

    # 4. BFF Proxy: Fetch Departments lookup
    dept_101_id = None
    try:
        r_dept = sa_session.get(f"{BFF_URL}/api/proxy/api/v1/departments", timeout=5)
        depts = extract_data(r_dept)
        if r_dept.status_code == 200 and isinstance(depts, list) and len(depts) > 0:
            dept_101_id = depts[0].get("id")
            check("4. BFF Proxy: Departments Lookup", True, f"Found {len(depts)} departments, id={dept_101_id}")
        else:
            check("4. BFF Proxy: Departments Lookup", False, f"Status {r_dept.status_code}")
    except Exception as e:
        check("4. BFF Proxy: Departments Lookup", False, str(e))

    # 5. BFF Proxy: Fetch Designations lookup (Flyway V4 seeded workforce)
    nurse_desig_id = None
    try:
        r_desig = sa_session.get(f"{BFF_URL}/api/proxy/api/v1/designations", timeout=5)
        desigs = extract_data(r_desig)
        if r_desig.status_code == 200 and isinstance(desigs, list) and len(desigs) > 0:
            for d in desigs:
                if d.get("code") == "NURSE":
                    nurse_desig_id = d.get("id")
            check("5. BFF Proxy: Workforce Designations Lookup", True, f"Found {len(desigs)} designations, nurseDesigId={nurse_desig_id}")
        else:
            check("5. BFF Proxy: Workforce Designations Lookup", False, f"Status {r_desig.status_code}")
    except Exception as e:
        check("5. BFF Proxy: Workforce Designations Lookup", False, str(e))

    if not nurse_desig_id:
        nurse_desig_id = 1

    # 6. Live Staff Onboarding via BFF
    ts = int(time.time())
    nurse_email = f"ui.nurse.{ts}@swarnikacare.com"
    nurse_code = f"UI-NUR-{ts % 100000}"
    nurse_emp_id = None

    onboard_payload = {
        "email": nurse_email,
        "role": "NURSE",
        "employeeCode": nurse_code,
        "hospitalId": hosp_101_id or 101,
        "departmentId": dept_101_id,
        "designationId": nurse_desig_id,
        "employmentType": "FULL_TIME",
        "joiningDate": "2026-03-26",
        "notes": "Onboarded via Next.js BFF"
    }

    try:
        r_onboard = sa_session.post(
            f"{BFF_URL}/api/proxy/api/v1/employees/onboard",
            json=onboard_payload,
            timeout=10
        )
        if r_onboard.status_code in (200, 201):
            data = extract_data(r_onboard)
            nurse_emp_id = data.get("id")
            check("6. Live Onboarding via BFF: IAM Provisioning + Employee Creation",
                  data.get("role") == "NURSE" and data.get("employeeCode") == nurse_code,
                  f"empId={nurse_emp_id}, userId={data.get('userId')}, role={data.get('role')}")
        else:
            check("6. Live Onboarding via BFF: IAM Provisioning + Employee Creation", False,
                  f"Status {r_onboard.status_code}: {r_onboard.text}")
    except Exception as e:
        check("6. Live Onboarding via BFF: IAM Provisioning + Employee Creation", False, str(e))

    # 7. Staff Directory Composite API via BFF
    try:
        r_dir = sa_session.get(f"{BFF_URL}/api/proxy/api/v1/employees/directory?hospitalId={hosp_101_id or 101}", timeout=10)
        staff_list = extract_data(r_dir)
        if r_dir.status_code == 200 and isinstance(staff_list, list):
            sample = next((s for s in staff_list if s.get("employeeCode") == nurse_code), None)
            check("7. Staff Directory via BFF (Composite Org + IAM)",
                  sample is not None and sample.get("email") == nurse_email and sample.get("role") == "NURSE",
                  f"Total: {len(staff_list)}, verified sample code={nurse_code}, role={sample.get('role') if sample else 'N/A'}")
        else:
            check("7. Staff Directory via BFF (Composite Org + IAM)", False, f"Status {r_dir.status_code}")
    except Exception as e:
        check("7. Staff Directory via BFF (Composite Org + IAM)", False, str(e))

    # 8. Filter Directory by Role via BFF
    try:
        r_role_filter = sa_session.get(f"{BFF_URL}/api/proxy/api/v1/employees/directory?role=NURSE", timeout=10)
        nurses = extract_data(r_role_filter)
        if r_role_filter.status_code == 200 and isinstance(nurses, list):
            all_nurses = all(n.get("role") == "NURSE" for n in nurses)
            check("8. Filter Directory by Role (NURSE) via BFF",
                  all_nurses and any(n.get("employeeCode") == nurse_code for n in nurses),
                  f"Found {len(nurses)} nurses, all role=NURSE: {all_nurses}")
        else:
            check("8. Filter Directory by Role (NURSE) via BFF", False, f"Status {r_role_filter.status_code}")
    except Exception as e:
        check("8. Filter Directory by Role (NURSE) via BFF", False, str(e))

    # 9. Search Directory via BFF
    try:
        r_search = sa_session.get(f"{BFF_URL}/api/proxy/api/v1/employees/directory?search={nurse_code}", timeout=10)
        searched = extract_data(r_search)
        if r_search.status_code == 200 and isinstance(searched, list):
            check("9. Search Directory via BFF",
                  any(s.get("employeeCode") == nurse_code for s in searched),
                  f"Found {len(searched)} records matching '{nurse_code}'")
        else:
            check("9. Search Directory via BFF", False, f"Status {r_search.status_code}")
    except Exception as e:
        check("9. Search Directory via BFF", False, str(e))

    # 10. Staff Details API via BFF
    if nurse_emp_id:
        try:
            r_detail = sa_session.get(f"{BFF_URL}/api/proxy/api/v1/employees/{nurse_emp_id}", timeout=5)
            det = extract_data(r_detail)
            check("10. Staff Detail API via BFF (GET /employees/{id})",
                  r_detail.status_code == 200 and det.get("employeeCode") == nurse_code,
                  f"code={det.get('employeeCode') if det else 'N/A'}, email={det.get('email') if det else 'N/A'}")
        except Exception as e:
            check("10. Staff Detail API via BFF (GET /employees/{id})", False, str(e))
    else:
        check("10. Staff Detail API via BFF (GET /employees/{id})", False, "No nurse id")

    # 11. Staff Update API via BFF
    if nurse_emp_id:
        try:
            upd_payload = {
                "departmentId": dept_101_id,
                "designationId": nurse_desig_id,
                "employmentType": "CONTRACT"
            }
            r_upd = sa_session.put(f"{BFF_URL}/api/proxy/api/v1/employees/{nurse_emp_id}", json=upd_payload, timeout=5)
            upd_data = extract_data(r_upd)
            check("11. Staff Update API via BFF (PUT /employees/{id})",
                  r_upd.status_code == 200 and upd_data.get("employmentType") == "CONTRACT",
                  f"employmentType={upd_data.get('employmentType') if upd_data else 'N/A'}")
        except Exception as e:
            check("11. Staff Update API via BFF (PUT /employees/{id})", False, str(e))
    else:
        check("11. Staff Update API via BFF (PUT /employees/{id})", False, "No nurse id")

    # 12. Staff Status Mutation via BFF
    if nurse_emp_id:
        try:
            r_status = sa_session.patch(
                f"{BFF_URL}/api/proxy/api/v1/employees/{nurse_emp_id}/status",
                json={"status": "ON_LEAVE"},
                timeout=5
            )
            s_data = extract_data(r_status)
            check("12. Staff Status Mutation via BFF (PATCH -> ON_LEAVE)",
                  r_status.status_code == 200 and s_data.get("status") == "ON_LEAVE",
                  f"status={s_data.get('status') if s_data else 'N/A'}")
            
            # Revert to ACTIVE
            sa_session.patch(
                f"{BFF_URL}/api/proxy/api/v1/employees/{nurse_emp_id}/status",
                json={"status": "ACTIVE"},
                timeout=5
            )
        except Exception as e:
            check("12. Staff Status Mutation via BFF (PATCH -> ON_LEAVE)", False, str(e))
    else:
        check("12. Staff Status Mutation via BFF (PATCH -> ON_LEAVE)", False, "No nurse id")

    # 13. Security: Hospital Scoping Enforcement via BFF
    try:
        r_ha_forbidden = ha_session.get(f"{BFF_URL}/api/proxy/api/v1/employees/directory?hospitalId=102", timeout=5)
        check("13. Hospital Scoping: Hospital 101 Admin Cannot Access Hospital 102 via BFF",
              r_ha_forbidden.status_code == 403,
              f"Status {r_ha_forbidden.status_code} (expected 403)")
    except Exception as e:
        check("13. Hospital Scoping: Hospital 101 Admin Cannot Access Hospital 102 via BFF", False, str(e))

    # 14. Staff Soft Deactivation via BFF
    if nurse_emp_id:
        try:
            r_deact = sa_session.delete(f"{BFF_URL}/api/proxy/api/v1/employees/{nurse_emp_id}", timeout=5)
            if r_deact.status_code == 200:
                r_verify = sa_session.get(f"{BFF_URL}/api/proxy/api/v1/employees/{nurse_emp_id}", timeout=5)
                v_data = extract_data(r_verify)
                check("14. Staff Deactivation via BFF (DELETE -> INACTIVE)",
                      r_verify.status_code == 200 and v_data.get("status") == "INACTIVE",
                      f"status={v_data.get('status') if v_data else 'N/A'}")
            else:
                check("14. Staff Deactivation via BFF (DELETE -> INACTIVE)", False, f"Status {r_deact.status_code}")
        except Exception as e:
            check("14. Staff Deactivation via BFF (DELETE -> INACTIVE)", False, str(e))
    else:
        check("14. Staff Deactivation via BFF (DELETE -> INACTIVE)", False, "No nurse id")

    print("\n" + "=" * 80)
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    print(f"STEP 5 PHASE 2 E2E SUMMARY: {passed}/{total} CHECKS PASSED ({(passed/total)*100:.1f}%)")
    print("=" * 80)

    if passed == total:
        print(">>> ALL STEP 5 PHASE 2 STAFF UI & BFF INTEGRATION CHECKS PASSED! <<<")
        return 0
    else:
        print(">>> SOME CHECKS FAILED. INVESTIGATE LOGS ABOVE. <<<")
        return 1

if __name__ == "__main__":
    sys.exit(run_tests())
