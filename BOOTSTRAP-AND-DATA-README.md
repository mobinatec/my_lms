# v5.6.38 — Bootstrap gate and persistent data

این نسخه قبل از اجرای Backend/Workerها یک سرویس `bootstrap` اجرا می‌کند.
این سرویس همه migrationهای PostgreSQL، seed اولیه و migration غیرمخرب داده قدیمی را کامل می‌کند.
تا وقتی bootstrap موفق نشود، backend و workerها شروع نمی‌شوند؛ بنابراین خطاهای `relation does not exist` دیگر مخفی نمی‌مانند.

## اجرای معمول
```powershell
docker compose up --build
```

## بررسی
```powershell
docker compose ps
docker compose logs bootstrap --tail=200
curl http://localhost:8080/api/health
curl http://localhost:8080/api/content-integrity
```

## داده پایدار
`DATA_ROOT` باید به همان پوشه‌ای اشاره کند که دیتای تولیدی قبلی در آن قرار دارد. اگر نسخه قبلی در یک پوشه جداست، قبل از اجرای این نسخه DATA_ROOT را به مسیر واقعی داده قبلی تنظیم کنید.

**هیچ‌وقت برای این کار `docker compose down -v` یا حذف پوشه postgres انجام ندهید.**
