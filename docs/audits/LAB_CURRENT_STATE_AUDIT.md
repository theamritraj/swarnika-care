# Laboratory Information System (LIS) - Current State Audit

## 1. Existing Capabilities
- **Encounter Service**: Supports creation of `ClinicalOrder`s (Type: `LAB` or `IMAGING`) during patient encounters.
- **Patient Service**: Provides patient identities and basic details.
- **Doctor Service**: Provides doctor identities and roles.
- **Organization Service**: Provides hospital and department identities.
- **Billing Service**: Manages financial transactions, invoices, and charges.
- **Notification Service**: A Kafka-based async pipeline handling emails (and potentially in-app).

## 2. Missing Capabilities
- A dedicated `lab-service` for tracking specimens, results, verification, and releasing to patients/doctors.
- A Lab Test Catalog mapping `testName` (from `ClinicalOrder`) to specimen types, processing procedures, and reference ranges.
- A Lab Order lifecycle (ORDERED -> SAMPLE_COLLECTED -> IN_PROCESS -> RESULT_PENDING -> VERIFIED -> RELEASED).
- Integration to generate a Billing Charge once a Lab Order is processed/completed.
- Notification events for `LAB_RESULT_RELEASED` and `LAB_CRITICAL_RESULT`.
- UI pages in `frontend/care/staff/lab` to operate the workflows.

## 3. Integration Plan
1. **Lab Order Creation**: The Lab Technician or system will accept a `ClinicalOrder` from `EncounterService` to create a `LabOrder`. `LabService` will validate the `ClinicalOrder` via `EncounterClient`.
2. **Specimen Collection**: Lab technicians will collect specimens mapped to the `LabOrder` and assign accession numbers.
3. **Result Entry & Verification**: Technicians will input results based on the test catalog. Pathologists/Verifiers will approve the results.
4. **Billing**: Once a lab test is processed/ordered, `LabService` will call `BillingClient` or send a Kafka event to create a charge in `billing-service`.
5. **Notification**: Once verified/released, `LabService` will emit a Kafka event for Notification.

## 4. Implementation Sequence
1. Scaffolding `lab-service` (pom.xml, Application, Configs, Gateway routes).
2. Domain modeling & Flyway schema (Catalog, Order, Specimen, Result).
3. Implement `LabCatalogController` & Service.
4. Implement `LabOrderController` & integration with `EncounterClient`.
5. Implement Specimen collection & processing.
6. Implement Result Entry, Verification & Release workflows.
7. Integrate Billing Service (via REST or Kafka) to generate charges.
8. Integrate Notification Service (via Kafka) for results.
9. Security & Hospital Scope hardening (PreAuthorize, JwtAuthenticationFilter).
10. Update BFF and frontend.
11. E2E verification tests.
