# Codesazan v6.1.2 — First Start

This package is prepared for the requested `docker compose up --build` first-start flow.

## 1. Start

From this directory run:

```powershell
docker compose up --build
```

The package includes a generated `.env` so Compose interpolation does not fail on first start.

## 2. Important security note

The included `.env` contains unique generated secrets for this package. Do not commit or publish it. It is already ignored by `.gitignore`.

Before exposing the server to the public Internet, rotate the generated `AUTH_SECRET`, `POSTGRES_PASSWORD`, and `ADMIN_PASSWORD`, or run `SETUP-PRODUCTION.ps1` after removing `.env` to generate a fresh set.

## 3. Production profile

After verifying the normal stack, use:

```powershell
docker compose -f docker-compose.yml -f docker-compose.production.yml up --build -d
```

For a public deployment, set `CORS_ORIGIN` to the real HTTPS origin and put TLS termination in front of Nginx.
