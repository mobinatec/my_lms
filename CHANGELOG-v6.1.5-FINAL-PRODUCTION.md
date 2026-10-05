# Codesazan v6.1.5 FINAL PRODUCTION

Final production package based on v6.1.5.1.

- Safe `.env` migration preserves existing secrets and adds missing required settings.
- `SEED_DEMO_USERS=false` by default.
- Removed the legacy `ChangeMe123!` password fallback; users without a stored password hash are not created by bootstrap.
- First admin password is generated locally by `SETUP-PRODUCTION.ps1` and is not stored in this ZIP.
- Secrets remain supplied through `.env`; provider credentials are kept out of frontend assets.
- Upload limits, integration encryption key, DB timeouts and public base URL are provisioned by setup.
- Persistent host data is preserved; no volume deletion is required.
- Admin login remains `/admin/login`.

Validation completed here:
- Node syntax checks passed for authentication, admin authentication, notifications, tickets and notification worker.
- ZIP integrity is verified after packaging.

Target-machine validation still required before live release:
- `docker compose up --build`
- full Vite production build
- service health/smoke tests
- package-lock generation/verification if required by the deployment policy

The isolated build environment used for packaging does not include Docker and could not access uncached npm registry packages, so those target-machine checks are intentionally not claimed as passed.
