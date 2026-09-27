#!/bin/bash
# Minimal script to test patient billing endpoints

echo "Fetching billing summary..."
curl -s http://localhost:8080/api/v1/billing/me/summary -H "X-User-Id: USER-PATIENT-1" -H "X-User-Roles: PATIENT" | head -c 200
echo -e "\n"

echo "Fetching billing invoices..."
curl -s http://localhost:8080/api/v1/billing/me/invoices -H "X-User-Id: USER-PATIENT-1" -H "X-User-Roles: PATIENT" | head -c 200
echo -e "\n"

echo "Fetching patient documents..."
curl -s http://localhost:8080/api/v1/patients/me/documents -H "X-User-Id: USER-PATIENT-1" -H "X-User-Roles: PATIENT" | head -c 200
echo -e "\n"
