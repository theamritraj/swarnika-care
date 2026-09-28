# Pharmacy Service Architecture

## 1. Domain Entities
The core of the Pharmacy Service requires:
1. **Medicine:** Catalog mapping (`code`, `name`, `unit`, `active`).
2. **MedicineBatch:** Inventory mapping matching a `Medicine`. Tracks `quantity`, `available_quantity`, `selling_price`, and strict `expiry_date`.
3. **StockMovement:** An immutable ledger of inventory changes. `movement_type` includes: `RECEIPT`, `DISPENSE`, `ADJUSTMENT`.
4. **Prescription & PrescriptionItem:** Doctor-issued instructions linked to a `patientId`.
5. **PharmacyOrder:** Represents the fulfillment process for a prescription.
6. **Dispensing:** The actual transaction marking a batch as consumed, mapped to an order.

## 2. API Endpoints
**Catalog:**
- `GET /api/v1/pharmacy/medicines`
- `POST /api/v1/pharmacy/medicines`

**Inventory:**
- `POST /api/v1/pharmacy/inventory/receipt` (Admin/Manager)
- `POST /api/v1/pharmacy/inventory/adjustment` (Manager)

**Orders & Dispensing:**
- `GET /api/v1/pharmacy/orders` (Pending queue)
- `POST /api/v1/pharmacy/orders/{id}/dispense` (Pharmacist only)

## 3. Workflows
### FEFO Dispensing (First Expiry, First Out)
When `/dispense` is hit:
1. Validate user has `PHARMACIST` role.
2. Query `medicine_batches` for the medicine, filtering `expiry_date > NOW()` and `available_quantity > 0`, sorted by `expiry_date ASC`.
3. Deduct quantities sequentially from the oldest valid batches until the requested amount is met.
4. If total available across all valid batches is less than required, abort (Throw Exception).
5. Generate `StockMovement` records for each batch touched.

### Billing & Notification
- After `Dispensing` persists, synchronously call `billingClient.createCharge(...)`.
- Emits `MEDICINE_DISPENSED` to Kafka (`notification-events` topic).

## 4. Frontend Integration
- `/staff/pharmacy/dashboard`: Key statistics.
- `/staff/pharmacy/orders`: Main view for processing doctor's prescriptions into dispensings.
- Next.js acts as a BFF proxy over `http://localhost:8080/api/v1/pharmacy`.
