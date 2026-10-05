#!/usr/bin/env bash
set -euo pipefail

TAG="${1:?release tag is required}"
REMOTE_DIR="$(cd "$(dirname "$0")" && pwd)"

cd "$REMOTE_DIR"
git fetch --tags --prune origin

git rev-parse --verify "refs/tags/$TAG" >/dev/null
PREVIOUS="$(git rev-parse HEAD)"
echo "Deploying $TAG (previous: $PREVIOUS)"

git checkout --detach "$TAG"

rollback() {
  echo "Deployment failed; rolling back to $PREVIOUS"
  git checkout --detach "$PREVIOUS" || true
  docker compose -f docker-compose.yml -f docker-compose.production.yml up -d --build
}
trap rollback ERR

docker compose -f docker-compose.yml -f docker-compose.production.yml config >/dev/null
docker compose -f docker-compose.yml -f docker-compose.production.yml up -d --build

for i in $(seq 1 30); do
  if docker compose -f docker-compose.yml -f docker-compose.production.yml exec -T backend wget -q -O - http://localhost:4000/api/health >/dev/null 2>&1; then
    echo "Production health check passed."
    trap - ERR
    exit 0
  fi
  sleep 5
done

echo "Production health check failed."
exit 1
