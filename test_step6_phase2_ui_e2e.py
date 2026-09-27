#!/usr/bin/env python3
"""
Step 6 Phase 2 E2E Verification Script: Super Admin Patient Directory UI & BFF Integration
Tests the full chain:
  Client / Browser -> Next.js BFF (:3001) -> API Gateway (:8080) -> Patient Service (:8088) -> MySQL (patient_db)
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
PATIENT_SERVICE_URL = "http://localhost:8088"

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
    print("STEP 6 PHASE 2: SUPER ADMIN PATIENT DIRECTORY UI & BFF E2E VERIFICATION")
    print("=" * 80)

    # Setup Session with Super Admin JWT
    sa_session = requests.Session()
    sa_session.cookies.set('swarnika_session', SUPER_ADMIN_TOKEN)

    # 1. Route Protection: Unauthenticated access redirects to /login
    try:
        r_unauth = requests.get(f"{BFF_URL}/admin/patients", allow_redirects=False, timeout=5)
        check("1. Route Protection: Unauthenticated Access Redirects to /login",
              r_unauth.status_code in (302, 307, 401),
              f"Status {r_unauth.status_code}")
    except Exception as e:
        check("1. Route Protection: Unauthenticated Access Redirects to /login", False, str(e))

    # 2. Page Rendering: Authenticated Super Admin loads /admin/patients
    try:
        r_page = sa_session.get(f"{BFF_URL}/admin/patients", timeout=10)
        check("2. Page Rendering: /admin/patients loads 200 OK",
              r_page.status_code == 200 and "Patient Directory" in r_page.text and "Master Patient Index" in r_page.text,
              f"Status {r_page.status_code}")
    except Exception as e:
        check("2. Page Rendering: /admin/patients loads 200 OK", False, str(e))

    # 3. BFF Proxy: Fetch Patient Directory from patient-service
    patient_count = 0
    try:
        r_patients = sa_session.get(f"{BFF_URL}/api/proxy/api/v1/patients", timeout=10)
        patients_list = extract_data(r_patients)
        if r_patients.status_code == 200 and isinstance(patients_list, list) and len(patients_list) > 0:
            patient_count = len(patients_list)
            sample = patients_list[0]
            check("3. BFF Proxy: Real Patient Directory Fetch",
                  bool(sample.get("mrn")) and bool(sample.get("firstName")),
                  f"Retrieved {patient_count} patients from patient_db. Sample MRN: {sample.get('mrn')}")
        else:
            check("3. BFF Proxy: Real Patient Directory Fetch", False, f"Status {r_patients.status_code}")
    except Exception as e:
        check("3. BFF Proxy: Real Patient Directory Fetch", False, str(e))

    # 4. Live Patient Registration via BFF
    ts = int(time.time())
    patient_email = f"patient.test.{ts}@swarnikacare.com"
    patient_phone = f"+91 98{ts % 10000000:08d}"
    registered_patient_id = None
    registered_mrn = None

    reg_payload = {
        "firstName": "Aarav",
        "lastName": f"Verma_{ts % 10000}",
        "email": patient_email,
        "phone": patient_phone,
        "dateOfBirth": "1994-06-12",
        "gender": "MALE",
        "bloodGroup": "O+",
        "address": "42 MG Road, Bengaluru, Karnataka",
        "emergencyContact": "Sunita Verma (+91 9123456780)",
        "hospitalId": 101
    }

    try:
        r_reg = sa_session.post(f"{BFF_URL}/api/proxy/api/v1/patients", json=reg_payload, timeout=10)
        if r_reg.status_code in (200, 201):
            created_data = extract_data(r_reg)
            registered_patient_id = created_data.get("id")
            registered_mrn = created_data.get("mrn")
            check("4. Live Patient Registration via BFF: MRN Generation & Auto-Hospital Deployment",
                  bool(registered_patient_id) and registered_mrn.startswith("MRN-") and created_data.get("email") == patient_email,
                  f"Patient #{registered_patient_id} created with MRN: {registered_mrn}")
        else:
            check("4. Live Patient Registration via BFF: MRN Generation & Auto-Hospital Deployment", False,
                  f"Status {r_reg.status_code}: {r_reg.text}")
    except Exception as e:
        check("4. Live Patient Registration via BFF: MRN Generation & Auto-Hospital Deployment", False, str(e))

    # 5. Fetch Single Patient Detail via BFF
    if registered_patient_id:
        try:
            r_det = sa_session.get(f"{BFF_URL}/api/proxy/api/v1/patients/{registered_patient_id}", timeout=5)
            det_data = extract_data(r_det)
            check("5. Patient Detail Fetch via BFF (GET /patients/{id})",
                  r_det.status_code == 200 and det_data.get("mrn") == registered_mrn,
                  f"MRN={det_data.get('mrn')}, Name={det_data.get('firstName')} {det_data.get('lastName')}, BloodGroup={det_data.get('bloodGroup')}")
        except Exception as e:
            check("5. Patient Detail Fetch via BFF (GET /patients/{id})", False, str(e))
    else:
        check("5. Patient Detail Fetch via BFF (GET /patients/{id})", False, "No patient id")

    # 6. Update Patient Demographics via BFF
    if registered_patient_id:
        try:
            upd_payload = {
                "firstName": "Aarav",
                "lastName": f"Verma_{ts % 10000}",
                "email": patient_email,
                "phone": "+91 9988776655",
                "dateOfBirth": "1994-06-12",
                "gender": "MALE",
                "bloodGroup": "B+",
                "address": "99 Residency Road, Bengaluru, Karnataka",
                "emergencyContact": "Sunita Verma (Spouse) - +91 9123456780",
                "status": "ACTIVE"
            }
            r_upd = sa_session.put(f"{BFF_URL}/api/proxy/api/v1/patients/{registered_patient_id}", json=upd_payload, timeout=5)
            upd_data = extract_data(r_upd)
            check("6. Update Patient Demographics via BFF (PUT /patients/{id})",
                  r_upd.status_code == 200 and upd_data.get("bloodGroup") == "B+" and upd_data.get("phone") == "+91 9988776655",
                  f"Updated BloodGroup={upd_data.get('bloodGroup')}, Address={upd_data.get('address')}")
        except Exception as e:
            check("6. Update Patient Demographics via BFF (PUT /patients/{id})", False, str(e))
    else:
        check("6. Update Patient Demographics via BFF (PUT /patients/{id})", False, "No patient id")

    # 7. Multi-Hospital Registration via BFF
    if registered_patient_id:
        try:
            hosp_reg_payload = {
                "hospitalId": 102,
                "registrationDate": "2026-03-26"
            }
            r_hosp_reg = sa_session.post(
                f"{BFF_URL}/api/proxy/api/v1/patients/{registered_patient_id}/registrations",
                json=hosp_reg_payload,
                timeout=5
            )
            hosp_reg_data = extract_data(r_hosp_reg)
            check("7. Multi-Hospital Registration via BFF (Hospital 102)",
                  r_hosp_reg.status_code in (200, 201) and hosp_reg_data.get("registrationNumber").startswith("REG-H102-"),
                  f"Registration Number: {hosp_reg_data.get('registrationNumber')}")
        except Exception as e:
            check("7. Multi-Hospital Registration via BFF (Hospital 102)", False, str(e))
    else:
        check("7. Multi-Hospital Registration via BFF (Hospital 102)", False, "No patient id")

    # 8. Query Hospital Registrations List for Patient via BFF
    if registered_patient_id:
        try:
            r_regs = sa_session.get(f"{BFF_URL}/api/proxy/api/v1/patients/{registered_patient_id}/registrations", timeout=5)
            regs_list = extract_data(r_regs)
            hosp_ids = [r.get("hospitalId") for r in regs_list] if isinstance(regs_list, list) else []
            check("8. Query Hospital Deployments for Patient via BFF",
                  101 in hosp_ids and 102 in hosp_ids,
                  f"Registered at hospitals: {hosp_ids}")
        except Exception as e:
            check("8. Query Hospital Deployments for Patient via BFF", False, str(e))
    else:
        check("8. Query Hospital Deployments for Patient via BFF", False, "No patient id")

    # 9. Register a Second Patient (Child) for Family Linkage
    child_patient_id = None
    child_mrn = None
    try:
        child_payload = {
            "firstName": "Kabir",
            "lastName": f"Verma_{ts % 10000}",
            "email": f"kabir.{ts}@swarnikacare.com",
            "phone": patient_phone,
            "dateOfBirth": "2024-01-15",
            "gender": "MALE",
            "bloodGroup": "O+",
            "address": "42 MG Road, Bengaluru",
            "emergencyContact": "Aarav Verma (Father)"
        }
        r_child = sa_session.post(f"{BFF_URL}/api/proxy/api/v1/patients", json=child_payload, timeout=5)
        if r_child.status_code in (200, 201):
            c_data = extract_data(r_child)
            child_patient_id = c_data.get("id")
            child_mrn = c_data.get("mrn")
            check("9. Secondary Patient Creation for Family Linkage", True, f"Child #{child_patient_id} ({child_mrn})")
        else:
            check("9. Secondary Patient Creation for Family Linkage", False, f"Status {r_child.status_code}")
    except Exception as e:
        check("9. Secondary Patient Creation for Family Linkage", False, str(e))

    # 10. Establish Family Relationship Link via BFF
    rel_id = None
    if registered_patient_id and child_patient_id:
        try:
            rel_payload = {
                "targetPatientId": child_patient_id,
                "relationshipType": "FATHER_OF",
                "notes": "Biological child"
            }
            r_rel = sa_session.post(
                f"{BFF_URL}/api/proxy/api/v1/patients/{registered_patient_id}/relationships",
                json=rel_payload,
                timeout=5
            )
            rel_data = extract_data(r_rel)
            if r_rel.status_code in (200, 201):
                rel_id = rel_data.get("id")
                check("10. Establish Family Relationship Link via BFF (FATHER_OF)",
                      rel_data.get("relationshipType") == "FATHER_OF" and rel_data.get("targetPatientId") == child_patient_id,
                      f"Relationship ID #{rel_id}: Aarav -> Kabir ({rel_data.get('relationshipType')})")
            else:
                check("10. Establish Family Relationship Link via BFF (FATHER_OF)", False, f"Status {r_rel.status_code}")
        except Exception as e:
            check("10. Establish Family Relationship Link via BFF (FATHER_OF)", False, str(e))
    else:
        check("10. Establish Family Relationship Link via BFF (FATHER_OF)", False, "Missing parent or child id")

    # 11. Query Patient Relationships List via BFF
    if registered_patient_id and rel_id:
        try:
            r_rels = sa_session.get(f"{BFF_URL}/api/proxy/api/v1/patients/{registered_patient_id}/relationships", timeout=5)
            rels_list = extract_data(r_rels)
            sample_rel = next((r for r in rels_list if r.get("id") == rel_id), None)
            check("11. Query Relationships List with Enriched Names via BFF",
                  sample_rel is not None and sample_rel.get("targetPatientFirstName") == "Kabir",
                  f"Found {len(rels_list)} relations, target name={sample_rel.get('targetPatientFirstName') if sample_rel else 'N/A'}")
        except Exception as e:
            check("11. Query Relationships List with Enriched Names via BFF", False, str(e))
    else:
        check("11. Query Relationships List with Enriched Names via BFF", False, "Missing rel id")

    # 12. Negative Test: Duplicate Email Protection (409 Conflict)
    try:
        dup_email_payload = {
            "firstName": "Duplicate",
            "lastName": "User",
            "email": patient_email, # duplicate
            "phone": "+91 9111122222"
        }
        r_dup = sa_session.post(f"{BFF_URL}/api/proxy/api/v1/patients", json=dup_email_payload, timeout=5)
        check("12. Duplicate Email Protection (409 Conflict)",
              r_dup.status_code in (409, 400),
              f"Received expected conflict status: {r_dup.status_code}")
    except Exception as e:
        check("12. Duplicate Email Protection (409 Conflict)", False, str(e))

    # 13. Negative Test: Self-Relationship Protection (400 Bad Request)
    if registered_patient_id:
        try:
            self_rel_payload = {
                "targetPatientId": registered_patient_id, # self
                "relationshipType": "SPOUSE_OF"
            }
            r_self = sa_session.post(
                f"{BFF_URL}/api/proxy/api/v1/patients/{registered_patient_id}/relationships",
                json=self_rel_payload,
                timeout=5
            )
            check("13. Self-Relationship Protection (400 Bad Request)",
                  r_self.status_code in (400, 422),
                  f"Received expected rejection status: {r_self.status_code}")
        except Exception as e:
            check("13. Self-Relationship Protection (400 Bad Request)", False, str(e))
    else:
        check("13. Self-Relationship Protection (400 Bad Request)", False, "No patient id")

    # 14. Delete / Unlink Family Relationship via BFF
    if registered_patient_id and rel_id:
        try:
            r_del_rel = sa_session.delete(
                f"{BFF_URL}/api/proxy/api/v1/patients/{registered_patient_id}/relationships/{rel_id}",
                timeout=5
            )
            check("14. Unlink Relationship via BFF (DELETE)",
                  r_del_rel.status_code == 200,
                  f"Status {r_del_rel.status_code}")
        except Exception as e:
            check("14. Unlink Relationship via BFF (DELETE)", False, str(e))
    else:
        check("14. Unlink Relationship via BFF (DELETE)", False, "Missing rel id")

    print("\n" + "=" * 80)
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    print(f"STEP 6 PHASE 2 E2E SUMMARY: {passed}/{total} CHECKS PASSED ({(passed/total)*100:.1f}%)")
    print("=" * 80)

    if passed == total:
        print(">>> ALL STEP 6 PHASE 2 PATIENT UI & BFF INTEGRATION CHECKS PASSED! <<<")
        return 0
    else:
        print(">>> SOME CHECKS FAILED. INVESTIGATE LOGS ABOVE. <<<")
        return 1

if __name__ == "__main__":
    sys.exit(run_tests())
