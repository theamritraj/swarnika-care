# Swarnika Care Frontend Architecture

## Objective
Establish a robust, secure Next.js architecture integrating with the API Gateway and IAM Authentication via Email OTP, before building the full UI. We want to implement a vertical slice of Patient and Doctor login -> IAM -> JWT -> Gateway -> protected API.

## CRITICAL ARCHITECTURAL DECISION: Pure BFF
The browser MUST NOT receive or store the JWT in JavaScript-accessible storage.
The architecture is:
```
                    Browser
                       │
                HttpOnly Cookie
                       │
                       ▼
                ┌──────────────┐
                │    Next.js   │
                │              │
                │ Middleware   │
                │ Server APIs  │
                │ Route Groups │
                └──────┬───────┘
                       │
                Server-side fetch
                       │
             Authorization: Bearer JWT
                       │
                       ▼
                ┌──────────────┐
                │ API Gateway  │
                └──────────────┘
```
Token storage is strictly: HttpOnly, Secure, SameSite=Strict Cookie.

## 1. Routing Architecture (Route Groups)
We will maintain a single Next.js application using App Router with Route Groups to cleanly separate layouts and access boundaries:
- `(public)`: Public pages (Landing, Login)
- `(patient)`: Secure patient portal (`/patient/dashboard`)
- `(doctor)`: Secure doctor portal (`/doctor/dashboard`)
- `(staff)`: Secure staff portal (`/staff/dashboard`)
- `(admin)`: Secure admin portal (`/admin/dashboard`)
Route groups must not appear in URLs.

## 2. Authentication & JWT Strategy
- **Login Flow**:
  1. User submits Email + OTP.
  2. Next.js API Route (`/api/auth/verify`) calls the backend Gateway (`/api/v1/auth/verify-otp`).
  3. Gateway returns the JWT.
  4. Next.js API Route stores the JWT in an `HttpOnly`, `Secure`, `SameSite=Strict` cookie (`swarnika_session`).
- **Authenticated Requests**:
  Server-side fetch using `lib/server/api-client.ts` will read the HttpOnly cookie and append `Authorization: Bearer <JWT>` to the API Gateway request.

## 3. Session Restoration & Logout
- **Logout**: A Next.js API route (`/api/auth/logout`) will destroy the HttpOnly cookie and redirect to login.

## 4. Role-Based Routing & Middleware
Middleware (`middleware.ts`) provides lightweight navigation protection.
- Check if `swarnika_session` cookie exists. If not, redirect to `/login` for protected paths.
- It does NOT replace backend authorization. Backend is authoritative.

## 5. Permission-Based UI
`hasPermission()` controls UI visibility. It is NOT a security boundary. 

## 6. Error Handling
- **401 Unauthorized**: Redirect to `/login`.
- **403 Forbidden**: Redirect to `/403`.
- **Error States**: Implemented via `error.tsx` per Next.js conventions for route groups.
- **Loading States**: Implemented via `loading.tsx` per Next.js conventions.

## 7. Dashboard Shells
- `(patient)/patient/dashboard`: Patient dashboard slice
- `(doctor)/doctor/dashboard`: Doctor dashboard slice
- `(staff)/staff/reception/dashboard`: Receptionist shell
- `(staff)/staff/nurse/dashboard`: Nurse shell
- `(staff)/staff/lab/dashboard`: Lab technician shell
- `(staff)/staff/pharmacy/dashboard`: Pharmacist shell
- `(staff)/staff/billing/dashboard`: Billing staff shell
- `(admin)/admin/dashboard`: Super admin shell
