# LIS Document Generation (PDF/HL7) Gap Analysis

## 1. Executive Summary
The Lab Result Release workflow technically works at the data level, triggering Billing and Notification. However, there is no physical PDF report or standardized HL7 ORU message output generated automatically.

## 2. Existing Capabilities
- `lab-service` handles all granular test parameters (`numericValue`, `unit`, `referenceRange`, `abnormalFlag`).
- The `RELEASED` state is cleanly isolated.

## 3. Missing Functionality
- No `document-service` integration.
- No dynamic PDF rendering mechanism (e.g. JasperReports, Thymeleaf to PDF, or Puppeteer).
- No HL7 v2/v3 translation layer.

## 4. Required API/Event Contract
For asynchronous decoupled document generation:
1. `lab-service` should continue publishing `LAB_RESULT_RELEASED` (which it currently does).
2. The `document-service` (or equivalent microservice) should consume this Kafka event.
3. The consumer fetches full data via `LabClient` Feign.
4. It compiles the PDF/HL7 string and pushes it to an S3/Blob store.
5. It publishes `DOCUMENT_GENERATED` referencing the S3 URL.
6. Frontend downloads securely via pre-signed URL.

## 5. Future Implementation Plan
- **Phase A:** Create `document-service`.
- **Phase B:** Attach PDF templates matching Swarnika Care branding.
- **Phase C:** S3 Storage mapping.
- **Phase D:** Secure UI viewing.
*(This functionality is marked out of scope for the current LIS Phase 3 release).*
