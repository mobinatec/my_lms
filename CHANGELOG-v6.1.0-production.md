# Codesazan v6.1.0 — Production Hardening

## Security
- Removed `.env` from the distributable package; only `.env.example` is shipped.
- Replaced fixed-salt password hashing with per-user salted scrypt hashes and legacy-hash migration.
- Added expiring HMAC authentication tokens and constant-time signature verification.
- Added dedicated admin authentication tokens with an 8-hour expiry.
- Disabled demo accounts automatically in production unless `SEED_DEMO_USERS=true`.
- Added authentication-specific rate limiting.
- Added request IDs and production-safe error messages.
- Removed static `ADMIN_TOKEN` authentication from the normal production path.
- Removed the public demo admin credentials from production UI.
- Media signing now requires `AUTH_SECRET` instead of a fallback secret.

## Data integrity
- PostgreSQL remains the source of truth; JSON files are bootstrap/legacy migration sources only.
- Course/content writes now update content, course metadata and lessons transactionally.
- Added PostgreSQL statement/query timeouts.
- Added PostgreSQL pool error handling.

## Payments
- Fixed the critical behavior where an `online` checkout could become `paid` without a real gateway verification.
- Added a payment-provider adapter boundary.
- Production defaults to `PAYMENT_PROVIDER=disabled`; online orders remain pending until a real gateway adapter verifies payment.
- `mock` is explicitly intended for development/test environments only.

## Operations
- Added `docker-compose.production.yml`.
- Added production security restrictions, restart policies and resource/process limits.
- Added `/api/ready` readiness endpoint.
- Hardened Nginx headers, proxy behavior and caching.
- Added PostgreSQL backup/restore shell scripts for VPS/Linux deployment.
- Added CI workflow for syntax, backend tests, frontend build and Compose validation.
- Added a security test covering password hashing and token tampering.
- Added a production deployment guide.

## Frontend
- Explicit RTL direction is enforced at HTML/body level.
- Added a global ErrorBoundary for graceful UI failure handling.
- Admin authentication is isolated in sessionStorage from ordinary user authentication.
- Updated admin UI version label to 6.1.0.
