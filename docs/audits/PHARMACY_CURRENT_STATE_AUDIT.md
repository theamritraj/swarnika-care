# Pharmacy Service Current State Audit

## 1. Existing Architecture & Reusable Infrastructure
The existing Swarnika-Care architecture consists of:
- **Backend:** Java Spring Boot microservices registered in Eureka, behind an API Gateway (`localhost:8080`).
- **Security:** Managed by `iam-service`. Services extract HttpOnly JWT via `JwtAuthenticationFilter` and secure endpoints via `@PreAuthorize`.
- **Database:** Microservice-specific MySQL databases (`swarnikacare_<service>`) managed via Flyway (`V1__...sql`).
- **Frontend:** Next.js App Router acting as a BFF. Uses `/api/proxy/[...path]` for backend communication to preserve token safety.
- **Messaging:** `notification-service` configured with Kafka (`spring-kafka`) utilizing topics like `notification-events`.

## 2. Pharmacy Implementation Status
- **Backend (`pharmacy-service`):** Does not exist. No entity, DTO, Service, or Controller.
- **Frontend (`frontend/care/src/app/(staff)/staff/pharmacy`):** Only contains a placeholder `dashboard` structure. Complete implementation is missing.
- **API Gateway:** No routing exists for `/api/v1/pharmacy/**`.

## 3. Missing Components
1. **Backend Application:** Need to scaffold `pharmacy-service` matching existing module patterns (e.g., `pom.xml` mimicking `lab-service`).
2. **Database:** Need `pharmacy_db` and Flyway `V1__init_pharmacy_schema.sql` handling `Medicine`, `Batch`, `Stock`, `Prescription`, and `Dispensing`.
3. **API & Controllers:** Full REST API design for the domain.
4. **Integration:** `BillingClient` (Feign) for Dispensing charges and `KafkaTemplate` for Notification publishing (`MEDICINE_DISPENSED`).
5. **Frontend Roles:** Portals for Pharmacist (`/staff/pharmacy`), Doctor (`/doctor`), and Patient (`/patient`).
6. **E2E Tests:** Scripts mimicking actual production workflow without direct port calling.

## 4. Exact Implementation Plan
- **Phase A (Scaffold):** Create `pharmacy-service`, copy `JwtAuthenticationFilter` and `GlobalExceptionHandler` from existing services, add to `start_all.sh` and API Gateway.
- **Phase B (Database):** Flyway V1 schema containing Medicine, Batch, Stock, Prescription, Order, and Dispensing tables.
- **Phase C (Business Logic):** Entities, Repositories, Services enforcing FEFO and idempotency.
- **Phase D (Integration):** Billing and Notification integration via Feign/Kafka.
- **Phase E (Frontend):** Next.js UI integration with Server-side Pagination paradigms.
- **Phase F (Testing):** Execute Negative security tests, Concurrency checks, and E2E via `test_pharmacy_production_e2e.mjs`.

## 5. Risks
- **Data Integrity / Negative Stock:** Pharmacists double-clicking dispensing must be bounded safely via database locking.
- **Performance:** Loading entire batch logs to the browser will break rendering; strict backend pagination is required.
