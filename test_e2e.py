import jwt
import requests
import datetime
import json
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

def test_scenario(name, condition, result):
    if condition == result:
        print(f"✅ {name}")
    else:
        print(f"❌ {name} (Expected {result}, got {condition})")

def post_req(path, data, token=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    resp = requests.post(f"{BASE_URL}{path}", json=data, headers=headers)
    return resp.status_code, resp.json() if resp.text else {}

token_super = create_token("super_user", ["SUPER_ADMIN"])

sc1_a, _ = post_req("/employees", {
    "userId": "empA",
    "employeeCode": "E101",
    "hospitalId": 101,
    "departmentId": 101,
    "designationId": 1
}, token=token_super)

sc1_b, _ = post_req("/employees", {
    "userId": "empB",
    "employeeCode": "E102",
    "hospitalId": 102,
    "departmentId": 102,
    "designationId": 1
}, token=token_super)

test_scenario("1. SUPER_ADMIN creates employee in both hospitals", sc1_a == 200 and sc1_b == 200, True)

token_adminA = create_token("empA", ["HOSPITAL_ADMIN"])

sc2, _ = post_req("/employees", {
    "userId": "empA_sub",
    "employeeCode": "E103",
    "hospitalId": 101,
    "departmentId": 101,
    "designationId": 2
}, token=token_adminA)

test_scenario("2. HOSPITAL_ADMIN creates employee in their own hospital", sc2, 200)

sc3, _ = post_req("/employees", {
    "userId": "empA_sub2",
    "employeeCode": "E104",
    "hospitalId": 102,
    "departmentId": 102,
    "designationId": 2
}, token=token_adminA)

test_scenario("3. HOSPITAL_ADMIN cross-hospital employee creation", sc3, 403)

sc4, resp4 = post_req("/positions", {
    "hospitalId": 101,
    "departmentId": 102,
    "designationId": 1,
    "code": "BAD_POS",
    "title": "Bad Position"
}, token=token_super)
test_scenario("4. Cross-hospital department position creation", sc4 in [403, 500] or resp4.get("status") in [403, 500], True)

_, pos_res = post_req("/positions", {
    "hospitalId": 102,
    "departmentId": 102,
    "designationId": 2,
    "code": "POS102",
    "title": "Valid Position B"
}, token=token_super)
posB_id = pos_res.get("data", {}).get("id")

sc5, resp5 = post_req("/employees", {
    "userId": "empA_sub3",
    "employeeCode": "E105",
    "hospitalId": 101,
    "departmentId": 101,
    "designationId": 1,
    "positionId": posB_id
}, token=token_super)
test_scenario("5. Cross-hospital position assignment", sc5 in [403, 500] or resp5.get("status") in [403, 500], True)

_, mgr_res = post_req("/employees", {
    "userId": "mgrB",
    "employeeCode": "E106",
    "hospitalId": 102,
    "departmentId": 102,
    "designationId": 1
}, token=token_super)
mgrB_id = mgr_res.get("data", {}).get("id")

sc6, resp6 = post_req("/employees", {
    "userId": "empA_sub4",
    "employeeCode": "E107",
    "hospitalId": 101,
    "departmentId": 101,
    "designationId": 1,
    "reportingManagerId": mgrB_id
}, token=token_super)
test_scenario("6. Cross-hospital manager assignment", sc6 in [403, 500] or resp6.get("status") in [403, 500], True)

sc7, _ = post_req("/employees", {
    "userId": "hacker",
    "hospitalId": 101
})
test_scenario("7. Unauthenticated request", sc7 in [401, 403], True)

token_user = create_token("user_normal", ["PATIENT"])
sc8, _ = post_req("/employees", {
    "userId": "empA_sub5",
    "hospitalId": 101
}, token=token_user)
test_scenario("8. Insufficient permission request", sc8, 403)
