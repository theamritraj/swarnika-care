# Lab Service Phase 2 Current State Audit

## 1. Existing Integration Points
- **EncounterClient**: Fetches clinical orders from `encounter-service` when creating a LabOrder.
- **API Gateway**: Exposes `/api/v1/lab/**` routes to `lab-service`.
- **Database**: `lab_db` with `V1` schema covering basic domains.

## 2. Missing Integration Points
- **BillingClient**: `lab-service` lacks a Feign client or Kafka publisher to push charge events to `billing-service`.
- **NotificationEvent**: `lab-service` does not have Kafka dependencies or a producer to emit `LAB_RESULT_RELEASED` events to `notification-service`.

## 3. Event Contracts
- Billing expects `CreateChargeRequest` (or via Kafka).
- Notification expects `NotificationEvent`.

## 4. Failure Risks & Idempotency Requirements
- Duplicate requests could spawn duplicate charges. A stable idempotency key (e.g. `LAB:{orderId}`) must be enforced.
- Network instability could cause Billing/Notification to drop requests.

## 5. Implementation Sequence
1. Create `BillingClient` or add Kafka Producer for charges and notifications.
2. Update `ResultService` to trigger billing upon `VERIFIED`/`RELEASED` or Order completion.
3. Add Kafka publisher for `LAB_RESULT_RELEASED` notification.
4. Enhance endpoints to enforce strict idempotency (DB constraint + logic checks).
5. Add `test_lab_production_e2e.mjs`.
6. Document Frontend API Contract.
