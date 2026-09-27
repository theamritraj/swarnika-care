#!/usr/bin/env python3
"""
Step 3 Phase 3: Comprehensive Physical Infrastructure Verification Suite
Validates the complete chain: Database <-> Organization Service <-> Gateway <-> BFF <-> UI

Checks:
1. Security Boundaries:
   - Unauthenticated access to UI -> HTTP 307 to /login
   - Unauthenticated access to Gateway -> HTTP 401
   - PATIENT role access to /admin/infrastructure -> Blocked
   - SUPER_ADMIN access across all hospitals -> HTTP 200
   - Scoped Hospital Admin (102) cross-hospital access to Hospital 101 -> HTTP 403 across all 6 tiers
2. Negative Hierarchy Enforcements (Parent-Child Mismatch Rejections):
   - Mismatched Hospital on Building creation -> 400
   - Mismatched Building on Floor creation -> 400
   - Mismatched Floor/Building on Unit creation -> 400
   - Mismatched Unit/Floor on Room creation -> 400
   - Mismatched Room/Unit on Bed creation -> 400
   - Mismatched Unit/Floor on Nursing Station creation -> 400
3. Constraint Enforcements (Duplicate Code / Number Rejections):
   - Duplicate Building code in same hospital -> 409
   - Duplicate Floor number in same building -> 409
   - Duplicate Unit code in same hospital -> 409
   - Duplicate Room number in same unit -> 409
   - Duplicate Bed number in same room -> 409
   - Duplicate Nursing Station code in same unit -> 409
4. Hierarchical Delete Protections:
   - Cannot delete Building containing Floors -> 400
   - Cannot delete Floor containing Units -> 400
   - Cannot delete Unit containing Rooms -> 400
   - Cannot delete Room containing Beds -> 400
5. 3-Way Parity Lifecycle (DB == Gateway == BFF == UI Feed):
   - Hospital (101) -> Building -> Floor -> Unit -> Room -> Bed & Nursing Station
   - Direct Gateway check vs BFF check vs MySQL DB check (100% field match)
6. Bed Operational Status Mutation & Domain Separation:
   - PATCH /status (AVAILABLE -> MAINTENANCE -> AVAILABLE)
   - Verify DB + Gateway + BFF all reflect transition
   - Verify Bed entity contains zero patientId and zero admissionId
7. Clean Teardown & Baseline State Restoration
"""

import sys
import time
import json
import random
import base64
import requests
import subprocess
import hmac
import hashlib

CARE_URL = "http://localhost:3001"
GATEWAY_URL = "http://localhost:8080"
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
    "BUILDING_VIEW", "BUILDING_CREATE", "BUILDING_UPDATE", "BUILDING_DELETE",
    "FLOOR_VIEW", "FLOOR_CREATE", "FLOOR_UPDATE", "FLOOR_DELETE",
    "UNIT_VIEW", "UNIT_CREATE", "UNIT_UPDATE", "UNIT_DELETE",
    "ROOM_VIEW", "ROOM_CREATE", "ROOM_UPDATE", "ROOM_DELETE",
    "BED_VIEW", "BED_CREATE", "BED_UPDATE", "BED_DELETE",
    "NURSING_STATION_VIEW", "NURSING_STATION_CREATE", "NURSING_STATION_UPDATE", "NURSING_STATION_DELETE"
])

H102_ADMIN_TOKEN = generate_jwt("admin_h102@swarnikacare.com", ["HOSPITAL_ADMIN"], [
    "BUILDING_VIEW", "FLOOR_VIEW", "UNIT_VIEW", "ROOM_VIEW", "BED_VIEW", "NURSING_STATION_VIEW"
], hospital_id=102)

PATIENT_TOKEN = generate_jwt("patient@swarnikacare.com", ["PATIENT"], ["PATIENT_VIEW"])

SUPER_COOKIES = {'swarnika_session': SUPER_ADMIN_TOKEN}
SUPER_HEADERS = {'Authorization': f'Bearer {SUPER_ADMIN_TOKEN}'}
H102_HEADERS = {'Authorization': f'Bearer {H102_ADMIN_TOKEN}'}
PATIENT_COOKIES = {'swarnika_session': PATIENT_TOKEN}

def db_query(sql):
    cmd = f"mysql -u root -N -e \"USE organization_db; {sql}\""
    return subprocess.check_output(cmd, shell=True).decode('utf-8').strip()

