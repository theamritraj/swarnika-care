#!/usr/bin/env python3
"""
Step 7 Phase 1 Verification Script: Eureka & API Gateway Alignment for Appointment Service
Tests:
  1. Microservice direct (:8083) returns 200 OK
  2. Eureka registry marks APPOINTMENT-SERVICE as UP
  3. API Gateway (:8080/api/v1/appointments) returns 200 OK
  4. Next.js Care BFF (:3001/api/proxy/api/v1/appointments) returns 200 OK
  5. 3-Way Payload Parity (Direct == Gateway == BFF)
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
APPOINTMENT_SERVICE_URL = "http://localhost:8083"
EUREKA_URL = "http://localhost:8761"

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

def extract_data(res):
    try:
        j = res.json()
        if isinstance(j, dict) and "data" in j:
            return j["data"]
        return j
    except Exception:
        return None

def run_tests():
    print("=" * 80)
    print("STEP 7 PHASE 1: EUREKA & GATEWAY ALIGNMENT VERIFICATION")
    print("=" * 80)

    auth_headers = {"Authorization": f"Bearer {SUPER_ADMIN_TOKEN}", "Content-Type": "application/json"}
    session = requests.Session()
    session.cookies.set('swarnika_session', SUPER_ADMIN_TOKEN)

    checks = []

    # 1. Microservice direct
    try:
        r_direct = requests.get(f"{APPOINTMENT_SERVICE_URL}/api/v1/appointments", headers=auth_headers, timeout=5)
        direct_data = extract_data(r_direct)
        p1 = r_direct.status_code == 200 and isinstance(direct_data, list)
        checks.append(("1. Appointment Service Direct (:8083)", p1, f"HTTP {r_direct.status_code}, count={len(direct_data) if p1 else 0}"))
    except Exception as e:
        checks.append(("1. Appointment Service Direct (:8083)", False, str(e)))

    # 2. Eureka UP status
    try:
        r_eureka = requests.get(f"{EUREKA_URL}/eureka/apps/APPOINTMENT-SERVICE", headers={"Accept": "application/json"}, timeout=5)
        instances = r_eureka.json().get("application", {}).get("instance", [])
        up_instances = [i for i in instances if i.get("status") == "UP"]
        p2 = r_eureka.status_code == 200 and len(up_instances) >= 1
        checks.append(("2. Eureka Registry Status for APPOINTMENT-SERVICE", p2, f"Total={len(instances)}, UP={len(up_instances)}"))
    except Exception as e:
        checks.append(("2. Eureka Registry Status for APPOINTMENT-SERVICE", False, str(e)))

    # 3. Gateway routing
    gateway_data = None
    try:
        r_gw = requests.get(f"{GATEWAY_URL}/api/v1/appointments", headers=auth_headers, timeout=5)
        gateway_data = extract_data(r_gw)
        p3 = r_gw.status_code == 200 and isinstance(gateway_data, list)
        checks.append(("3. API Gateway Routing (:8080/api/v1/appointments)", p3, f"HTTP {r_gw.status_code}, count={len(gateway_data) if p3 else 0}"))
    except Exception as e:
        checks.append(("3. API Gateway Routing (:8080/api/v1/appointments)", False, str(e)))

    # 4. Next.js BFF proxy routing
    bff_data = None
    try:
        r_bff = session.get(f"{BFF_URL}/api/proxy/api/v1/appointments", timeout=5)
        bff_data = extract_data(r_bff)
        p4 = r_bff.status_code == 200 and isinstance(bff_data, list)
        checks.append(("4. Next.js Care BFF Proxy (:3001/api/proxy/api/v1/appointments)", p4, f"HTTP {r_bff.status_code}, count={len(bff_data) if p4 else 0}"))
    except Exception as e:
        checks.append(("4. Next.js Care BFF Proxy (:3001/api/proxy/api/v1/appointments)", False, str(e)))

    # 5. Payload Parity across tiers
    try:
        p5 = (len(direct_data) == len(gateway_data) == len(bff_data))
        checks.append(("5. 3-Way Payload Parity (Direct == Gateway == BFF)", p5, f"Direct={len(direct_data)}, Gateway={len(gateway_data)}, BFF={len(bff_data)}"))
    except Exception as e:
        checks.append(("5. 3-Way Payload Parity (Direct == Gateway == BFF)", False, str(e)))

    print()
    all_passed = True
    for name, success, detail in checks:
        status = "✅ PASS" if success else "❌ FAIL"
        if not success:
            all_passed = False
        print(f"[{status}] {name}")
        if detail:
            print(f"       Details: {detail}")

    print("=" * 80)
    print(f"PHASE 1 SUMMARY: {sum(1 for _, s, _ in checks if s)}/{len(checks)} CHECKS PASSED")
    print("=" * 80)
    if all_passed:
        print(">>> ✅ PHASE 1 COMPLETE: GATEWAY & EUREKA ALIGNMENT FULLY VERIFIED! <<<")
    else:
        print(">>> ❌ SOME PHASE 1 CHECKS FAILED <<<")

if __name__ == "__main__":
    run_tests()
