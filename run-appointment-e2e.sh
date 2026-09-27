#!/bin/bash
set -e

echo "--- Running Appointment E2E Test ---"

# Assuming TOKEN is acquired from earlier logic (e.g. gen-token.js)
TOKEN=$(node gen-token.js)

echo "1. Checking Patient availability..."
# Ideally we'd hit patient service or check db. We will use dummy ID 1
PATIENT_ID=1

echo "2. Checking Doctor availability..."
# Use doctor 7 from previous test
DOCTOR_ID=7

echo "3. Booking Appointment..."
RESPONSE=$(curl -s -X POST http://localhost:8080/api/v1/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "patientId": '$PATIENT_ID',
    "doctorId": '$DOCTOR_ID',
    "hospitalId": 1,
    "departmentId": 1,
    "appointmentDate": "2026-10-15",
    "startTime": "10:00",
    "endTime": "10:30",
    "symptoms": "Routine checkup"
}')

echo "Booking Response: $RESPONSE"

echo "4. Checking Outbox Table in Appointment DB..."
# We expect to see a PENDING or PUBLISHED event
mysql -u swarnika -pSwarnika@2026 -e "USE appointment_db; SELECT event_id, status FROM outbox_events;"

echo "5. Checking Notification Table in Notification DB..."
# We expect to see a SENT event for the email
mysql -u swarnika -pSwarnika@2026 -e "USE notification_db; SELECT event_id, status FROM notification_events;"

echo "--- E2E Tests Complete ---"
