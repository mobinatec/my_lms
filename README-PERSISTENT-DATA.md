# Codesazan v5.6.30 — Persistent Data / Recovery

## منبع داده
این نسخه PostgreSQL را به عنوان Source of Truth استفاده می‌کند.

داده‌های bootstrap نسخه 5.6.29 شامل کاربران، نقش‌ها، دوره‌ها، portfolio، team، services و blog داخل پروژه باقی مانده‌اند و فقط در صورت خالی بودن PostgreSQL وارد می‌شوند.

پس از اولین اجرا، تغییرات انجام‌شده از پنل مدیریت روی PostgreSQL باقی می‌مانند و با restart یا rebuild بازنویسی نمی‌شوند.

## محل نگهداری روی ویندوز
- `data/postgres` دیتابیس اصلی
- `data/redis` Redis persistent
- `data/media` فایل‌های ویدئو و HLS

این‌ها bind mount هستند و متعلق به Docker Volume نیستند.

## عملیات امن
برای حذف کانتینرها:
`docker compose down`

برای ساخت مجدد:
`docker compose up -d --build`

**هیچ‌وقت برای این پروژه `docker compose down -v` را اجرا نکنید.**

## بکاپ
اسکریپت‌های backup/restore در پوشه `ops/` قرار دارند.
