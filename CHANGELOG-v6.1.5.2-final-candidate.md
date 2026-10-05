# v6.1.5.2 — Final Candidate / CI-CD Hardening

## Completed
- Corrected the GitHub Actions CI workflow path typo (`worker/src` instead of a non-existent `worker/src` reference mismatch).
- Added Node 20/npm cache configuration to CI.
- Added CI secret-pattern scan for common demo credentials and private-key material.
- Added tag-based production CD workflow at `.github/workflows/cd.yml`.
- Added `deploy-production.sh` with:
  - tag verification
  - production Compose validation
  - Docker Compose build/deploy
  - backend health check
  - automatic rollback to the previous Git revision on deployment failure
- Updated `VERSION` to `6.1.5.2`.

## Required GitHub production secrets
Create a GitHub Environment named `production` and add:
- `DEPLOY_HOST`
- `DEPLOY_USER`
- `DEPLOY_PATH`
- `SSH_PRIVATE_KEY`

The production server must have the repository checked out at `DEPLOY_PATH`, Docker/Compose installed, and a valid production `.env` already configured.

## Lockfile status
`package-lock.json` files were intentionally not fabricated. Generation was attempted with `npm install --package-lock-only`, but npm dependency resolution timed out in the build environment. CI therefore continues to use `npm install` until lockfiles can be generated and verified in a network-enabled environment.

## Verification
- ZIP/package source was extracted successfully.
- CI/CD YAML and deployment script were inspected.
- No production secret values were added to the package.
- Docker volumes are not removed by the deployment script.
