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


<!-- BEGIN AWS Agent Toolkit rules -->
# AWS Guidance for the new AWS experience

This user has signed up for the new AWS experience. This experience lets you sign into AWS using a social provider and requires the following additional context.

Where this guidance conflicts with the project's own instructions, the project's instructions take precedence.

## Context

### Terminology:

- Say "project" instead of "account" — a project contains an AWS account and settings for sharing with other collaborators
- Say "team member" instead of "IAM user" — users are invited by email, not created or federated in IAM
- Say "AWS Settings" when referring to management tasks at [settings.aws.com](https://settings.aws.com/) (project management, billing, team members, spend limits). Users view their actual AWS resources in the AWS Management Console.
- Say "selected Region" when referring to the user's Region — not "home Region"
- The user has a managed IAM experience. This includes a managed service control policies (SCP) and resource control policies (RCP) that govern the use of AWS. They will still need to use IAM to create policies to let services work with each other. If there are questions about the SCPs or RCPs, go to the documentation at https://docs.aws.amazon.com/accounts/latest/reference/scps-and-rcps-for-projects.html

### Constraints:

- All projects share a single AWS Region determined by the user's contact address. Resources cannot be created in other Regions
- When developing:
  - MUST create all Regional resources in the project's assigned Region
  - You CAN create AWS WAF and Cloudwatch Logs resources in us-east-1 when there are global resources (like a global WAF instance) that require a connection to dependencies in us-east-1. You should not use these for any other reason, because resources in the selected Region will provide lower cost (due to no cross-Region traffic), increased availability (due to no cross-Region traffic), and easier manageability (due to not needing to look in another Region). When you need to do an inventory of resources, you need to look in both the selected Region and us-east-1 for Cloudwatch Logs or WAF resources.
  - MUST NOT attempt to create Lambda, API Gateway, or other Regional resources in any other Region
  - MUST direct users to confirm their Region in AWS Settings > View all projects > Overview > Additional Info > Region. If the user cannot confirm their Region, check in ~/.aws/config
  - MUST NOT use Lambda@Edge — excluded from both Lambda and CloudFront
  - MUST NOT use CloudFormation StackSets — no multi-account or multi-Region deployments
  - MUST NOT attempt cross-Region actions — no cross-Region replication for DynamoDB/S3/RDS, no multi-Region KMS keys
  - MUST NOT use Route 53 cross-Region routing — geolocation, latency-based, and failover routing policies are not available
  - CloudFront is a global service and its actions ARE allowed in `us-east-1`. A user can create a CloudFront distribution pointing to their project-region Lambda function URL or API Gateway. However, Lambda and API Gateway themselves MUST NOT be created in `us-east-1` — they must be in the project Region.
  - Reduced availability in `eu-north-1` specifically: Amazon Rekognition, Amazon Textract, Amazon Personalize, AWS App Runner are not available in that Region.
- IAM permissions for human access are managed by AWS. Don't assign roles to team members unless absolutely necessary
- The user may have a spend limit if they are on the paid plan. The limit that pauses their project if it's exceeded. If resources suddenly become inaccessible, ask if they have a spend limit configured. Only project owners can modify a spend limit.
- When developing:
  - MUST ask about spend limit status if the user reports sudden "Access Denied" errors on operations that previously worked
  - MUST direct users to check spend status in AWS Settings > Billing
  - MUST check if a user has upgraded their account to the paid plan
  - MUST ask the user if they want to clean up the successfully created resources or keep them to reduce cost
- The user sets up billing, creates spend limits, and retrieves and pays invoices in AWS Settings. The user creates budgets and optimizes their costs in the AWS Billing and Cost Management console
- Not all AWS services are available. If a service isn't working, do the following:
  1. Run the command `aws freetier get-account-plan-state`
  2. If accountPlanType": "FREE", check the [Free Tier supported services list](https://docs.aws.amazon.com/accounts/latest/reference/supported-services-sign-up-new.html#supported-services-free-tier) next,
  3. If accountPlanType": "PAID", check the [Paid Tier supported services list](https://docs.aws.amazon.com/accounts/latest/reference/supported-services-sign-up-new.html#supported-services-paid-plan).
  4. If neither list shows the service, check the [Not supported for this experience list](https://docs.aws.amazon.com/accounts/latest/reference/supported-services-sign-up-new.html#unsupported-services). The user will need to activate advanced features to access this service.
- Users can activate advanced AWS services and capabilities for their account.
- Before starting a task, check whether a relevant AWS skill is available. Load the skill with retrieve_skill and prefer its guidance over general knowledge.

### Help level

- help_level (required): LOW, MEDIUM, or HIGH. While a user is building, you MUST ask the user: "How much guidance would you like from me? Low (I only flag security risks), medium (I ask a couple of clarifying questions if something seems off), or high (I explain what I'm doing, suggest alternatives, and flag best practices)."

You CAN update this rule file to save a user's help_level.

Constraints for each level:

**LOW:**

- MUST follow all constraints in this context file
- MUST execute the user’s request without modification
- MUST NOT ask clarifying questions unless the action would create a security vulnerability
- MUST NOT suggest alternatives or improvements

**MEDIUM:**

- MUST execute the user's request
- MAY ask up to two clarifying questions per task if the request has an ambiguity or a potential issue
- MUST NOT repeat a question or suggestion the user has already dismissed
- MUST NOT explain trade-offs or alternatives unless the user asks

**HIGH:**

- MUST explain what each step does and why before executing it
- MUST suggest alternatives when a better approach exists
- MUST flag best practices and explain trade-offs
- MUST still execute the user's choice if they disagree with a suggestion

<!-- END AWS Agent Toolkit rules -->
