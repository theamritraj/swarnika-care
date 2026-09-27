#!/usr/bin/env python3
"""
Step 4 Phase 2 Parity Audit:
Verifies 3-Way Parity: MySQL Database <-> API Gateway <-> Care BFF Proxy
"""
import sys
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

SUPER_ADMIN_TOKEN = generate_jwt("superadmin@swarnikacare.com", ["SUPER_ADMIN"], ["*"])
COOKIES = {'swarnika_session': SUPER_ADMIN_TOKEN}
HEADERS = {'Authorization': f'Bearer {SUPER_ADMIN_TOKEN}'}

def query_db(sql):
    cmd = f"mysql -u root -N -e \"USE doctor_db; {sql}\""
    return subprocess.check_output(cmd, shell=True).decode('utf-8').strip()

def run_parity_audit():
    print("=" * 70)
    print("      STEP 4 PHASE 2: 3-WAY DATA PARITY AUDIT")
    print("=" * 70)
    
    # 1. DB Count vs Gateway Count vs BFF Count
    db_count = int(query_db("SELECT count(*) FROM doctors;"))
    print(f"[DB] Total doctors in doctor_db: {db_count}")
    
    gw_res = requests.get(f"{GATEWAY_URL}/api/v1/doctors/directory", headers=HEADERS)
    assert gw_res.status_code == 200, f"Gateway returned {gw_res.status_code}"
    gw_doctors = gw_res.json().get("data", [])
    print(f"[Gateway] Total doctors returned: {len(gw_doctors)}")
    
    bff_res = requests.get(f"{CARE_URL}/api/proxy/api/v1/doctors/directory", cookies=COOKIES)
    assert bff_res.status_code == 200, f"BFF returned {bff_res.status_code}"
    bff_doctors = bff_res.json().get("data", [])
    print(f"[BFF Proxy] Total doctors returned: {len(bff_doctors)}")
    
    assert db_count == len(gw_doctors) == len(bff_doctors), \
        f"Mismatch: DB={db_count}, Gateway={len(gw_doctors)}, BFF={len(bff_doctors)}"
    print("  ✓ Total Doctor counts match 100% across DB, Gateway, and BFF.")
    
    # 2. Check Assignments Count across all doctors
    db_assignments_count = int(query_db("SELECT count(*) FROM doctor_hospital_assignments;"))
    print(f"\n[DB] Total assignments in doctor_hospital_assignments: {db_assignments_count}")
    
    gw_assignments_count = sum(len(d.get("assignments", [])) for d in gw_doctors)
    bff_assignments_count = sum(len(d.get("assignments", [])) for d in bff_doctors)
    print(f"[Gateway] Total assignments aggregated across doctors: {gw_assignments_count}")
    print(f"[BFF Proxy] Total assignments aggregated across doctors: {bff_assignments_count}")
    
    assert db_assignments_count == gw_assignments_count == bff_assignments_count, \
        f"Assignment mismatch: DB={db_assignments_count}, Gateway={gw_assignments_count}, BFF={bff_assignments_count}"
    print("  ✓ Assignments match 100% across DB, Gateway, and BFF.")
    
    # 3. Individual field parity check on Doctor 1
    doc1_db_name = query_db("SELECT concat(first_name, ' ', last_name) FROM doctors WHERE id=1;")
    doc1_db_email = query_db("SELECT email FROM doctors WHERE id=1;")
    doc1_gw = next(d for d in gw_doctors if d.get("id") == 1)
    doc1_bff = next(d for d in bff_doctors if d.get("id") == 1)
    
    print(f"\n[Field Parity Check: Doctor 1]")
    print(f"  DB Name:    {doc1_db_name}")
    print(f"  Gateway:    {doc1_gw.get('firstName')} {doc1_gw.get('lastName')} ({doc1_gw.get('email')})")
    print(f"  BFF:        {doc1_bff.get('firstName')} {doc1_bff.get('lastName')} ({doc1_bff.get('email')})")
    
    assert f"{doc1_gw.get('firstName')} {doc1_gw.get('lastName')}" == doc1_db_name
    assert f"{doc1_bff.get('firstName')} {doc1_bff.get('lastName')}" == doc1_db_name
    assert doc1_gw.get('email') == doc1_db_email
    assert doc1_bff.get('email') == doc1_db_email
    print("  ✓ Doctor 1 identity details match exactly across all layers.")
    
    print("\n" + "=" * 70)
    print("  ALL 3-WAY PARITY CHECKS PASSED WITH ZERO DISCREPANCIES (100%)")
    print("=" * 70)
    return True

if __name__ == "__main__":
    success = run_parity_audit()
    sys.exit(0 if success else 1)
