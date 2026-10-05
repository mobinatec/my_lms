# Codesazan — v5.6.11 Production DB

نسخه فعلی مسیر Production را ادامه می‌دهد و PostgreSQL را به عنوان Source of Truth استفاده می‌کند.

جزئیات معماری و migration در `README-v5.6.11-production-db.md` است.

## Production first start (Windows)

The repository intentionally does not contain a real `.env` file. Before the first `docker compose up --build`, run:

```powershell
powershell -ExecutionPolicy Bypass -File .\SETUP-PRODUCTION.ps1
```

This creates a local `.env` with cryptographically random `POSTGRES_PASSWORD`, `AUTH_SECRET`, and an initial random `ADMIN_PASSWORD`. The generated admin password is printed once; save it securely.

Then run:

```powershell
docker compose up --build
```

For the hardened production overlay:

```powershell
docker compose -f docker-compose.yml -f docker-compose.production.yml up --build -d
```
