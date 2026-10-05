#!/usr/bin/env bash
set -euo pipefail
: "${BACKUP_FILE:?Set BACKUP_FILE=/path/to/backup.sql.gz}"
gunzip -c "$BACKUP_FILE" | docker compose -f docker-compose.yml -f docker-compose.production.yml exec -T postgres psql -U "${POSTGRES_USER:-codesazan}" -d "${POSTGRES_DB:-codesazan}"
echo "Restore completed from: $BACKUP_FILE"
