# Swarnika Care — Engineering Rules

These rules are the engineering constitution of Swarnika Care.

Any developer or AI agent modifying the project must follow them.

---

# 1. General Rules

1. Inspect existing code before changing it.
2. Never assume a feature exists without verification.
3. Do not introduce duplicate implementations.
4. Do not change architecture casually.
5. Preserve established domain boundaries.
6. Prefer simple solutions over unnecessary abstraction.
7. Do not over-engineer future requirements.
8. Never silently change an architecture decision.
9. Document significant architecture changes.
10. Never claim a feature is implemented if it is only planned.

---

# 2. Microservice Rules

1. Every service must have clear domain ownership.
2. A service must own its own domain data.
3. A service must not directly access another service's database.
4. Do not create cross-service JPA relationships.
5. Cross-service references should use IDs.
6. Do not create a microservice merely for CRUD separation.
7. Do not merge unrelated business domains into one service.
8. Do not introduce a new service without documenting its responsibility.

---

# 3. Database Rules

1. Database ownership belongs to the service.
2. No cross-service database joins.
3. No shared entity classes across service boundaries.
4. No foreign-key constraints across service databases.
5. Use service APIs or events for cross-domain communication.
6. Database migrations must be controlled.
7. Production schema changes must be reviewed.
8. Sensitive information must be protected.

---

# 4. IAM Rules

IAM owns:

- Authentication
- Users
- OTP
- Roles
- Permissions
- JWT
- Account status

Domain services must not own credentials.

Domain services may store IAM userId.

Doctor Service must not access IAM database directly.

Patient Service must not access IAM database directly.

---

# 5. Authentication Rules

1. Authentication is handled by IAM.
2. Email + OTP is the current authentication strategy.
3. OTP must be securely generated.
4. OTP must be hashed before persistence.
5. OTP must expire.
6. OTP must be one-time use.
7. OTP attempts must be limited.
8. OTP must never be logged.
9. OTP must never be returned in production responses.
10. Previous OTPs should be invalidated when appropriate.

---

# 6. JWT Rules

1. JWT must contain only authorization-related information.
2. Never put medical records into JWT.
3. Never put passwords into JWT.
4. Never put OTPs into JWT.
5. Validate issuer.
6. Validate audience.
7. Validate signature.
8. Validate expiration.
9. Backend must not trust spoofable identity headers.
10. Gateway must remove/overwrite unsafe identity headers where applicable.

---

# 7. Browser Security Rules

1. Never store JWT in localStorage.
2. Never store JWT in sessionStorage.
3. Prefer HttpOnly cookies for browser sessions.
4. Use Secure cookies in production.
5. Use appropriate SameSite policy.
6. Protect cookie-authenticated state-changing requests against CSRF.
7. Never expose server-only environment variables to the browser.

---

# 8. Authorization Rules

1. Authentication and authorization are different.
2. Role alone may not be enough.
3. Permission checks must be enforced server-side.
4. Object-level authorization is required where applicable.
5. A doctor must not automatically access every patient.
6. A hospital admin must not automatically access every hospital.
7. A patient must only access their own protected data.
8. Frontend permission checks are UX only.
9. Backend authorization is authoritative.

---

# 9. Role Rules

Initial roles:

SUPER_ADMIN
HOSPITAL_ADMIN
OPERATIONS_MANAGER
DOCTOR
PATIENT
FRONT_DESK_MANAGER
RECEPTIONIST
NURSE
LAB_TECHNICIAN
PHARMACIST
BILLING_STAFF

Future roles must not be implemented unless required.

Roles should not automatically be treated as hierarchical.

Use roles + permissions.

---

# 10. Public API Rules

1. Public APIs must be explicitly identified.
2. Public APIs must return public-safe DTOs.
3. Never return internal entities directly.
4. Never expose passwords.
5. Never expose OTP data.
6. Never expose internal permissions.
7. Never expose patient information.
8. Never expose internal operational secrets.
9. Never expose unpublished doctor profiles.
10. Public website must use dedicated public APIs.

---

# 11. Doctor Rules

Doctor identity consists of:

IAM User
+
Doctor operational profile

Doctor Service owns:

- Doctor
- DoctorProfile
- DoctorHospitalAssignment
- DoctorAvailability

Doctor credentials belong to IAM.

Doctor must not create a privileged account through public registration.

---

# 12. Doctor Public Profile Rules

Allowed states:

DRAFT
REVIEW
APPROVED
PUBLISHED

Only PUBLISHED profiles can appear in public APIs.

Operational status must remain independent from public publication status.

---

# 13. Organization Rules

