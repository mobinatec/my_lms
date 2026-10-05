# Codesazan — Persistent Data Final

The primary persistent data lives on the host filesystem:

- `data/postgres` — PostgreSQL cluster
- `data/redis` — Redis AOF data
- `data/media` — uploaded source media and generated HLS

Do not put placeholder files inside `data/postgres`. PostgreSQL must initialize that directory when it is empty.

## First run

From the project directory:

```powershell
docker compose up -d --build
```

## Normal restart

```powershell
docker compose down
docker compose up -d
```

The data directories remain on the host.

## Backup

```powershell
.\scripts\backup-db.ps1
```

## Restore

```powershell
.\scripts\restore-db.ps1 -DumpFile .\backups\codesazan-YYYYMMDD-HHMMSS.dump
```

## Do not delete

Do not manually delete `data/postgres`, `data/redis`, or `data/media` if you want to preserve production data.
