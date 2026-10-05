#!/usr/bin/env bash
set -euo pipefail
: "${BACKUP_DIR:=./backups/postgres}"
mkdir -p "$BACKUP_DIR"
ts=$(date +%Y%m%d-%H%M%S)
file="$BACKUP_DIR/codesazan-$ts.sql.gz"
docker compose -f docker-compose.yml -f docker-compose.production.yml exec -T postgres pg_dump -U "${POSTGRES_USER:-codesazan}" -d "${POSTGRES_DB:-codesazan}" --no-owner --no-privileges | gzip > "$file"
echo "Backup created: $file"
