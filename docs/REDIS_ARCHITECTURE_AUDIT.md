# REDIS ARCHITECTURE AUDIT

## 1. Current State
- Redis is currently **not** implemented in any of the 14 microservices.
- No `spring-boot-starter-data-redis` dependency exists in `pom.xml`.
- No Redis connections in `application.yml`.
- OTP state is currently managed via relational DB entities (`OtpVerification` in `iam-service`).
- There are no distributed rate limiting mechanisms in API Gateway.
- Appointments and IPD bed allocations rely purely on MySQL logic/transactions.
- Caching is not implemented across read-heavy resources (doctor, org).

## 2. Missing Redis Usages
- **IAM Service:** OTP storage, expiration, and request rate-limiting.
- **API Gateway:** Distributed rate limiting per route/IP/hospital.
- **Appointment Service:** Short-lived lock and idempotency for bookings.
- **IPD Service:** Distributed lock for bed allocation.
- **Doctor Service:** Caching for doctor profiles and availability.
- **Organization Service:** Caching for stable hierarchy metadata.
- **Notification Service:** Deduplication for SMS/WhatsApp events.
- **Nursing Service:** Realtime ephemeral state for Nurse Call board.

## 3. Risks & Considerations
- Introducing Redis must not replace MySQL as the source of truth.
- Core clinical and billing data must not be stored in Redis.
- A failed Redis instance must gracefully degrade caching features and rely on DB locks/rate-limit failsafe.
- Multi-hospital isolation must be maintained in key design.

## 4. Proposed Implementation
- **Dependencies:** Add `spring-boot-starter-data-redis` (Lettuce) to a shared library or individual poms.
- **Keys:** Use `swarnika:{env}:{domain}:{hospitalId}:{purpose}:{id}` naming convention.
- **Serialization:** Jackson/JSON string serialization.

## 5. Rejected Use Cases
- Storing primary patient medical records in Redis.
- Storing billing records or invoices in Redis.
- Replacing Kafka for durable notification queues.

## 6. Key Naming Strategy & TTL Matrix
- OTP (`swarnika:prod:iam:{hId}:otp:{email}`) - 5 min TTL
- Rate limit (`swarnika:prod:gateway:rate:ip:{ip}`) - 1 min TTL
- Doctor Cache (`swarnika:prod:doctor:{hId}:profile:{docId}`) - 15 min TTL
- Bed Lock (`swarnika:prod:ipd:{hId}:bed:{bedId}:lock`) - 30 sec TTL

## 7. Next Steps
1. Add `redis` to `docker-compose.yml` for local development.
2. Update `iam-service` to replace DB-backed OTP with Redis.
3. Add distributed rate limiter to `api-gateway`.
4. Add distributed lock to `appointment-service` and `ipd-service`.
