# Codesazan v6.1.5.1 — Production ENV Migration Hotfix

Fixes a packaging/setup regression in v6.1.5.0 where an existing `.env` file was left untouched even when newly required production variables were missing.

## Fix
- SETUP-PRODUCTION.ps1 now safely completes an existing `.env` instead of returning early.
- Missing/blank INTEGRATION_CONFIG_KEY is generated automatically.
- Existing secrets are preserved.
- Missing upload limits, PUBLIC_BASE_URL and DB timeout settings are added with production-safe defaults.
- New installations receive all required variables from the start.

## Important
No database volumes are removed or reset.
