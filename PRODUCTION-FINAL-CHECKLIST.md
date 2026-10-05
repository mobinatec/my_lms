# Codesazan v6.1.4 — Production Final Checklist

This release is a production-hardened distribution package. No real `.env` or deployment secrets are included.

## Before first deployment

1. Run `SETUP-PRODUCTION.ps1` (Windows) or create `.env` from `.env.example` manually.
2. Set a public `CORS_ORIGIN` to the exact HTTPS origin.
3. Keep `SEED_DEMO_USERS=false`.
4. Prefer `ADMIN_PASSWORD_HASH` for a manually managed admin password. `ADMIN_PASSWORD` is supported for first-start convenience when generated locally by the setup script.
5. Use HTTPS at the public reverse proxy/load balancer.
6. Keep PostgreSQL and Redis private; expose only the edge proxy.
7. Configure regular PostgreSQL backups and test a restore before going live.
8. Configure S3/object storage for multi-server deployments or large media if required.
9. Keep `PAYMENT_PROVIDER=disabled` until a real payment adapter is configured and verified.

## Deployment

```bash
docker compose -f docker-compose.yml -f docker-compose.production.yml config
docker compose -f docker-compose.yml -f docker-compose.production.yml build
docker compose -f docker-compose.yml -f docker-compose.production.yml up -d
```

## Smoke test

- `GET /api/health` returns 200.
- `GET /api/ready` returns ready after migrations.
- `/auth` uses normal user authentication.
- `/admin/login` uses `/api/admin/auth/login`.
- Admin dashboard loads only with an admin token.
- Admin logout clears the admin session.
- Site settings save and remain after a refresh/restart.
- Demo users remain disabled in production.
- Uploaded media survives container recreation through the persistent data path.
- Backup and restore are verified on the deployment host.

## Important release boundary

Source inspection can verify configuration, routes, permissions and packaging. It cannot prove browser-level end-to-end behavior or a real backup restore without executing those operations on the deployment host.
