#!/bin/bash

# Setup base URLs
GATEWAY_URL="http://localhost:8080"
INTERNAL_SECRET="InternalSecret12345!"

echo "--- Running Manual E2E Tests ---"

echo "1. Generating Super Admin JWT Token..."
TOKEN=$(node gen-token.js)
echo "Token generated: $TOKEN"

echo ""
echo "2. Creating Doctor..."
DOC_CREATE_RESP=$(curl -s -X POST "$GATEWAY_URL/api/v1/doctors" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"email":"testdoctor1@swarnikacare.com", "firstName":"Test", "lastName":"Doctor"}')
echo "Create Doctor Response: $DOC_CREATE_RESP"

DOC_ID=$(echo $DOC_CREATE_RESP | grep -o '"id":[0-9]*' | grep -o '[0-9]*')
if [ -z "$DOC_ID" ]; then
    echo "Doctor creation failed."
    exit 1
fi
echo "Doctor ID: $DOC_ID"

echo ""
echo "3. Creating Doctor Profile (DRAFT)..."
PROFILE_UPSERT_RESP=$(curl -s -X PUT "$GATEWAY_URL/api/v1/doctors/$DOC_ID/profile" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"bio":"Test Bio", "qualifications":"MBBS", "specializations":"Cardiology"}')
echo "Profile Upsert Response: $PROFILE_UPSERT_RESP"

echo ""
echo "4. Checking Public API (should be empty)..."
PUBLIC_DOCS_BEFORE=$(curl -s -X GET "$GATEWAY_URL/api/v1/public/doctors")
echo "Public Docs Before Publishing: $PUBLIC_DOCS_BEFORE"

echo ""
echo "5. Updating Profile Status to PUBLISHED..."
STATUS_UPDATE_RESP=$(curl -s -X PATCH "$GATEWAY_URL/api/v1/doctors/$DOC_ID/profile/status?status=PUBLISHED" \
  -H "Authorization: Bearer $TOKEN")
echo "Status Update Response: $STATUS_UPDATE_RESP"

echo ""
echo "6. Checking Public API (should have doctor)..."
PUBLIC_DOCS_AFTER=$(curl -s -X GET "$GATEWAY_URL/api/v1/public/doctors")
echo "Public Docs After Publishing: $PUBLIC_DOCS_AFTER"

echo ""
echo "--- E2E Tests Complete ---"
