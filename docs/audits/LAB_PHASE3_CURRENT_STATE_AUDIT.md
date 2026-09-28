# Lab Phase 3 Current State Audit

## 1. Existing Frontend Pages
The `frontend/care/src/app/(staff)/staff/lab` directory exists but only contains a basic `dashboard` structure.
- **Lab Technician Portal:** Missing `pending-orders`, `sample-collection`, `processing`, and `result-entry`.
- **Pathologist/Verifier Portal:** Missing `verification` queue and `release` workflows.
- **Doctor Portal:** Missing `lab-results` section to view patient results.
- **Patient Portal:** Missing `my-lab-results` and `reports`.

## 2. API / BFF Integration
- `api-gateway` routes are available for `/api/v1/lab/**`.
- BFF (`frontend/care/src/app/api/proxy/[...path]/route.ts`) acts as a pass-through layer holding the HttpOnly `swarnika_session`.
- The frontend needs to invoke `fetch('/api/proxy/lab/orders')` to reach the backend safely.

## 3. Implementation Sequence
1. Clean out dummy/placeholder directories in `staff/lab`.
2. Generate role-aware pages for Lab Techs, Verifiers, Doctors, and Patients utilizing `fetch` and standard Next.js components.
3. Hook these up to `/api/proxy/lab/...`.
4. Refine the E2E script `scripts/test_lab_production_e2e.mjs`.
5. Run backend regression and frontend validation.
