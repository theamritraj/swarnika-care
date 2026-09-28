# Lab Frontend API Contract

This document outlines the REST API contracts available for the subsequent frontend implementation (Phase 3). All endpoints are prefixed with `/api/v1/lab`.

## 1. Test Catalog
### `POST /tests`
- **Desc:** Create a new lab test catalog entry.
- **Roles:** `SUPER_ADMIN`, `HOSPITAL_ADMIN`
- **Body:** `LabTestRequest` (testCode, testName, department, specimenType, turnaroundTimeMins, hospitalId)

### `GET /tests?hospitalId={id}`
- **Desc:** Get active lab tests for a hospital.
- **Roles:** `SUPER_ADMIN`, `HOSPITAL_ADMIN`, `DOCTOR`, `LAB_TECHNICIAN`

## 2. Lab Orders
### `POST /orders`
- **Desc:** Create a new lab order linked to a ClinicalOrder.
- **Roles:** `SUPER_ADMIN`, `HOSPITAL_ADMIN`, `DOCTOR`
- **Body:** `LabOrderRequest` (clinicalOrderId, patientId, doctorId, hospitalId, encounterId)

## 3. Specimens
### `POST /specimens/collect`
- **Desc:** Mark a specimen as collected for an order.
- **Roles:** `SUPER_ADMIN`, `LAB_TECHNICIAN`
- **Query Params:** `orderId`, `patientId`, `hospitalId`, `type`

## 4. Lab Results
### `POST /results`
- **Desc:** Enter a new lab result value.
- **Roles:** `SUPER_ADMIN`, `LAB_TECHNICIAN`
- **Body:** `LabResultRequest` (labOrderItemId, specimenId, patientId, hospitalId, resultType, numericValue, textValue, unit, referenceRange, abnormalFlag, comments)

### `PATCH /results/{id}/verify?hospitalId={id}`
- **Desc:** Verify a result.
- **Roles:** `SUPER_ADMIN`, `PATHOLOGIST`, `LAB_VERIFIER`

### `PATCH /results/{id}/release?hospitalId={id}`
- **Desc:** Release a result to the patient and trigger downstream Billing/Notification flows.
- **Roles:** `SUPER_ADMIN`, `PATHOLOGIST`, `LAB_VERIFIER`

## Cross-Service Downstream Triggers (Invisible to UI)
- Upon **Result Release**, the backend synchronously triggers:
  1. **BillingService:** `POST /api/v1/billing/charges` for the test.
  2. **NotificationService:** Publishes `LAB_RESULT_RELEASED` to Kafka topic `notification-events`.
