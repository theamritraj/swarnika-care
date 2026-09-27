# ADR 006: Two Frontend Applications

## Status
Accepted

## Context
As the Swarnika Care enterprise platform grows, combining the public-facing hospital website (www.swarnikahospitals.com) and the authenticated enterprise application (care.swarnikahospitals.com) into a single Next.js application leads to unnecessary complexity.
The public website has different requirements (SEO optimization, public marketing pages, health library, international patients) compared to the authenticated Care platform (strict security, BFF pattern, RBAC, domain profiles, dashboards).
Combining them mixes security contexts and increases the risk of accidental exposure of authenticated routes or logic.

## Decision
We will explicitly split the frontend into two distinct Next.js applications:
1. `public-website` (Port 3000): Handles all public-facing unauthenticated traffic (marketing, public doctor search, hospital info).
2. `care` (Port 3001): Handles all authenticated enterprise traffic (Patient, Doctor, Staff, and Admin portals).

## Consequences
- **Security Isolation**: The BFF and strict HttpOnly cookie patterns are isolated to the `care` app.
- **Independent Scaling**: The public website can be deployed and scaled independently (e.g., heavily cached via CDN) from the highly dynamic `care` application.
- **Simpler Routing**: We avoid complex middleware logic attempting to distinguish between public pages and protected route groups.
- **Clear Boundaries**: The separation enforces a clear architectural boundary between marketing/public discovery and clinical/administrative operations.
