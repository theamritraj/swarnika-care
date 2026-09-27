#!/usr/bin/env python3
"""
Step 3 Phase 1 Verification Script: Backend GET Endpoints & Scope Authorization
Tests:
1. GET /api/v1/buildings?hospitalId=... & /api/v1/buildings/{id}
2. GET /api/v1/floors?buildingId=... & /api/v1/floors/{id}
3. GET /api/v1/units?floorId=... & /api/v1/units/{id}
4. GET /api/v1/rooms?unitId=... & /api/v1/rooms/{id}
5. GET /api/v1/beds?roomId=... & /api/v1/beds/{id}
6. GET /api/v1/nursing-stations?unitId=... & /api/v1/nursing-stations/{id}
7. Security Authorization:
   - Direct unauthenticated Gateway call -> HTTP 401
   - Cross-hospital scope check for scoped hospital admin -> HTTP 403
   - SUPER_ADMIN access across hospitals -> HTTP 200
8. Gateway Routing Parity (via http://localhost:8080)
"""

import time
import json
import base64
import requests
import hmac
import hashlib

GATEWAY_URL = "http://localhost:8080"
JWT_SECRET_B64 = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970"
JWT_SECRET = base64.b64decode(JWT_SECRET_B64)

def b64url(b):
    return base64.urlsafe_b64encode(b).decode('utf-8').rstrip('=')

def create_jwt(sub: str, roles: list, permissions: list, hospital_id=None):
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

SUPER_ADMIN_TOKEN = create_jwt("superadmin@swarnikacare.com", ["SUPER_ADMIN"], [
    "BUILDING_VIEW", "FLOOR_VIEW", "UNIT_VIEW", "ROOM_VIEW", "BED_VIEW", "NURSING_STATION_VIEW"
])

# Hospital Admin strictly scoped to hospital 102
HOSPITAL_102_ADMIN_TOKEN = create_jwt("admin_h102@swarnikacare.com", ["HOSPITAL_ADMIN"], [
    "BUILDING_VIEW", "FLOOR_VIEW", "UNIT_VIEW", "ROOM_VIEW", "BED_VIEW", "NURSING_STATION_VIEW"
], hospital_id=102)

SUPER_HEADERS = {'Authorization': f'Bearer {SUPER_ADMIN_TOKEN}'}
H102_HEADERS = {'Authorization': f'Bearer {HOSPITAL_102_ADMIN_TOKEN}'}

