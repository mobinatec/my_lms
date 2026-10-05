# Codesazan v5.6.48 — Production Base

This archive formalizes the last available build-fixed project as the v5.6.48 development base.

## Baseline rule
No functional feature was added in this baseline. Future versions must be based on this tree.

## Production architecture
- PostgreSQL 16 with host bind persistence via DATA_ROOT
- Redis 7 with AOF persistence
- Bootstrap migration gate before backend/workers
- Backend healthcheck before frontend/edge
- Persistent media/HLS storage
- RBAC/permissions
- Courses/lessons/subscriptions
- Secure media/HLS processing
- Notifications
- CRM, tickets and contracts
- Admin media and communication control centers

## Data safety
Do not run `docker compose down -v` for this production data layout.

## Validation note
This baseline was derived from the v5.6.47 build-fix archive. ZIP integrity and source-level structure were checked; a full Docker/Vite build must be performed in the user's Docker environment before production deployment.
