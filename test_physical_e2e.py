import time
ts = str(int(time.time()))
import jwt
import requests
import datetime
import base64

SECRET_KEY = base64.b64decode("404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970")

def create_token(user_id, roles):
    payload = {
        "iss": "swarnika-iam",
        "aud": "swarnika-care",
        "sub": user_id,
        "roles": roles,
        "iat": datetime.datetime.utcnow(),
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

BASE_URL = "http://localhost:8080/api/v1"

def test_scenario(name, condition):
    if condition:
        print(f"✅ {name}")
    else:
        print(f"❌ {name}")

def req(method, path, data=None, token=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    if method == "POST":
        resp = requests.post(f"{BASE_URL}{path}", json=data, headers=headers)
    elif method == "PATCH":
        resp = requests.patch(f"{BASE_URL}{path}", json=data, headers=headers)
    elif method == "DELETE":
        resp = requests.delete(f"{BASE_URL}{path}", headers=headers)
    return resp.status_code, resp.json() if resp.text else {}

token_super = create_token("super_user", ["SUPER_ADMIN"])
token_adminA = create_token("hospA_admin", ["HOSPITAL_ADMIN"])

# 1. SUPER_ADMIN can manage Hospital A
sc, resp = req("POST", "/buildings", {
    "hospitalId": 101,
    "code": f"BLD-{ts}",
    "name": "Building A"
}, token=token_super)
bldA_id = resp.get("data", {}).get("id")
test_scenario("1. SUPER_ADMIN creates Building A", sc == 200)

sc, resp = req("POST", "/floors", {
    "hospitalId": 101,
    "buildingId": bldA_id,
    "floorNumber": 1,
    "code": f"FL-{ts}",
    "name": "First Floor"
}, token=token_super)
floorA_id = resp.get("data", {}).get("id")

sc, resp = req("POST", "/units", {
    "hospitalId": 101,
    "buildingId": bldA_id,
    "floorId": floorA_id,
    "code": f"ICU-{ts}",
    "name": "ICU Ward",
    "type": "ICU"
}, token=token_super)
unitA_id = resp.get("data", {}).get("id")

# 2. SUPER_ADMIN can manage Hospital B
sc, resp = req("POST", "/buildings", {
    "hospitalId": 102,
    "code": f"BLD-B-{ts}",
    "name": "Building B"
}, token=token_super)
bldB_id = resp.get("data", {}).get("id")
test_scenario("2. SUPER_ADMIN creates Building B", sc == 200)

# Create hospA_admin Employee so ScopeValidator works
resp = requests.post(f"{BASE_URL}/employees", json={
    "userId": "hospA_admin",
    "employeeCode": "EMP-ADMIN",
    "hospitalId": 101,
    "departmentId": 1,
    "designationId": 1,
    "status": "ACTIVE",
    "employmentType": "FULL_TIME"
}, headers={"Content-Type": "application/json", "Authorization": f"Bearer {token_super}"})

# 3. HOSPITAL_ADMIN can manage own hospital
sc, resp = req("POST", "/rooms", {
    "hospitalId": 101,
    "buildingId": bldA_id,
    "floorId": floorA_id,
    "unitId": unitA_id,
    "roomNumber": "101",
    "roomType": "ICU"
}, token=token_adminA)
roomA_id = resp.get("data", {}).get("id")
test_scenario("3. HOSPITAL_ADMIN creates Room in own hospital", sc == 200)

sc, resp = req("POST", "/beds", {
    "hospitalId": 101,
    "buildingId": bldA_id,
    "floorId": floorA_id,
    "unitId": unitA_id,
    "roomId": roomA_id,
    "bedNumber": "BED-01",
    "bedType": "ICU"
}, token=token_adminA)
bedA_id = resp.get("data", {}).get("id")

sc, resp = req("POST", "/nursing-stations", {
    "hospitalId": 101,
    "buildingId": bldA_id,
    "floorId": floorA_id,
    "unitId": unitA_id,
    "code": f"NS-{ts}",
    "name": "NS 1"
}, token=token_adminA)
nsA_id = resp.get("data", {}).get("id")

# 4. HOSPITAL_ADMIN cannot create Building in another hospital
sc, _ = req("POST", "/buildings", {
    "hospitalId": 102,
    "code": f"BLD-HACK-{ts}",
    "name": "Hack Building"
}, token=token_adminA)
test_scenario("4. HOSPITAL_ADMIN cannot create Building in another hospital", sc == 403)

# 5. Cannot create Floor under another hospital's Building
sc, _ = req("POST", "/floors", {
    "hospitalId": 102,
    "buildingId": bldA_id, # belonging to 101
    "floorNumber": 2,
    "code": f"FL-{ts}",
    "name": "Second Floor"
}, token=token_super)
test_scenario("5. Cannot create Floor with mismatched hospital/building", sc in [400, 403, 500])

# 6. Cannot create Unit with mismatched hospital/floor
sc, _ = req("POST", "/units", {
    "hospitalId": 102,
    "buildingId": bldB_id,
    "floorId": floorA_id, # belonging to 101
    "code": "UNIT-HACK",
    "name": "Hack Unit",
    "type": "WARD"
}, token=token_super)
test_scenario("6. Cannot create Unit with mismatched floor", sc in [400, 403, 500])

# 7. Cannot create Room under another hospital's Unit
sc, _ = req("POST", "/rooms", {
    "hospitalId": 102,
    "buildingId": bldB_id,
    "floorId": floorA_id,
    "unitId": unitA_id,
    "roomNumber": "102",
    "roomType": "GENERAL"
}, token=token_super)
test_scenario("7. Cannot create Room with mismatched unit", sc in [400, 403, 500])

# 8. Cannot create Bed under another hospital's Room
sc, _ = req("POST", "/beds", {
    "hospitalId": 102,
    "buildingId": bldB_id,
    "floorId": floorA_id,
    "unitId": unitA_id,
    "roomId": roomA_id,
    "bedNumber": "BED-HACK",
    "bedType": "GENERAL"
}, token=token_super)
test_scenario("8. Cannot create Bed with mismatched room", sc in [400, 403, 500])

# 9. Cannot create Nursing Station under another hospital's Unit
sc, _ = req("POST", "/nursing-stations", {
    "hospitalId": 102,
    "buildingId": bldB_id,
    "floorId": floorA_id,
    "unitId": unitA_id,
    "code": f"NS-{ts}",
    "name": "Hack NS"
}, token=token_super)
test_scenario("9. Cannot create NS with mismatched unit", sc in [400, 403, 500])

# 10. Unauthenticated request
sc, _ = req("POST", "/buildings", {"hospitalId": 101})
test_scenario("10. Unauthenticated request rejected", sc in [401, 403])

# 11. Insufficient permissions
token_patient = create_token("patient", ["PATIENT"])
sc, _ = req("POST", "/buildings", {"hospitalId": 101}, token=token_patient)
test_scenario("11. Insufficient permission rejected", sc == 403)

# 12. Duplicate resource rejected
sc, _ = req("POST", "/buildings", {
    "hospitalId": 101,
    "code": f"BLD-{ts}",
    "name": "Duplicate Building A"
}, token=token_super)
test_scenario("12. Duplicate resource rejected", sc == 409)

# 13. Invalid hierarchy returns 4xx
sc, _ = req("POST", "/floors", {
    "hospitalId": 101,
    "buildingId": 99999,
    "floorNumber": 1,
    "code": f"FL-{ts}",
    "name": "First Floor"
}, token=token_super)
test_scenario("13. Invalid hierarchy returns 4xx", sc == 404)

# 14. Parent deletion with children rejected
sc, _ = req("DELETE", f"/buildings/{bldA_id}", token=token_super)
test_scenario("14. Parent deletion with children rejected", sc == 400)

# 15. Valid bed status transition
sc, _ = req("PATCH", f"/beds/{bedA_id}/status", {"status": "RESERVED"}, token=token_super)
test_scenario("15. Valid bed status transition (AVAILABLE -> RESERVED)", sc == 200)

# 16. Invalid bed status transition
sc, _ = req("PATCH", f"/beds/{bedA_id}/status", {"status": "CLEANING"}, token=token_super)
test_scenario("16. Invalid bed status transition (RESERVED -> CLEANING)", sc == 400)