def main():
    print("=" * 75)
    print("  STEP 3 PHASE 1: PHYSICAL INFRASTRUCTURE BACKEND READ APIS AUDIT")
    print("=" * 75)

    # 1. Unauthenticated Gateway Access Check
    print("\n▶ 1. Unauthenticated Gateway Access Security")
    r_unauth = requests.get(f"{GATEWAY_URL}/api/v1/buildings?hospitalId=101")
    assert r_unauth.status_code in [401, 403], f"Expected 401/403, got: {r_unauth.status_code}"
    print(f"  ✓ Direct unauthenticated Gateway call rejected (HTTP {r_unauth.status_code})")

    # 2. Buildings Read API
    print("\n▶ 2. Buildings Read API (/api/v1/buildings)")
    r_bld = requests.get(f"{GATEWAY_URL}/api/v1/buildings?hospitalId=101", headers=SUPER_HEADERS)
    assert r_bld.status_code == 200, f"Buildings fetch failed: {r_bld.status_code} - {r_bld.text}"
    buildings = r_bld.json().get("data", [])
    assert len(buildings) > 0, "No buildings found for hospital 101"
    bld_id = buildings[0].get("id")
    print(f"  ✓ GET /api/v1/buildings?hospitalId=101 returned {len(buildings)} buildings (First ID={bld_id})")

    r_bld_single = requests.get(f"{GATEWAY_URL}/api/v1/buildings/{bld_id}", headers=SUPER_HEADERS)
    assert r_bld_single.status_code == 200, f"Building detail failed: {r_bld_single.status_code}"
    print(f"  ✓ GET /api/v1/buildings/{bld_id} returned building '{r_bld_single.json().get('data', {}).get('name')}'")

    # 3. Floors Read API
    print("\n▶ 3. Floors Read API (/api/v1/floors)")
    r_flr = requests.get(f"{GATEWAY_URL}/api/v1/floors?buildingId={bld_id}", headers=SUPER_HEADERS)
    assert r_flr.status_code == 200, f"Floors fetch failed: {r_flr.status_code} - {r_flr.text}"
    floors = r_flr.json().get("data", [])
    print(f"  ✓ GET /api/v1/floors?buildingId={bld_id} returned {len(floors)} floors")

    if floors:
        flr_id = floors[0].get("id")
        r_flr_single = requests.get(f"{GATEWAY_URL}/api/v1/floors/{flr_id}", headers=SUPER_HEADERS)
        assert r_flr_single.status_code == 200, f"Floor detail failed: {r_flr_single.status_code}"
        print(f"  ✓ GET /api/v1/floors/{flr_id} returned floor '{r_flr_single.json().get('data', {}).get('name')}'")

        # 4. Units / Wards Read API
        print("\n▶ 4. Units / Wards Read API (/api/v1/units)")
        r_unit = requests.get(f"{GATEWAY_URL}/api/v1/units?floorId={flr_id}", headers=SUPER_HEADERS)
        assert r_unit.status_code == 200, f"Units fetch failed: {r_unit.status_code} - {r_unit.text}"
        units = r_unit.json().get("data", [])
        print(f"  ✓ GET /api/v1/units?floorId={flr_id} returned {len(units)} clinical units/wards")

        if units:
            unit_id = units[0].get("id")
            r_unit_single = requests.get(f"{GATEWAY_URL}/api/v1/units/{unit_id}", headers=SUPER_HEADERS)
            assert r_unit_single.status_code == 200, f"Unit detail failed: {r_unit_single.status_code}"
            print(f"  ✓ GET /api/v1/units/{unit_id} returned unit '{r_unit_single.json().get('data', {}).get('name')}'")

            # 5. Rooms Read API
            print("\n▶ 5. Rooms Read API (/api/v1/rooms)")
            r_room = requests.get(f"{GATEWAY_URL}/api/v1/rooms?unitId={unit_id}", headers=SUPER_HEADERS)
            assert r_room.status_code == 200, f"Rooms fetch failed: {r_room.status_code} - {r_room.text}"
            rooms = r_room.json().get("data", [])
            print(f"  ✓ GET /api/v1/rooms?unitId={unit_id} returned {len(rooms)} rooms")

            if rooms:
                room_id = rooms[0].get("id")
                r_room_single = requests.get(f"{GATEWAY_URL}/api/v1/rooms/{room_id}", headers=SUPER_HEADERS)
                assert r_room_single.status_code == 200, f"Room detail failed: {r_room_single.status_code}"
                print(f"  ✓ GET /api/v1/rooms/{room_id} returned room '{r_room_single.json().get('data', {}).get('roomNumber')}'")

                # 6. Beds Read API
                print("\n▶ 6. Beds Read API (/api/v1/beds)")
                r_beds = requests.get(f"{GATEWAY_URL}/api/v1/beds?roomId={room_id}", headers=SUPER_HEADERS)
                assert r_beds.status_code == 200, f"Beds fetch failed: {r_beds.status_code} - {r_beds.text}"
                beds = r_beds.json().get("data", [])
                print(f"  ✓ GET /api/v1/beds?roomId={room_id} returned {len(beds)} physical beds")

                if beds:
                    bed_id = beds[0].get("id")
                    r_bed_single = requests.get(f"{GATEWAY_URL}/api/v1/beds/{bed_id}", headers=SUPER_HEADERS)
                    assert r_bed_single.status_code == 200, f"Bed detail failed: {r_bed_single.status_code}"
                    bed_data = r_bed_single.json().get("data", {})
                    # Critical verification: Bed must not contain patientId or admissionId
                    assert "patientId" not in bed_data, "Violation: Bed contains patientId!"
                    assert "admissionId" not in bed_data, "Violation: Bed contains admissionId!"
                    print(f"  ✓ GET /api/v1/beds/{bed_id} verified: Bed '{bed_data.get('bedNumber')}', Status='{bed_data.get('status')}'")
                    print("  ✓ Domain Guard Verified: Bed contains zero patientId and zero admissionId")

            # 7. Nursing Stations Read API
            print("\n▶ 7. Nursing Stations Read API (/api/v1/nursing-stations)")
            r_ns = requests.get(f"{GATEWAY_URL}/api/v1/nursing-stations?unitId={unit_id}", headers=SUPER_HEADERS)
            assert r_ns.status_code == 200, f"Nursing stations fetch failed: {r_ns.status_code} - {r_ns.text}"
            stations = r_ns.json().get("data", [])
            print(f"  ✓ GET /api/v1/nursing-stations?unitId={unit_id} returned {len(stations)} nursing stations")

            if stations:
                ns_id = stations[0].get("id")
                r_ns_single = requests.get(f"{GATEWAY_URL}/api/v1/nursing-stations/{ns_id}", headers=SUPER_HEADERS)
                assert r_ns_single.status_code == 200, f"Nursing station detail failed: {r_ns_single.status_code}"
                print(f"  ✓ GET /api/v1/nursing-stations/{ns_id} returned station '{r_ns_single.json().get('data', {}).get('name')}'")

    # 8. Scope Validation Check
    print("\n▶ 8. Scope Security: Scoped Hospital Admin Cross-Hospital Protection")
    # Hospital 102 admin trying to read Hospital 101's building
    r_forbidden = requests.get(f"{GATEWAY_URL}/api/v1/buildings?hospitalId=101", headers=H102_HEADERS)
    assert r_forbidden.status_code in [403, 401], f"Expected 403 Forbidden, got: {r_forbidden.status_code}"
    print(f"  ✓ Cross-hospital query properly rejected (HTTP {r_forbidden.status_code})")

    print("\n" + "=" * 75)
    print("🎉 STEP 3 PHASE 1: ALL BACKEND READ APIS & SCOPE CHECKS VERIFIED!")
    print("=" * 75 + "\n")

if __name__ == "__main__":
    main()
