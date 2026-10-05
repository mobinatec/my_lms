# Codesazan v6.1.4 — Production Hardening Release Candidate

## Changes
- Removed the real `.env` file from the distributable package.
- Kept `.env.example` as the safe configuration template.
- Added `PRODUCTION-FINAL-CHECKLIST.md` with deployment, security and smoke-test requirements.
- Kept `SEED_DEMO_USERS=false` in the example configuration.
- Documented the preferred `ADMIN_PASSWORD_HASH` production configuration.
- Preserved the v6.1.3 admin-login separation and logout behavior.
- No application feature modules were intentionally changed in this hardening release.

## Security boundary

The ZIP package contains no deployment database password, auth secret, or admin password. The deployment operator must generate/set these secrets on the target host.

## Verification limitation

Docker/browser end-to-end execution is not claimed in this build environment. The package was structurally inspected and the release archive was checked for accidental `.env` inclusion and known secret values.
