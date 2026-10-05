# Codesazan v5.6.31 — True Persistent PostgreSQL

## Persistence fix
- PostgreSQL data is stored in `${DATA_ROOT}/postgres` on the host filesystem.
- Redis data is stored in `${DATA_ROOT}/redis`.
- Uploaded media/HLS is stored in `${DATA_ROOT}/media`.
- Docker named volumes are not used for the primary persistent data.
- PostgreSQL `.gitkeep` is intentionally not placed inside the PostgreSQL data directory because `initdb` requires the directory to be empty on first initialization.
- `docker compose down` and container recreation do not remove the host bind-mounted data.
- `docker compose down -v` does not remove host bind-mounted directories either; nevertheless it is not recommended for routine operation.

## Database source of truth
- PostgreSQL remains the runtime source of truth.
- Legacy JSON files are bootstrap/migration sources only.
- Existing PostgreSQL rows are not overwritten by the legacy content seed.
- One-time legacy migration is guarded by `legacy_migration_state`.

## Recovery / operations
- `scripts/backup-db.ps1` — PostgreSQL logical backup.
- `scripts/restore-db.ps1` — restore a PostgreSQL dump.
- `scripts/migrate-old-docker-volume.ps1` — helper for migrating an existing old Docker PostgreSQL volume into the host-persistent database workflow.

## Important
If an old Docker volume was already deleted, its live database contents cannot be reconstructed from the ZIP. The project still contains the previous version's seed/legacy data and performs a non-destructive bootstrap/migration into a new PostgreSQL database.
