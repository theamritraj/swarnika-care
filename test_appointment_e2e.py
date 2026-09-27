#!/usr/bin/env python3
"""
Phase 3 Hardening — Gateway E2E Test Suite
Tests all appointment endpoints via localhost:8080/api/v1
Uses manually-signed JWTs (documented limitation — IAM-issued tokens not used).
"""
import subprocess, json, sys, time
import urllib.request, urllib.error

BASE = "http://localhost:8080/api/v1"
TOKEN_CMD = ["node", "gen-token.js"]

PATIENT_ID    = 3
DOCTOR_ID     = 6
HOSPITAL_ID   = 101
DEPARTMENT_ID = 101

APPT_DATE_1   = "2026-11-05"   # Thursday (doctor available)
APPT_DATE_2   = "2026-11-06"   # Friday   (doctor available)

results = []

def token(role="SUPER_ADMIN"):
    raw = subprocess.check_output(TOKEN_CMD, cwd="/Users/amritraj/Desktop/Amrit Raj/Projects/swarnika-care").strip().decode()
    return raw

def req(method, path, body=None, tok=None, expected=None):
    url = BASE + path
    data = json.dumps(body).encode() if body else None
    headers = {"Content-Type": "application/json"}
    if tok:
        headers["Authorization"] = f"Bearer {tok}"
    r = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(r) as resp:
            status = resp.status
            payload = json.loads(resp.read())
    except urllib.error.HTTPError as e:
        status = e.code
        try:
            payload = json.loads(e.read())
        except Exception:
            payload = {}
    ok = (status == expected) if expected else True
    marker = "✅" if ok else "❌"
    results.append((marker, method, path, status, expected))
    print(f"{marker} {method} {path} → {status} (expected {expected})")
    return status, payload

def section(title):
    print(f"\n{'='*60}\n  {title}\n{'='*60}")

# ──────────────────────────────────────────────────────────────
# 1. AUTH CHECKS
# ──────────────────────────────────────────────────────────────
section("1. AUTHENTICATION — Unauthenticated requests → 401")
req("GET",  "/appointments",        tok=None, expected=401)
req("POST", "/appointments",        tok=None, expected=401)
req("GET",  "/appointments/999",    tok=None, expected=401)

tok = token()

# ──────────────────────────────────────────────────────────────
# 2. BOOKING — Full lifecycle
# ──────────────────────────────────────────────────────────────
section("2. LIFECYCLE — Book → Confirm → Complete")

status, body = req("POST", "/appointments", {
    "patientId": PATIENT_ID, "doctorId": DOCTOR_ID,
    "hospitalId": HOSPITAL_ID, "departmentId": DEPARTMENT_ID,
    "appointmentDate": APPT_DATE_1, "startTime": "10:00", "endTime": "10:30",
    "appointmentType": "OPD", "reason": "Hardening audit test"
}, tok=tok, expected=201)
assert status == 201, f"Booking failed with {status}: {body}"
appt_id_1 = body["data"]["id"]
appt_num_1 = body["data"]["appointmentNumber"]
print(f"   Created: {appt_num_1} (id={appt_id_1})")

# GET by ID
req("GET", f"/appointments/{appt_id_1}", tok=tok, expected=200)

# GET by patient
req("GET", f"/appointments/patient/{PATIENT_ID}", tok=tok, expected=200)

# GET by doctor
req("GET", f"/appointments/doctor/{DOCTOR_ID}", tok=tok, expected=200)

# Confirm
status, body = req("PATCH", f"/appointments/{appt_id_1}/confirm", tok=tok, expected=200)
assert body["data"]["status"] == "CONFIRMED", f"Expected CONFIRMED, got {body['data']['status']}"

# Complete
status, body = req("PATCH", f"/appointments/{appt_id_1}/complete", tok=tok, expected=200)
assert body["data"]["status"] == "COMPLETED"
assert body["data"]["completedAt"] is not None

# ──────────────────────────────────────────────────────────────
# 3. RESCHEDULE + CANCEL lifecycle
# ──────────────────────────────────────────────────────────────
section("3. LIFECYCLE — Book → Reschedule → Cancel")

status, body = req("POST", "/appointments", {
    "patientId": PATIENT_ID, "doctorId": DOCTOR_ID,
    "hospitalId": HOSPITAL_ID, "departmentId": DEPARTMENT_ID,
    "appointmentDate": APPT_DATE_1, "startTime": "11:00", "endTime": "11:30",
    "appointmentType": "OPD", "reason": "Hardening audit test 2"
}, tok=tok, expected=201)
appt_id_2 = body["data"]["id"]
appt_num_2 = body["data"]["appointmentNumber"]
print(f"   Created: {appt_num_2} (id={appt_id_2})")

