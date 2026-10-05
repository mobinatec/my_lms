# Codesazan v6.0 Production

## Architecture
React/Vite SPA → Nginx Edge → Express modular monolith → PostgreSQL + Redis, with dedicated media and notification workers.

## Required production configuration
- `NODE_ENV=production`
- `AUTH_SECRET`: at least 32 random characters
- `ADMIN_PASSWORD_HASH` (preferred) or `ADMIN_PASSWORD`
- `POSTGRES_PASSWORD`: long random secret
- `CORS_ORIGIN`: exact public origin(s), not `*`
- `PAYMENT_PROVIDER=disabled` until a real gateway adapter is configured. `mock` is for non-production testing only.
- `STORAGE_PROVIDER=s3` for multi-server/large-media deployments; local storage is acceptable on a single VPS only with persistent backup.

## Deployment
Use the production override and inspect the resolved configuration before deployment:

```bash
docker compose -f docker-compose.yml -f docker-compose.production.yml config
docker compose -f docker-compose.yml -f docker-compose.production.yml build
docker compose -f docker-compose.yml -f docker-compose.production.yml up -d
```

## Backup
PostgreSQL must be backed up regularly. The project includes `ops/backup-postgres.sh` and the existing PowerShell scripts. Test restores periodically.

## Security changes in v6.1 production hardening
- Per-user salted scrypt password hashes with legacy hash migration on successful login.
- Expiring signed authentication tokens with constant-time signature comparison.
- Rate limits for authentication endpoints.
- Request IDs and production-safe error responses.
- Readiness endpoint `/api/ready`.
- Online checkout no longer marks an order paid unless the configured payment adapter verifies it.
- Course/content writes use PostgreSQL transactions to avoid partial content/lesson updates.
- Production deployment keeps application code inside immutable images and separates persistent data paths.