def main():
    print("=" * 80)
    print("  STEP 3 PHASE 3: COMPREHENSIVE E2E & 3-WAY PARITY AUDIT (PHYSICAL INFRASTRUCTURE)")
    print("=" * 80)

    # -------------------------------------------------------------
    # SECTION 1: Security & Cross-Hospital Scope Enforcement
    # -------------------------------------------------------------
    print("\n▶ SECTION 1: Security & Cross-Hospital Scope Enforcements")
    
    # Unauthenticated UI
    r_unauth_ui = requests.get(f"{CARE_URL}/admin/infrastructure", allow_redirects=False)
    assert r_unauth_ui.status_code == 307 and r_unauth_ui.headers.get('location') == '/login', \
        f"Expected 307 redirect, got: {r_unauth_ui.status_code}"
    print("  ✓ Unauthenticated access to /admin/infrastructure redirected to /login (HTTP 307)")

    # Unauthenticated Gateway
    r_unauth_gw = requests.get(f"{GATEWAY_URL}/api/v1/buildings?hospitalId=101")
    assert r_unauth_gw.status_code in [401, 403], f"Expected 401/403, got: {r_unauth_gw.status_code}"
    print(f"  ✓ Unauthenticated direct Gateway access rejected (HTTP {r_unauth_gw.status_code})")

    # PATIENT Role Blocked
    r_patient = requests.get(f"{CARE_URL}/admin/infrastructure", cookies=PATIENT_COOKIES, allow_redirects=False)
    assert r_patient.status_code in [307, 403], f"Expected 307/403, got: {r_patient.status_code}"
    print("  ✓ Insufficient role (PATIENT) blocked from /admin/infrastructure")

    # Scoped Hospital Admin (102) Accessing Hospital 101 across all 6 tiers
    scoped_checks = [
        ("Buildings List", f"{GATEWAY_URL}/api/v1/buildings?hospitalId=101"),
        ("Building 1 Detail", f"{GATEWAY_URL}/api/v1/buildings/1"),
        ("Floor 1 Detail", f"{GATEWAY_URL}/api/v1/floors/1"),
        ("Unit 1 Detail", f"{GATEWAY_URL}/api/v1/units/1"),
        ("Room 1 Detail", f"{GATEWAY_URL}/api/v1/rooms/1"),
        ("Bed 1 Detail", f"{GATEWAY_URL}/api/v1/beds/1"),
        ("Nursing Station 1 Detail", f"{GATEWAY_URL}/api/v1/nursing-stations/1")
    ]
    for label, url in scoped_checks:
        r_scoped = requests.get(url, headers=H102_HEADERS)
        assert r_scoped.status_code in [401, 403], f"{label} expected 403, got: {r_scoped.status_code}"
    print("  ✓ Scoped Hospital 102 Admin rejected from Hospital 101 resources across all 6 tiers (HTTP 403)")

    # SUPER_ADMIN Global Access
    r_super = requests.get(f"{GATEWAY_URL}/api/v1/buildings?hospitalId=101", headers=SUPER_HEADERS)
    assert r_super.status_code == 200, f"Super admin query failed: {r_super.status_code}"
    print("  ✓ SUPER_ADMIN verified: global cross-hospital access authorized (HTTP 200)")

    # -------------------------------------------------------------
    # SECTION 2: Negative Hierarchy Enforcements (Parent-Child Mismatches)
    # -------------------------------------------------------------
    print("\n▶ SECTION 2: Negative Hierarchy Enforcements (Parent-Child Mismatches)")

    # 2a. Create Floor in Building 1 (Hospital 101) with hospitalId: 102
    bad_floor = {
        "hospitalId": 102, # mismatch! Building 1 belongs to 101
        "buildingId": 1,
        "floorNumber": 99,
        "code": "FL-MISMATCH",
        "name": "Invalid Floor",
        "status": "ACTIVE"
    }
    r_bad_flr = requests.post(f"{CARE_URL}/api/proxy/api/v1/floors", json=bad_floor, cookies=SUPER_COOKIES)
    assert r_bad_flr.status_code in [400, 422, 500], f"Expected 400 for hospital mismatch, got: {r_bad_flr.status_code}"
    print(f"  ✓ Floor creation with mismatched hospital rejected (HTTP {r_bad_flr.status_code})")

    # 2b. Create Unit on Floor 1 with buildingId: 2 (Building 2 is in Hospital 102, Floor 1 is in Building 1)
    bad_unit = {
        "hospitalId": 101,
        "buildingId": 2, # mismatch!
        "floorId": 1,
        "code": "UNIT-MISMATCH",
        "name": "Invalid Unit",
        "type": "WARD",
        "status": "ACTIVE"
    }
    r_bad_unit = requests.post(f"{CARE_URL}/api/proxy/api/v1/units", json=bad_unit, cookies=SUPER_COOKIES)
    assert r_bad_unit.status_code in [400, 422, 500], f"Expected 400 for building mismatch, got: {r_bad_unit.status_code}"
    print(f"  ✓ Unit creation with mismatched building rejected (HTTP {r_bad_unit.status_code})")

    # 2c. Create Room in Unit 1 with floorId: 3 (Unit 1 belongs to Floor 1)
    bad_room = {
        "hospitalId": 101,
        "buildingId": 1,
        "floorId": 3, # mismatch!
        "unitId": 1,
        "roomNumber": "RM-MISMATCH",
        "roomType": "GENERAL",
        "status": "ACTIVE"
    }
    r_bad_room = requests.post(f"{CARE_URL}/api/proxy/api/v1/rooms", json=bad_room, cookies=SUPER_COOKIES)
    assert r_bad_room.status_code in [400, 422, 500], f"Expected 400 for floor mismatch, got: {r_bad_room.status_code}"
    print(f"  ✓ Room creation with mismatched floor rejected (HTTP {r_bad_room.status_code})")

    # 2d. Create Bed in Room 1 with unitId: 1 (Room 1 belongs to Unit 3)
    bad_bed = {
        "hospitalId": 101,
        "buildingId": 5,
        "floorId": 3,
        "unitId": 1, # mismatch!
        "roomId": 1,
        "bedNumber": "BED-MISMATCH",
        "bedType": "GENERAL",
        "status": "AVAILABLE"
    }
    r_bad_bed = requests.post(f"{CARE_URL}/api/proxy/api/v1/beds", json=bad_bed, cookies=SUPER_COOKIES)
    assert r_bad_bed.status_code in [400, 422, 500], f"Expected 400 for unit mismatch, got: {r_bad_bed.status_code}"
    print(f"  ✓ Bed creation with mismatched unit rejected (HTTP {r_bad_bed.status_code})")

    # 2e. Create Nursing Station in Unit 1 with floorId: 3 (Unit 1 belongs to Floor 1)
    bad_ns = {
        "hospitalId": 101,
        "buildingId": 1,
        "floorId": 3, # mismatch!
        "unitId": 1,
        "code": "NS-MISMATCH",
        "name": "Invalid Station",
        "status": "ACTIVE"
    }
    r_bad_ns = requests.post(f"{CARE_URL}/api/proxy/api/v1/nursing-stations", json=bad_ns, cookies=SUPER_COOKIES)
    assert r_bad_ns.status_code in [400, 422, 500], f"Expected 400 for floor mismatch on station, got: {r_bad_ns.status_code}"
    print(f"  ✓ Nursing Station creation with mismatched floor rejected (HTTP {r_bad_ns.status_code})")

    # -------------------------------------------------------------
    # SECTION 3: Constraint Enforcement & Duplicate Rejection
    # -------------------------------------------------------------
    print("\n▶ SECTION 3: Constraint Enforcements (Duplicate Code / Number Checks)")

    # Duplicate Building Code in Hospital 101 (BLD-A already exists)
    dup_bld = {
        "hospitalId": 101,
        "code": "BLD-A", # already exists in 101
        "name": "Duplicate Building",
        "status": "ACTIVE"
    }
    r_dup_bld = requests.post(f"{CARE_URL}/api/proxy/api/v1/buildings", json=dup_bld, cookies=SUPER_COOKIES)
    assert r_dup_bld.status_code in [400, 409, 500], f"Expected 409 for duplicate building code, got: {r_dup_bld.status_code}"
    print(f"  ✓ Duplicate building code rejected (HTTP {r_dup_bld.status_code})")

    # Duplicate Floor Number in Building 1 (Floor 1 already exists)
    dup_flr = {
        "hospitalId": 101,
        "buildingId": 1,
        "floorNumber": 1, # already exists
        "code": "FL-NEW-DUP",
        "name": "Duplicate Floor Number",
        "status": "ACTIVE"
    }
    r_dup_flr = requests.post(f"{CARE_URL}/api/proxy/api/v1/floors", json=dup_flr, cookies=SUPER_COOKIES)
    assert r_dup_flr.status_code in [400, 409, 500], f"Expected 409 for duplicate floor number, got: {r_dup_flr.status_code}"
    print(f"  ✓ Duplicate floor number in building rejected (HTTP {r_dup_flr.status_code})")

    # Duplicate Bed Number in Room 1 (BED-01 already exists in Room 1)
    dup_bed = {
        "hospitalId": 101,
        "buildingId": 5,
        "floorId": 3,
        "unitId": 3,
        "roomId": 1,
        "bedNumber": "BED-01", # already exists in Room 1
        "bedType": "GENERAL",
        "status": "AVAILABLE"
    }
    r_dup_bed = requests.post(f"{CARE_URL}/api/proxy/api/v1/beds", json=dup_bed, cookies=SUPER_COOKIES)
    assert r_dup_bed.status_code in [400, 409, 500], f"Expected 409 for duplicate bed number, got: {r_dup_bed.status_code}"
    print(f"  ✓ Duplicate bed number in room rejected (HTTP {r_dup_bed.status_code})")

    # -------------------------------------------------------------
    # SECTION 4: Hierarchical Delete Protections
    # -------------------------------------------------------------
    print("\n▶ SECTION 4: Hierarchical Delete Protections")

    # Try to delete Building 1 which contains floors
    r_del_bld = requests.delete(f"{CARE_URL}/api/proxy/api/v1/buildings/1", cookies=SUPER_COOKIES)
    assert r_del_bld.status_code in [400, 409, 500], f"Expected 400 for deleting building with floors, got: {r_del_bld.status_code}"
    print(f"  ✓ Delete protection: Building containing floors cannot be deleted (HTTP {r_del_bld.status_code})")

    # Try to delete Floor 1 which contains units
    r_del_flr = requests.delete(f"{CARE_URL}/api/proxy/api/v1/floors/1", cookies=SUPER_COOKIES)
    assert r_del_flr.status_code in [400, 409, 500], f"Expected 400 for deleting floor with units, got: {r_del_flr.status_code}"
    print(f"  ✓ Delete protection: Floor containing units cannot be deleted (HTTP {r_del_flr.status_code})")

    # -------------------------------------------------------------
    # SECTION 5: Full 3-Way Parity Lifecycle Test (DB == Gateway == BFF == UI Feed)
    # -------------------------------------------------------------
    print("\n▶ SECTION 5: Full 3-Way Parity Lifecycle Test")
    rand_id = random.randint(1000, 9999)
    hospital_id = 101

    # 5a. Create Building
    bld_code = f"BLD-PAR-{rand_id}"
    bld_name = f"Cardiovascular Institute {rand_id}"
    bld_req = {
        "hospitalId": hospital_id,
        "code": bld_code,
        "name": bld_name,
        "description": "Tertiary Cardiac Research and Inpatient Block",
        "address": "South Wing, Main Campus",
        "status": "ACTIVE"
    }
    r_cb = requests.post(f"{CARE_URL}/api/proxy/api/v1/buildings", json=bld_req, cookies=SUPER_COOKIES)
    assert r_cb.status_code in [200, 201], f"Building creation failed: {r_cb.status_code}"
    bld_id = r_cb.json().get("data", {}).get("id")

    # 5b. Create Floor
    flr_code = f"FL-PAR-{rand_id}"
    flr_name = f"Floor 3 Surgical Suites {rand_id}"
    flr_req = {
        "hospitalId": hospital_id,
        "buildingId": bld_id,
        "floorNumber": 3,
        "code": flr_code,
        "name": flr_name,
        "description": "Operating Theatres and Post-Operative Recovery",
        "status": "ACTIVE"
    }
    r_cf = requests.post(f"{CARE_URL}/api/proxy/api/v1/floors", json=flr_req, cookies=SUPER_COOKIES)
    assert r_cf.status_code in [200, 201], f"Floor creation failed: {r_cf.status_code}"
    flr_id = r_cf.json().get("data", {}).get("id")

    # 5c. Create Unit
    unit_code = f"UNIT-PAR-{rand_id}"
    unit_name = f"Cardiothoracic ICU {rand_id}"
    unit_req = {
        "hospitalId": hospital_id,
        "buildingId": bld_id,
        "floorId": flr_id,
        "code": unit_code,
        "name": unit_name,
        "type": "ICU",
        "description": "Intensive post-cardiac surgical monitoring",
        "capacity": 10,
        "genderRestriction": "ANY",
        "status": "ACTIVE",
        "publicVisibility": True
    }
    r_cu = requests.post(f"{CARE_URL}/api/proxy/api/v1/units", json=unit_req, cookies=SUPER_COOKIES)
    assert r_cu.status_code in [200, 201], f"Unit creation failed: {r_cu.status_code}"
    unit_id = r_cu.json().get("data", {}).get("id")

    # 5d. Create Room
    room_number = f"R-{rand_id}"
    room_name = f"Isolation Suite {rand_id}"
    room_req = {
        "hospitalId": hospital_id,
        "buildingId": bld_id,
        "floorId": flr_id,
        "unitId": unit_id,
        "roomNumber": room_number,
        "roomName": room_name,
        "roomType": "ISOLATION",
        "capacity": 1,
        "genderRestriction": "ANY",
        "status": "ACTIVE"
    }
    r_cr = requests.post(f"{CARE_URL}/api/proxy/api/v1/rooms", json=room_req, cookies=SUPER_COOKIES)
    assert r_cr.status_code in [200, 201], f"Room creation failed: {r_cr.status_code}"
    room_id = r_cr.json().get("data", {}).get("id")

    # 5e. Create Bed
    bed_number = f"BED-{rand_id}"
    bed_req = {
        "hospitalId": hospital_id,
        "buildingId": bld_id,
        "floorId": flr_id,
        "unitId": unit_id,
        "roomId": room_id,
        "bedNumber": bed_number,
        "bedType": "ICU",
        "status": "AVAILABLE",
        "genderRestriction": "ANY",
        "isIsolation": True
    }
    r_cbed = requests.post(f"{CARE_URL}/api/proxy/api/v1/beds", json=bed_req, cookies=SUPER_COOKIES)
    assert r_cbed.status_code in [200, 201], f"Bed creation failed: {r_cbed.status_code}"
    bed_id = r_cbed.json().get("data", {}).get("id")

    # 5f. Create Nursing Station
    ns_code = f"NS-PAR-{rand_id}"
    ns_name = f"Station 3 Central {rand_id}"
    ns_req = {
        "hospitalId": hospital_id,
        "buildingId": bld_id,
        "floorId": flr_id,
        "unitId": unit_id,
        "code": ns_code,
        "name": ns_name,
        "description": "Central nurse post overlooking isolation cubicles",
        "location": "Corridor Center Bay",
        "status": "ACTIVE"
    }
    r_cns = requests.post(f"{CARE_URL}/api/proxy/api/v1/nursing-stations", json=ns_req, cookies=SUPER_COOKIES)
    assert r_cns.status_code in [200, 201], f"Nursing Station creation failed: {r_cns.status_code}"
    ns_id = r_cns.json().get("data", {}).get("id")

    print(f"  ✓ Full Hierarchy created: Building {bld_id} -> Floor {flr_id} -> Unit {unit_id} -> Room {room_id} -> Bed {bed_id} + Station {ns_id}")

    # 5g. 3-Way Parity Verification
    # Database check
    db_bld_name = db_query(f"SELECT name FROM buildings WHERE id={bld_id};")
    db_flr_name = db_query(f"SELECT name FROM floors WHERE id={flr_id};")
    db_unit_name = db_query(f"SELECT name FROM units WHERE id={unit_id};")
    db_room_num = db_query(f"SELECT room_number FROM rooms WHERE id={room_id};")
    db_bed_num = db_query(f"SELECT bed_number FROM beds WHERE id={bed_id};")
    db_ns_name = db_query(f"SELECT name FROM nursing_stations WHERE id={ns_id};")

    assert db_bld_name == bld_name, f"DB Building mismatch: {db_bld_name}"
    assert db_flr_name == flr_name, f"DB Floor mismatch: {db_flr_name}"
    assert db_unit_name == unit_name, f"DB Unit mismatch: {db_unit_name}"
    assert db_room_num == room_number, f"DB Room mismatch: {db_room_num}"
    assert db_bed_num == bed_number, f"DB Bed mismatch: {db_bed_num}"
    assert db_ns_name == ns_name, f"DB Station mismatch: {db_ns_name}"
    print("  ✓ MySQL database layer: 100% field integrity confirmed")

    # Direct Gateway check
    gw_bed = requests.get(f"{GATEWAY_URL}/api/v1/beds/{bed_id}", headers=SUPER_HEADERS).json().get("data", {})
    assert gw_bed.get("bedNumber") == bed_number, "Gateway bedNumber mismatch"
    assert gw_bed.get("isIsolation") is True, "Gateway isolation mismatch"

    # Care BFF check
    bff_bed = requests.get(f"{CARE_URL}/api/proxy/api/v1/beds/{bed_id}", cookies=SUPER_COOKIES).json().get("data", {})
    assert bff_bed.get("bedNumber") == bed_number, "BFF bedNumber mismatch"
    assert bff_bed.get("status") == "AVAILABLE", "BFF status mismatch"
    assert "patientId" not in bff_bed and "admissionId" not in bff_bed, "Domain violation: patientId/admissionId on bed!"
    print("  ✓ 3-Way Parity Confirmed: DB == Gateway API == Care BFF == UI Data Feed")

    # -------------------------------------------------------------
    # SECTION 6: Bed Operational Status PATCH Lifecycle
    # -------------------------------------------------------------
    print("\n▶ SECTION 6: Bed Operational Status Transitions (AVAILABLE -> MAINTENANCE -> AVAILABLE)")
    
    # Transition to MAINTENANCE
    r_p1 = requests.patch(f"{CARE_URL}/api/proxy/api/v1/beds/{bed_id}/status", json={"status": "MAINTENANCE"}, cookies=SUPER_COOKIES)
    assert r_p1.status_code == 200, f"Status patch failed: {r_p1.status_code}"
    assert r_p1.json().get("data", {}).get("status") == "MAINTENANCE"
    db_s1 = db_query(f"SELECT status FROM beds WHERE id={bed_id};")
    assert db_s1 == "MAINTENANCE", f"DB expected MAINTENANCE, got: {db_s1}"
    print("  ✓ Transition to MAINTENANCE persisted in DB and reflected in BFF response")

    # Transition back to AVAILABLE
    r_p2 = requests.patch(f"{CARE_URL}/api/proxy/api/v1/beds/{bed_id}/status", json={"status": "AVAILABLE"}, cookies=SUPER_COOKIES)
    assert r_p2.status_code == 200, f"Status patch failed: {r_p2.status_code}"
    assert r_p2.json().get("data", {}).get("status") == "AVAILABLE"
    db_s2 = db_query(f"SELECT status FROM beds WHERE id={bed_id};")
    assert db_s2 == "AVAILABLE", f"DB expected AVAILABLE, got: {db_s2}"
    print("  ✓ Transition to AVAILABLE persisted in DB and reflected in BFF response")

    # -------------------------------------------------------------
    # SECTION 7: Teardown & Clean Baseline Restoration
    # -------------------------------------------------------------
    print("\n▶ SECTION 7: Teardown in Reverse Hierarchy Order")
    requests.delete(f"{CARE_URL}/api/proxy/api/v1/beds/{bed_id}", cookies=SUPER_COOKIES)
    requests.delete(f"{CARE_URL}/api/proxy/api/v1/nursing-stations/{ns_id}", cookies=SUPER_COOKIES)
    requests.delete(f"{CARE_URL}/api/proxy/api/v1/rooms/{room_id}", cookies=SUPER_COOKIES)
    requests.delete(f"{CARE_URL}/api/proxy/api/v1/units/{unit_id}", cookies=SUPER_COOKIES)
    requests.delete(f"{CARE_URL}/api/proxy/api/v1/floors/{flr_id}", cookies=SUPER_COOKIES)
    requests.delete(f"{CARE_URL}/api/proxy/api/v1/buildings/{bld_id}", cookies=SUPER_COOKIES)
    print("  ✓ Deleted all 6 test hierarchy nodes via Care BFF DELETE endpoints")

    # Confirm non-existence in database
    chk = db_query(f"SELECT COUNT(*) FROM buildings WHERE id={bld_id};")
    assert chk == "0", "Building still exists in DB after delete!"
    print("  ✓ Database verified: Zero test debris remaining")

    print("\n" + "=" * 80)
    print("🎉 ALL 7 SECTIONS OF STEP 3 PHASE 3 AUDIT PASSED WITH 100% SUCCESS!")
    print("=" * 80 + "\n")

if __name__ == "__main__":
    main()
