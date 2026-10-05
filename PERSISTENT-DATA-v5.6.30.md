# Codesazan v5.6.31 — Persistent Host Data

این نسخه وابستگی PostgreSQL/Redis/Media به Docker Named Volume را حذف می‌کند.

## محل داده‌ها
- `data/postgres` → PostgreSQL
- `data/redis` → Redis AOF
- `data/media` → فایل‌های آپلودی و HLS
- `backups` → بکاپ‌های SQL (پس از اجرای اسکریپت)

## رفتار حذف
`docker compose down`، حذف کانتینرها و حتی `docker compose down -v` نباید این داده‌های bind-mounted را حذف کند.

**اما حذف دستی پوشه `data`، پاک کردن دیسک، یا حذف خود پروژه/پوشه آن، داده را حذف می‌کند.** برای همین بکاپ SQL را هم در نظر گرفته‌ایم.

## شروع
```powershell
docker compose up -d --build
```

## بکاپ
```powershell
.\scripts\backup-db.ps1
```

## بازیابی
```powershell
.\scripts\restore-db.ps1 .\backups\codesazan-YYYYMMDD-HHMMSS.sql
```

## انتقال داده قدیمی از Docker Volume
اگر Volume قبلی هنوز وجود دارد:
```powershell
.\scripts\migrate-old-docker-volume.ps1
```

اگر Volume قبلی واقعاً با `docker volume rm` یا ابزارهای prune حذف شده باشد، این نسخه نمی‌تواند داده حذف‌شده را بازسازی کند.