# Reschedule
status, body = req("PATCH", f"/appointments/{appt_id_2}/reschedule", {
    "newAppointmentDate": APPT_DATE_2,
    "newStartTime": "13:00", "newEndTime": "13:30",
    "reason": "Patient requested"
}, tok=tok, expected=200)
assert body["data"]["id"] == appt_id_2,      "ID changed after reschedule!"
assert body["data"]["appointmentNumber"] == appt_num_2, "Appt number changed after reschedule!"
assert body["data"]["appointmentDate"] == APPT_DATE_2

# Cancel
status, body = req("PATCH", f"/appointments/{appt_id_2}/cancel", {
    "reason": "Hardening test cancel"
}, tok=tok, expected=200)
assert body["data"]["status"] == "CANCELLED"
assert body["data"]["cancellationReason"] == "Hardening test cancel"
assert body["data"]["cancelledAt"] is not None

# ──────────────────────────────────────────────────────────────
# 4. NO-SHOW
# ──────────────────────────────────────────────────────────────
section("4. NO-SHOW flow")

status, body = req("POST", "/appointments", {
    "patientId": PATIENT_ID, "doctorId": DOCTOR_ID,
    "hospitalId": HOSPITAL_ID, "departmentId": DEPARTMENT_ID,
    "appointmentDate": APPT_DATE_1, "startTime": "12:00", "endTime": "12:30",
    "appointmentType": "OPD", "reason": "No-show test"
}, tok=tok, expected=201)
appt_id_3 = body["data"]["id"]

req("PATCH", f"/appointments/{appt_id_3}/no-show", tok=tok, expected=200)

# ──────────────────────────────────────────────────────────────
# 5. INVALID TRANSITIONS (should return 400)
# ──────────────────────────────────────────────────────────────
section("5. INVALID TRANSITIONS → expect 400")

# Try to complete an already-COMPLETED appointment (appt_id_1)
req("PATCH", f"/appointments/{appt_id_1}/complete",  tok=tok, expected=400)
# Try to confirm a CANCELLED appointment (appt_id_2)
req("PATCH", f"/appointments/{appt_id_2}/confirm",   tok=tok, expected=400)
# Try to cancel a COMPLETED appointment (appt_id_1)
req("PATCH", f"/appointments/{appt_id_1}/cancel", {"reason": "bad attempt"}, tok=tok, expected=400)
# Try to reschedule a CANCELLED appointment (appt_id_2)
req("PATCH", f"/appointments/{appt_id_2}/reschedule", {
    "newAppointmentDate": APPT_DATE_2,
    "newStartTime": "14:00", "newEndTime": "14:30",
    "reason": "bad"
}, tok=tok, expected=400)

# ──────────────────────────────────────────────────────────────
# 6. CONFLICT — Double booking → 409
# ──────────────────────────────────────────────────────────────
section("6. DOUBLE-BOOKING CONFLICT → expect 409 or 400")

# Book a fresh slot
status, body = req("POST", "/appointments", {
    "patientId": PATIENT_ID, "doctorId": DOCTOR_ID,
    "hospitalId": HOSPITAL_ID, "departmentId": DEPARTMENT_ID,
    "appointmentDate": APPT_DATE_1, "startTime": "14:00", "endTime": "14:30",
    "appointmentType": "OPD", "reason": "Conflict seed"
}, tok=tok, expected=201)
assert status == 201

# Attempt the exact same slot — must conflict
req("POST", "/appointments", {
    "patientId": PATIENT_ID, "doctorId": DOCTOR_ID,
    "hospitalId": HOSPITAL_ID, "departmentId": DEPARTMENT_ID,
    "appointmentDate": APPT_DATE_1, "startTime": "14:00", "endTime": "14:30",
    "appointmentType": "OPD", "reason": "Duplicate attempt"
}, tok=tok, expected=409)

# ──────────────────────────────────────────────────────────────
# 7. 404 — Non-existent appointment
# ──────────────────────────────────────────────────────────────
section("7. NOT FOUND → 404")

req("GET",   "/appointments/999999", tok=tok, expected=404)
req("PATCH", "/appointments/999999/confirm", tok=tok, expected=404)

# ──────────────────────────────────────────────────────────────
# SUMMARY
# ──────────────────────────────────────────────────────────────
section("SUMMARY")
passed  = [r for r in results if r[0] == "✅"]
failed  = [r for r in results if r[0] == "❌"]
print(f"Passed: {len(passed)}/{len(results)}")
if failed:
    print("FAILED:")
    for f in failed:
        print(f"  {f[1]} {f[2]} → {f[3]} (expected {f[4]})")
    sys.exit(1)
else:
    print("All Gateway E2E checks PASSED")
