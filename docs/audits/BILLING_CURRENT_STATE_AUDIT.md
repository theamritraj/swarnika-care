# Billing Service - Current State Audit

## 1. Current Entities
- `Invoice`
- `InvoiceItem`
- `InvoiceStatus`
- `Payment`
- `PaymentMethod`
- `PaymentStatus`
- `Receipt`
- **Missing Entities**: `Charge`, `Refund`, `Adjustment`.

## 2. Current API Endpoints
- **Patient Self-Service (`PatientBillingController.java`):**
  - `GET /api/v1/billing/me/summary`
  - `GET /api/v1/billing/me/invoices`
  - `GET /api/v1/billing/me/invoices/{invoiceId}`
  - `GET /api/v1/billing/me/payments`
  - `GET /api/v1/billing/me/receipts`
- **Staff / Admin API:** Missing entirely (no REST Controllers implemented).

## 3. Current DB Tables
- `invoice_items`
- `invoices`
- `payments`
- `receipts`

## 4. Current Rows
- (Assumed empty or containing demo data; schema matches entities).

## 5. Existing Business Logic
- Patient ID resolved via `PatientClient` based on JWT.
- Invoice generation logic stubbed in `BillingService.createInvoice()`.

## 6. Existing Validation
- Patient authorization check inside `getMyInvoiceById()`.

## 7. Existing Security
- `@PreAuthorize("hasRole('PATIENT')")` on Patient endpoints.

## 8. Frontend Status
- `app/admin/billing/page.tsx` exists with hardcoded UI.
- `app/(patient)/patient/billing/page.tsx` integrates with Patient API.
- `app/(staff)/staff/billing/dashboard/page.tsx` exists (content TBA).

## 9. Missing Capabilities
- Staff API Endpoints (CRUD for Charges, Invoices, Payments, Refunds, Adjustments).
- Missing Domain Entities (Charge, Refund, Adjustment).
- Staff Frontend fully missing real API integration.
- Lack of E2E verification.

## 10. Exact Implementation Plan
- **Phase 1-2:** Create `Charge`, `Refund`, `Adjustment` entities and repositories.
- **Phase 3-4:** Add robust sequence generation for IDs, ensure BigDecimal calculations.
- **Phase 5-11:** Implement `StaffBillingController` and underlying `BillingService` logic for Charge Engine, Invoice Engine, Payment Engine, Receipt, Refund, Adjustment.
- **Phase 12-14:** Wire API Gateway, configure Eureka routing.
- **Phase 15-16:** Implement Frontend Staff billing integrations.
- **Phase 17-27:** Test suite, concurrency testing, and E2E verifications.