Organization Service owns:

- Hospital
- Department

Do not create:

Department → Doctor JPA relationship

Instead:

Department.headDoctorId

or equivalent ID-based references.

---

# 14. API Rules

1. Use consistent REST naming.
2. Use versioned APIs.
3. Validate request DTOs.
4. Use response DTOs.
5. Do not expose persistence entities unnecessarily.
6. Use consistent error responses.
7. Use meaningful HTTP status codes.
8. Document public APIs.
9. Keep controllers thin.
10. Business logic belongs in services.

---

# 15. Service Rules

Controllers:

- Validate input
- Delegate work
- Return responses

Services:

- Business logic
- Transactions
- Domain rules

Repositories:

- Persistence only

Do not put business logic into repositories.

---

# 16. Feign Rules

OpenFeign may be used for synchronous service-to-service communication.

Rules:

1. Define explicit client interfaces.
2. Use DTOs.
3. Configure timeouts.
4. Handle downstream failures.
5. Do not retry blindly.
6. Do not create circular dependencies.
7. Do not use Feign as a substitute for events when asynchronous communication is appropriate.

---

# 17. Kafka Rules

Kafka is for asynchronous event-driven communication.

Rules:

1. Events must have clear ownership.
2. Event schemas must be stable.
3. Consumers should be idempotent.
4. Consumers must handle duplicate delivery.
5. Failures must not silently disappear.
6. Retry and DLQ should be used where required.
7. Do not use Kafka for operations requiring immediate synchronous validation.
8. Do not claim delivery guarantees without implementing them.

---

# 18. Transaction Rules

1. Keep transactions within service/database boundaries.
2. Avoid distributed transactions where possible.
3. For event publication coupled to database writes, consider Outbox Pattern.
4. Compensating actions must be considered when synchronous multi-service workflows partially fail.
5. Idempotency should be implemented for retryable operations.

---

# 19. Error Handling

1. Use domain-specific exceptions.
2. Use centralized exception handling.
3. Do not expose stack traces to users.
4. Do not expose database internals.
5. Log useful diagnostic information.
6. Avoid logging sensitive information.
7. Use meaningful error codes where appropriate.

---

# 20. Logging Rules

Never log:

- Passwords
- OTP
- JWT
- Secrets
- API keys
- Sensitive patient data

Use structured logging where possible.

---

# 21. Testing Rules

Every meaningful domain should have:

- Unit tests
- Service tests
- Controller tests where applicable
- Integration tests where needed
- Security tests
- Failure-path tests

Critical flows must test both success and failure.

---

# 22. Frontend Rules

1. Use one Care application with role-based routes.
2. Do not duplicate entire applications per role.
3. Keep server-side security authoritative.
4. Do not expose JWT to client-side JavaScript unnecessarily.
5. Use reusable components.
6. Handle loading states.
7. Handle empty states.
8. Handle error states.
9. Handle permission denied states.
10. Maintain responsive design.

---

# 23. Environment Rules

1. Secrets must not be committed.
2. Production secrets must come from secure configuration.
3. Do not hardcode credentials.
4. Do not hardcode internal secrets.
5. Use environment-specific configuration.
6. Never expose server secrets using NEXT_PUBLIC variables.

---

# 24. Git Rules

1. Make focused commits.
2. Do not commit secrets.
3. Do not commit generated build artifacts.
4. Do not mix unrelated features.
5. Review changes before merging.
6. Update documentation when architecture changes.

---

# 25. Production Safety

Before production:

- Security tests
- Authentication tests
- Authorization tests
- Integration tests
- Database migration review
- Backup strategy
- Monitoring
- Logging
- Error handling
- Rate limiting
- Secret management
- Disaster recovery

must be addressed according to system criticality.

---

# 26. Forbidden Patterns

Never:

- Access another service's database directly.
- Store JWT in localStorage.
- Put medical data into JWT.
- Expose OTP.
- Expose internal IAM APIs publicly.
- Return internal entities directly from public APIs.
- Allow public users to create privileged accounts.
- Trust role claims without validation.
- Trust client-side authorization.
- Create cross-service JPA relationships.
- Create unnecessary microservices.
- Claim unimplemented functionality is production-ready.

## Workforce Rules
- ROLE != DESIGNATION != POSITION.
- Roles are IAM security concepts. Designations are job titles. Positions are organizational seats.


## Organization Service & Hierarchy
1. Physical hierarchy must be strictly validated.
2. Do not trust client-provided hierarchy IDs in child resources; parent resource is authoritative.
3. Prevent deletion of any physical infrastructure entity that has active children.
