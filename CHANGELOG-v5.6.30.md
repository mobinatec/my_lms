# v5.6.30 — Persistent Data + Recovery

- PostgreSQL moved to host bind mount: `${DATA_ROOT}/postgres`
- Redis moved to host bind mount: `${DATA_ROOT}/redis`
- Media/HLS moved to host bind mount: `${DATA_ROOT}/media`
- Bootstrap data from v5.6.29 retained.
- Bootstrap content is now non-destructive: existing PostgreSQL rows are never overwritten from JSON on restart.
- Legacy JSON migration remains one-time and non-destructive.
- Added PostgreSQL backup/restore PowerShell scripts under `ops/`.
- Added persistent-data documentation.
