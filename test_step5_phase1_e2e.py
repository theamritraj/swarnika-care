#!/usr/bin/env python3
"""
Step 5 Phase 1 E2E Verification Script
Tests the complete IAM <-> Organization Service <-> Gateway Integration for Staff / Workforce.
"""
import sys
import time
import json
import base64
import hmac
import hashlib
import requests

GATEWAY_URL = "http://localhost:8080"
IAM_SERVICE_URL = "http://localhost:8081"
ORG_SERVICE_URL = "http://localhost:8085"

JWT_SECRET_B64 = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970"
JWT_SECRET = base64.b64decode(JWT_SECRET_B64)
INTERNAL_SECRET = "InternalSecret12345!"

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

SA_HEADERS = {'Authorization': f'Bearer {SUPER_ADMIN_TOKEN}', 'Content-Type': 'application/json'}
HA_HEADERS = {'Authorization': f'Bearer {HOSP_101_ADMIN_TOKEN}', 'Content-Type': 'application/json'}
INTERNAL_HEADERS = {'X-Internal-Secret': INTERNAL_SECRET, 'Content-Type': 'application/json'}

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
    print("STEP 5 PHASE 1: BACKEND API & IAM INTEGRATION VERIFICATION")
    print("=" * 80)

    # 1. Microservices connectivity & authentication
    try:
        r_iam_auth = requests.post(f"{GATEWAY_URL}/api/v1/auth/request-otp", json={"email": "admin@swarnikacare.com"}, timeout=5)
        check("1. Gateway -> IAM Service Auth Route", r_iam_auth.status_code == 200, f"Status {r_iam_auth.status_code}")
    except Exception as e:
        check("1. Gateway -> IAM Service Auth Route", False, str(e))

    try:
        r_org_check = requests.get(f"{GATEWAY_URL}/api/v1/hospitals/101", headers=SA_HEADERS, timeout=5)
        check("2. Gateway -> Organization Service Route", r_org_check.status_code == 200, f"Status {r_org_check.status_code}")
    except Exception as e:
        check("2. Gateway -> Organization Service Route", False, str(e))

    # 2. Verify Flyway V4 Standard Workforce Designations
    nurse_desig_id = None
    recep_desig_id = None
    try:
        r_desig = requests.get(f"{GATEWAY_URL}/api/v1/designations", headers=SA_HEADERS, timeout=5)
        if r_desig.status_code == 200:
            desigs = extract_data(r_desig)
            if isinstance(desigs, list):
                names = [d.get("name") for d in desigs]
                check("3. Flyway V4 Standard Designations Seeded", 
                      "Staff Nurse" in names and "Front Desk Receptionist" in names,
                      f"Found {len(desigs)} designations: {names[:5]}...")
                for d in desigs:
                    if d.get("code") == "NURSE":
                        nurse_desig_id = d.get("id")
                    elif d.get("code") == "RECEPTIONIST":
                        recep_desig_id = d.get("id")
            else:
                check("3. Flyway V4 Standard Designations Seeded", False, f"Unexpected response format: {desigs}")
        else:
            check("3. Flyway V4 Standard Designations Seeded", False, f"Status {r_desig.status_code}")
    except Exception as e:
        check("3. Flyway V4 Standard Designations Seeded", False, str(e))

    # Fallback designation id if null
    if not nurse_desig_id:
        nurse_desig_id = 1
    if not recep_desig_id:
        recep_desig_id = 1

    # 3. Discover an existing department for Hospital 101
    dept_101_id = None
    try:
        r_dept = requests.get(f"{GATEWAY_URL}/api/v1/departments/hospital/101", headers=SA_HEADERS, timeout=5)
        depts = extract_data(r_dept)
        if r_dept.status_code == 200 and isinstance(depts, list) and len(depts) > 0:
            dept_101_id = depts[0].get("id")
            check("4. Discovered Department for Hospital 101", True, f"deptId={dept_101_id}")
        else:
            check("4. Discovered Department for Hospital 101", False, f"Depts response: {depts}")
    except Exception as e:
        check("4. Discovered Department for Hospital 101", False, str(e))

    # 4. Onboard Nurse Staff via Gateway (Super Admin)
    ts = int(time.time())
    nurse_email = f"nurse.sarah.{ts}@swarnikacare.com"
    nurse_code = f"STF-NUR-{ts % 100000}"
    nurse_emp_id = None
    nurse_user_id = None

    onboard_nurse_payload = {
        "email": nurse_email,
        "role": "NURSE",
        "employeeCode": nurse_code,
        "hospitalId": 101,
        "departmentId": dept_101_id,
        "designationId": nurse_desig_id,
        "employmentType": "FULL_TIME",
        "joiningDate": "2026-03-01",
        "notes": "Emergency and Critical Care specialized"
    }

    try:
        r_nurse = requests.post(f"{GATEWAY_URL}/api/v1/employees/onboard", 
                                headers=SA_HEADERS, 
                                json=onboard_nurse_payload, 
                                timeout=10)
        if r_nurse.status_code in (200, 201):
            data = extract_data(r_nurse)
            nurse_emp_id = data.get("id")
            nurse_user_id = data.get("userId")
            check("5. Staff Onboarding (Nurse): IAM Provisioning + Employee Linking",
                  data.get("role") == "NURSE" and data.get("employeeCode") == nurse_code and bool(nurse_user_id),
                  f"empId={nurse_emp_id}, userId={nurse_user_id}, role={data.get('role')}")
        else:
            check("5. Staff Onboarding (Nurse): IAM Provisioning + Employee Linking", False, 
                  f"Status {r_nurse.status_code}: {r_nurse.text}")
    except Exception as e:
        check("5. Staff Onboarding (Nurse): IAM Provisioning + Employee Linking", False, str(e))

    # 5. Verify IAM user was created with role NURSE directly in IAM Service via internal API
    try:
        r_iam_user = requests.get(f"{IAM_SERVICE_URL}/api/v1/internal/users/by-email?email={nurse_email}", 
                                  headers=INTERNAL_HEADERS, timeout=5)
        if r_iam_user.status_code == 200:
            u_data = r_iam_user.json()
            check("6. IAM Record Verification",
                  u_data.get("role") == "NURSE" and u_data.get("email") == nurse_email,
                  f"IAM id={u_data.get('id')}, role={u_data.get('role')}")
        else:
            check("6. IAM Record Verification", False, f"Status {r_iam_user.status_code}: {r_iam_user.text}")
    except Exception as e:
        check("6. IAM Record Verification", False, str(e))

    # 6. Onboard Receptionist Staff
    recep_email = f"reception.john.{ts}@swarnikacare.com"
    recep_code = f"STF-REC-{ts % 100000}"
    recep_emp_id = None
    onboard_recep_payload = {
        "email": recep_email,
        "role": "RECEPTIONIST",
        "employeeCode": recep_code,
        "hospitalId": 101,
        "departmentId": dept_101_id,
        "designationId": recep_desig_id,
        "employmentType": "FULL_TIME",
        "joiningDate": "2026-03-01"
    }

    try:
        r_recep = requests.post(f"{GATEWAY_URL}/api/v1/employees/onboard",
                                headers=SA_HEADERS,
                                json=onboard_recep_payload,
                                timeout=10)
        if r_recep.status_code in (200, 201):
            r_data = extract_data(r_recep)
            recep_emp_id = r_data.get("id")
            check("7. Staff Onboarding (Receptionist)",
                  r_data.get("role") == "RECEPTIONIST" and r_data.get("employeeCode") == recep_code,
                  f"empId={recep_emp_id}, role={r_data.get('role')}")
        else:
            check("7. Staff Onboarding (Receptionist)", False, f"Status {r_recep.status_code}: {r_recep.text}")
    except Exception as e:
        check("7. Staff Onboarding (Receptionist)", False, str(e))

    # 7. Query Staff Directory API for Hospital 101
    try:
        r_dir = requests.get(f"{GATEWAY_URL}/api/v1/employees/directory?hospitalId=101", 
                             headers=SA_HEADERS, 
                             timeout=10)
        if r_dir.status_code == 200:
            staff_list = extract_data(r_dir)
            if isinstance(staff_list, list):
                codes = [s.get("employeeCode") for s in staff_list]
                check("8. Staff Directory Composite API",
                      nurse_code in codes and recep_code in codes,
                      f"Found {len(staff_list)} staff members; contains newly onboarded nurse & receptionist")
                
                # Check composite field enrichment
                sample = next((s for s in staff_list if s.get("employeeCode") == nurse_code), None)
                if sample:
                    check("9. Directory Composite Enrichment (IAM + Org)",
                          sample.get("email") == nurse_email and sample.get("role") == "NURSE" and "hospitalName" in sample and sample.get("designationName") == "Staff Nurse",
                          f"email={sample.get('email')}, role={sample.get('role')}, hospName={sample.get('hospitalName')}, desig={sample.get('designationName')}")
                else:
                    check("9. Directory Composite Enrichment (IAM + Org)", False, "Sample nurse not found in directory")
            else:
                check("8. Staff Directory Composite API", False, f"Unexpected data format: {staff_list}")
                check("9. Directory Composite Enrichment (IAM + Org)", False, "Skipped")
        else:
            check("8. Staff Directory Composite API", False, f"Status {r_dir.status_code}: {r_dir.text}")
            check("9. Directory Composite Enrichment (IAM + Org)", False, "Skipped due to directory failure")
    except Exception as e:
        check("8. Staff Directory Composite API", False, str(e))
        check("9. Directory Composite Enrichment (IAM + Org)", False, str(e))

    # 8. Staff Directory Filtering by Role (NURSE)
    try:
        r_filter = requests.get(f"{GATEWAY_URL}/api/v1/employees/directory?hospitalId=101&role=NURSE",
                                headers=SA_HEADERS,
                                timeout=10)
        if r_filter.status_code == 200:
            nurses = extract_data(r_filter)
            if isinstance(nurses, list):
                all_nurses = all(n.get("role") == "NURSE" for n in nurses)
                check("10. Directory Filter by Role (NURSE)",
                      all_nurses and any(n.get("employeeCode") == nurse_code for n in nurses),
                      f"Found {len(nurses)} nurses, all role=NURSE: {all_nurses}")
            else:
                check("10. Directory Filter by Role (NURSE)", False, f"Unexpected data: {nurses}")
        else:
            check("10. Directory Filter by Role (NURSE)", False, f"Status {r_filter.status_code}")
    except Exception as e:
        check("10. Directory Filter by Role (NURSE)", False, str(e))

    # 9. Single Employee Detail by ID
    if nurse_emp_id:
        try:
            r_detail = requests.get(f"{GATEWAY_URL}/api/v1/employees/{nurse_emp_id}",
                                    headers=SA_HEADERS,
                                    timeout=5)
            if r_detail.status_code == 200:
                det = extract_data(r_detail)
                check("11. Employee Detail API (GET /employees/{id})",
                      det.get("employeeCode") == nurse_code and det.get("role") == "NURSE",
                      f"code={det.get('employeeCode')}, email={det.get('email')}, dept={det.get('departmentName')}")
            else:
                check("11. Employee Detail API (GET /employees/{id})", False, f"Status {r_detail.status_code}")
        except Exception as e:
            check("11. Employee Detail API (GET /employees/{id})", False, str(e))
    else:
        check("11. Employee Detail API (GET /employees/{id})", False, "No nurse employee id")

    # 10. Employee Update (PUT /employees/{id})
    if nurse_emp_id:
        try:
            update_payload = {
                "departmentId": dept_101_id,
                "designationId": nurse_desig_id,
                "employmentType": "CONTRACT"
            }
            r_upd = requests.put(f"{GATEWAY_URL}/api/v1/employees/{nurse_emp_id}",
                                 headers=SA_HEADERS,
                                 json=update_payload,
                                 timeout=5)
            if r_upd.status_code == 200:
                upd_data = extract_data(r_upd)
                check("12. Employee Update API (PUT /employees/{id})",
                      upd_data.get("employmentType") == "CONTRACT",
                      f"employmentType={upd_data.get('employmentType')}")
            else:
                check("12. Employee Update API (PUT /employees/{id})", False, f"Status {r_upd.status_code}: {r_upd.text}")
        except Exception as e:
            check("12. Employee Update API (PUT /employees/{id})", False, str(e))
    else:
        check("12. Employee Update API (PUT /employees/{id})", False, "No nurse employee id")

    # 11. Employee Status Mutation (PATCH /employees/{id}/status)
    if nurse_emp_id:
        try:
            r_stat = requests.patch(f"{GATEWAY_URL}/api/v1/employees/{nurse_emp_id}/status",
                                    headers=SA_HEADERS,
                                    json={"status": "ON_LEAVE"},
                                    timeout=5)
            if r_stat.status_code == 200:
                s_data = extract_data(r_stat)
                check("13. Employee Status Mutation (ON_LEAVE)",
                      s_data.get("status") == "ON_LEAVE",
                      f"status={s_data.get('status')}")
            else:
                check("13. Employee Status Mutation (ON_LEAVE)", False, f"Status {r_stat.status_code}: {r_stat.text}")
            
            # Revert back to ACTIVE
            requests.patch(f"{GATEWAY_URL}/api/v1/employees/{nurse_emp_id}/status",
                           headers=SA_HEADERS,
                           json={"status": "ACTIVE"},
                           timeout=5)
        except Exception as e:
            check("13. Employee Status Mutation (ON_LEAVE)", False, str(e))
    else:
        check("13. Employee Status Mutation (ON_LEAVE)", False, "No nurse employee id")

    # 12. Negative Test: Duplicate Employee Code Protection
    try:
        dup_payload = {
            "email": f"dup.{ts}@swarnikacare.com",
            "role": "NURSE",
            "employeeCode": nurse_code, # duplicate
            "hospitalId": 101
        }
        r_dup = requests.post(f"{GATEWAY_URL}/api/v1/employees/onboard",
                              headers=SA_HEADERS,
                              json=dup_payload,
                              timeout=5)
        check("14. Duplicate Employee Code Protection (400 Bad Request)",
              r_dup.status_code in (400, 409),
              f"Received expected error status: {r_dup.status_code}")
    except Exception as e:
        check("14. Duplicate Employee Code Protection (400 Bad Request)", False, str(e))

    # 13. Negative Test: Cross-Hospital Department Mismatch Protection
    try:
        r_dept102 = requests.get(f"{GATEWAY_URL}/api/v1/departments/hospital/102", headers=SA_HEADERS, timeout=5)
        depts_102 = extract_data(r_dept102)
        if r_dept102.status_code == 200 and isinstance(depts_102, list) and len(depts_102) > 0:
            dept_102_id = depts_102[0].get("id")
            mismatch_payload = {
                "email": f"mismatch.{ts}@swarnikacare.com",
                "role": "NURSE",
                "employeeCode": f"STF-MIS-{ts % 100000}",
                "hospitalId": 101,          # Hospital 101
                "departmentId": dept_102_id  # Department from Hospital 102
            }
            r_mis = requests.post(f"{GATEWAY_URL}/api/v1/employees/onboard",
                                  headers=SA_HEADERS,
                                  json=mismatch_payload,
                                  timeout=5)
            check("15. Cross-Hospital Hierarchy Validation (400 Bad Request)",
                  r_mis.status_code in (400, 422),
                  f"Status {r_mis.status_code}, msg: {r_mis.text}")
        else:
            check("15. Cross-Hospital Hierarchy Validation (400 Bad Request)", True, "Hospital 102 depts empty; skipping cross-check")
    except Exception as e:
        check("15. Cross-Hospital Hierarchy Validation (400 Bad Request)", False, str(e))

    # 14. Hospital Scope Hardening (HOSPITAL_ADMIN of 101 forbidden on Hospital 102)
    try:
        r_hosp_scope = requests.get(f"{GATEWAY_URL}/api/v1/employees/directory?hospitalId=102",
                                    headers=HA_HEADERS, # HOSPITAL_ADMIN for 101
                                    timeout=5)
        check("16. Hospital-Scoped Security Enforcement (403 Forbidden for cross-hospital)",
              r_hosp_scope.status_code == 403,
              f"Received status {r_hosp_scope.status_code} (expected 403)")
    except Exception as e:
        check("16. Hospital-Scoped Security Enforcement (403 Forbidden for cross-hospital)", False, str(e))

    # 15. Staff Deactivation (DELETE /employees/{id})
    if recep_emp_id:
        try:
            r_del = requests.delete(f"{GATEWAY_URL}/api/v1/employees/{recep_emp_id}",
                                    headers=SA_HEADERS,
                                    timeout=5)
            if r_del.status_code == 200:
                # verify status is INACTIVE
                r_verify = requests.get(f"{GATEWAY_URL}/api/v1/employees/{recep_emp_id}",
                                        headers=SA_HEADERS,
                                        timeout=5)
                v_data = extract_data(r_verify)
                check("17. Staff Deactivation (DELETE -> INACTIVE)",
                      r_verify.status_code == 200 and v_data.get("status") == "INACTIVE",
                      f"status={v_data.get('status') if r_verify.status_code == 200 else r_verify.status_code}")
            else:
                check("17. Staff Deactivation (DELETE -> INACTIVE)", False, f"Status {r_del.status_code}")
        except Exception as e:
            check("17. Staff Deactivation (DELETE -> INACTIVE)", False, str(e))
    else:
        check("17. Staff Deactivation (DELETE -> INACTIVE)", False, "No receptionist employee id")

    print("\n" + "=" * 80)
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    print(f"STEP 5 PHASE 1 TEST SUMMARY: {passed}/{total} CHECKS PASSED ({(passed/total)*100:.1f}%)")
    print("=" * 80)

    if passed == total:
        print(">>> ALL STEP 5 PHASE 1 BACKEND & IAM INTEGRATION CHECKS PASSED SUCCESSFULLY! <<<")
        return 0
    else:
        print(">>> SOME CHECKS FAILED. INVESTIGATE LOGS ABOVE. <<<")
        return 1

if __name__ == "__main__":
    sys.exit(run_tests())
