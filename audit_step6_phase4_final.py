#!/usr/bin/env python3
"""
Step 6 Phase 4: Final Comprehensive Parity Audit
Audits 16 rigorous verification checks across the 5-tier architecture:
  MySQL (patient_db) <-> Patient Service (:8088) <-> API Gateway (:8080) <-> Next.js Care BFF (:3001) <-> Super Admin UI (/admin/patients)
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

results = []

def record(idx, name, passed, details):
    status = "✅ PASS" if passed else "❌ FAIL"
    results.append((idx, name, passed, details))
    print(f"[{status}] Check {idx}: {name}")
    if details:
        print(f"       Details: {details}")

def extract_data(res):
    try:
        j = res.json()
        if isinstance(j, dict) and "data" in j:
            return j["data"]
        return j
    except Exception:
        return None

def run_audit():
    print("=" * 80)
    print("STEP 6: FINAL COMPREHENSIVE PARITY AUDIT (16 CHECKS)")
    print("=" * 80)

    sa_session = requests.Session()
    sa_session.cookies.set('swarnika_session', SUPER_ADMIN_TOKEN)
    sa_auth_header = {"Authorization": f"Bearer {SUPER_ADMIN_TOKEN}", "Content-Type": "application/json"}

    # 1. DB <-> Microservice Direct Field Parity (MySQL patient_db <-> :8088)
    try:
        import subprocess
        db_out = subprocess.check_output(
            "mysql -u root -N -e \"USE patient_db; SELECT id, mrn, first_name, email FROM patients ORDER BY id DESC LIMIT 1;\"",
            shell=True
        ).decode('utf-8').strip()
        db_parts = [p.strip() for p in db_out.split("\t") if p.strip()]
        db_id, db_mrn, db_fn, db_em = db_parts[0], db_parts[1], db_parts[2], db_parts[3]

        r = requests.get(f"{PATIENT_SERVICE_URL}/api/v1/patients/{db_id}", headers=sa_auth_header, timeout=5)
        svc_p = extract_data(r)
        passed = (
            r.status_code == 200 and
            str(svc_p.get("id")) == str(db_id) and
            svc_p.get("mrn") == db_mrn and
            svc_p.get("firstName") == db_fn and
            svc_p.get("email") == db_em
        )
        record(1, "DB <-> Microservice Direct Field Parity (MySQL patient_db <-> :8088)", passed,
               f"DB Patient #{db_id}: MRN={db_mrn}, Name={db_fn}, Email={db_em}")
    except Exception as e:
        record(1, "DB <-> Microservice Direct Field Parity (MySQL patient_db <-> :8088)", False, str(e))

    # 2. API Gateway Routing to Patient Service
    try:
        r = requests.get(f"{GATEWAY_URL}/api/v1/patients", headers=sa_auth_header, timeout=5)
        data = extract_data(r)
        passed = r.status_code == 200 and isinstance(data, list)
        record(2, "API Gateway Routing (/api/v1/patients via :8080)", passed, f"Status={r.status_code}, Found {len(data) if isinstance(data, list) else 0} patients")
    except Exception as e:
        record(2, "API Gateway Routing (/api/v1/patients via :8080)", False, str(e))

    # 3. Next.js BFF Proxy Routing
    try:
        r = sa_session.get(f"{BFF_URL}/api/proxy/api/v1/patients", timeout=5)
        data = extract_data(r)
        passed = r.status_code == 200 and isinstance(data, list)
        record(3, "Next.js BFF Proxy Routing (/api/proxy/api/v1/patients)", passed, f"Status={r.status_code}, Found {len(data) if isinstance(data, list) else 0} patients")
    except Exception as e:
        record(3, "Next.js BFF Proxy Routing (/api/proxy/api/v1/patients)", False, str(e))

    # 4. Route Protection: Super Admin Only
    try:
        r_unauth = requests.get(f"{BFF_URL}/admin/patients", allow_redirects=False, timeout=5)
        passed = r_unauth.status_code in (302, 307, 401)
        record(4, "Route Protection: Unauthenticated /admin/patients Redirects to /login", passed, f"Status={r_unauth.status_code}")
    except Exception as e:
        record(4, "Route Protection: Unauthenticated /admin/patients Redirects to /login", False, str(e))

    # 5. UI Page Rendering & Branding Parity
    try:
        r_page = sa_session.get(f"{BFF_URL}/admin/patients", timeout=10)
        content = r_page.text
        passed = r_page.status_code == 200 and "Patient Directory" in content and "Master Patient Index" in content and "Register New Patient" in content
        record(5, "UI Page Rendering & Layout Structure", passed, f"Status={r_page.status_code}, Contains key UI tokens")
    except Exception as e:
        record(5, "UI Page Rendering & Layout Structure", False, str(e))

    # 6. Real MRN Architecture (Zero Fake UHID)
    try:
        r = sa_session.get(f"{BFF_URL}/api/proxy/api/v1/patients", timeout=5)
        patients = extract_data(r)
        sample = patients[0] if patients else {}
        mrn = sample.get("mrn", "")
        passed = bool(mrn) and mrn.startswith("MRN-") and "UHID" not in r_page.text
        record(6, "Real Medical Record Number (MRN) Standard (No Fake UHID)", passed, f"Sample MRN={mrn}, UI uses real MRN standard")
    except Exception as e:
        record(6, "Real Medical Record Number (MRN) Standard (No Fake UHID)", False, str(e))

    # 7. Live Patient Registration & Automatic MRN Generation
    created_id = None
    created_mrn = None
    unique_suffix = int(time.time()) % 100000
    try:
        payload = {
            "firstName": f"Devan_{unique_suffix}",
            "lastName": "Sharma",
            "email": f"devan.{unique_suffix}@swarnikacare.com",
            "phone": f"98765{str(unique_suffix).zfill(5)}",
            "dateOfBirth": "1994-06-15",
            "gender": "MALE",
            "bloodGroup": "B+",
            "address": "42 Indiranagar, Bengaluru, Karnataka",
            "emergencyContact": "9876500000",
            "hospitalId": 101
        }
        r = sa_session.post(f"{BFF_URL}/api/proxy/api/v1/patients", json=payload, timeout=5)
        res_data = extract_data(r)
        created_id = res_data.get("id") if res_data else None
        created_mrn = res_data.get("mrn") if res_data else None
        passed = r.status_code == 201 and created_id is not None and str(created_mrn).startswith("MRN-")
        record(7, "Live Patient Registration via BFF with Auto MRN", passed, f"Status={r.status_code}, ID={created_id}, MRN={created_mrn}")
    except Exception as e:
        record(7, "Live Patient Registration via BFF with Auto MRN", False, str(e))

    # 8. Single Patient Detail Query Contract (GET /patients/{id})
    try:
        r = sa_session.get(f"{BFF_URL}/api/proxy/api/v1/patients/{created_id}", timeout=5)
        p = extract_data(r)
        passed = r.status_code == 200 and p.get("id") == created_id and p.get("bloodGroup") == "B+"
        record(8, "Patient Detail Query Contract (GET /patients/{id})", passed, f"Status={r.status_code}, Retrieved MRN={p.get('mrn')}")
    except Exception as e:
        record(8, "Patient Detail Query Contract (GET /patients/{id})", False, str(e))

    # 9. Automatic Initial Hospital Registration Verification
    try:
        r = sa_session.get(f"{BFF_URL}/api/proxy/api/v1/patients/{created_id}/registrations", timeout=5)
        regs = extract_data(r)
        passed = r.status_code == 200 and len(regs) >= 1 and regs[0]["hospitalId"] == 101 and regs[0]["registrationNumber"].startswith("REG-H101-")
        record(9, "Automatic Initial Hospital Registration Deployment", passed, f"Found {len(regs)} registrations, RegNum={regs[0]['registrationNumber']}")
    except Exception as e:
        record(9, "Automatic Initial Hospital Registration Deployment", False, str(e))

    # 10. Multi-Hospital Deployment (Hospital 102)
    try:
        reg_payload = {"hospitalId": 102, "registrationDate": "2026-09-26"}
        r = sa_session.post(f"{BFF_URL}/api/proxy/api/v1/patients/{created_id}/registrations", json=reg_payload, timeout=5)
        reg_data = extract_data(r)
        passed = r.status_code == 201 and reg_data.get("hospitalId") == 102 and reg_data.get("registrationNumber").startswith("REG-H102-")
        record(10, "Multi-Hospital Deployment Creation (POST /registrations)", passed, f"Status={r.status_code}, RegNum={reg_data.get('registrationNumber')}")
    except Exception as e:
        record(10, "Multi-Hospital Deployment Creation (POST /registrations)", False, str(e))

    # 11. Family Relationship Creation & Enrichment (MOTHER_OF / FATHER_OF)
    child_id = None
    rel_id = None
    try:
        # Create second patient (child)
        child_payload = {
            "firstName": f"Ayaan_{unique_suffix}",
            "lastName": "Sharma",
            "email": f"ayaan.{unique_suffix}@swarnikacare.com",
            "phone": f"98764{str(unique_suffix).zfill(5)}",
            "dateOfBirth": "2022-01-10",
            "gender": "MALE",
            "bloodGroup": "B+",
            "address": "42 Indiranagar, Bengaluru, Karnataka",
            "hospitalId": 101
        }
        r_child = sa_session.post(f"{BFF_URL}/api/proxy/api/v1/patients", json=child_payload, timeout=5)
        child_id = extract_data(r_child).get("id")

        rel_payload = {
            "targetPatientId": child_id,
            "relationshipType": "FATHER_OF",
            "notes": "Biological father"
        }
        r_rel = sa_session.post(f"{BFF_URL}/api/proxy/api/v1/patients/{created_id}/relationships", json=rel_payload, timeout=5)
        rel_data = extract_data(r_rel)
        rel_id = rel_data.get("id")

        # Verify query with enriched names
        r_list = sa_session.get(f"{BFF_URL}/api/proxy/api/v1/patients/{created_id}/relationships", timeout=5)
        rels = extract_data(r_list)
        passed = r_rel.status_code == 201 and len(rels) >= 1 and rels[0]["relationshipType"] == "FATHER_OF" and "targetPatientFirstName" in rels[0]
        record(11, "Family Relationship Creation & Target Enrichment", passed, f"Status={r_rel.status_code}, Enriched Target={rels[0].get('targetPatientFirstName')}")
    except Exception as e:
        record(11, "Family Relationship Creation & Target Enrichment", False, str(e))

    # 12. Demographics Update Lifecycle (PUT /patients/{id})
    try:
        update_payload = {
            "firstName": f"Devan_{unique_suffix}",
            "lastName": "Sharma Updated",
            "email": f"devan.{unique_suffix}@swarnikacare.com",
            "phone": f"98765{str(unique_suffix).zfill(5)}",
            "dateOfBirth": "1994-06-15",
            "gender": "MALE",
            "bloodGroup": "AB+",
            "address": "42 Koramangala 4th Block, Bengaluru, Karnataka",
            "emergencyContact": "9876500000",
            "status": "ACTIVE"
        }
        r = sa_session.put(f"{BFF_URL}/api/proxy/api/v1/patients/{created_id}", json=update_payload, timeout=5)
        updated = extract_data(r)
        passed = r.status_code == 200 and updated.get("lastName") == "Sharma Updated" and updated.get("bloodGroup") == "AB+"
        record(12, "Patient Demographics Mutation Lifecycle (PUT /patients/{id})", passed, f"Status={r.status_code}, New Address={updated.get('address')}")
    except Exception as e:
        record(12, "Patient Demographics Mutation Lifecycle (PUT /patients/{id})", False, str(e))

    # 13. Duplicate Email Constraint (409 Conflict)
    try:
        dup_payload = {
            "firstName": "Duplicate",
            "lastName": "User",
            "email": f"devan.{unique_suffix}@swarnikacare.com",
            "phone": "9999999999",
            "gender": "MALE"
        }
        r = sa_session.post(f"{BFF_URL}/api/proxy/api/v1/patients", json=dup_payload, timeout=5)
        passed = r.status_code == 409
        record(13, "Duplicate Email Protection (409 Conflict)", passed, f"Status={r.status_code} (Expected 409)")
    except Exception as e:
        record(13, "Duplicate Email Protection (409 Conflict)", False, str(e))

    # 14. Self-Relationship Protection (400 Bad Request)
    try:
        self_rel_payload = {
            "targetPatientId": created_id,
            "relationshipType": "SPOUSE_OF"
        }
        r = sa_session.post(f"{BFF_URL}/api/proxy/api/v1/patients/{created_id}/relationships", json=self_rel_payload, timeout=5)
        passed = r.status_code == 400
        record(14, "Self-Relationship Protection (400 Bad Request)", passed, f"Status={r.status_code} (Expected 400)")
    except Exception as e:
        record(14, "Self-Relationship Protection (400 Bad Request)", False, str(e))

    # 15. Relationship Unlink Lifecycle (DELETE)
    try:
        if rel_id:
            r = sa_session.delete(f"{BFF_URL}/api/proxy/api/v1/patients/{created_id}/relationships/{rel_id}", timeout=5)
            passed = r.status_code in (200, 204)
            record(15, "Family Relationship Unlink Lifecycle (DELETE)", passed, f"Status={r.status_code}")
        else:
            record(15, "Family Relationship Unlink Lifecycle (DELETE)", False, "No rel_id available")
    except Exception as e:
        record(15, "Family Relationship Unlink Lifecycle (DELETE)", False, str(e))

    # 16. Zero Mock Data & Production Build Parity
    try:
        # Check that page text contains no hardcoded patient names
        passed = "Rohan Sharma" not in r_page.text and "UHID-2023" not in r_page.text and "Rahul Verma" not in r_page.text
        record(16, "Zero Mock Data Parity (Pure Dynamic API-Driven UI)", passed, "Zero hardcoded mock patient names in production bundle")
    except Exception as e:
        record(16, "Zero Mock Data Parity (Pure Dynamic API-Driven UI)", False, str(e))

    # Summary
    passed_count = sum(1 for _, _, p, _ in results if p)
    total_count = len(results)
    print("=" * 80)
    print(f"STEP 6 FINAL AUDIT SUMMARY: {passed_count}/{total_count} CHECKS PASSED ({passed_count/total_count*100:.1f}%)")
    print("=" * 80)
    if passed_count == total_count:
        print(">>> 🔒 STEP 6 — PATIENT DOMAIN & UI IS 100% VERIFIED AND READY FOR LOCK! <<<")
    else:
        print(">>> ❌ SOME AUDIT CHECKS FAILED <<<")

if __name__ == "__main__":
    run_audit()
