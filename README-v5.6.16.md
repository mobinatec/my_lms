# Codesazan v5.6.16 — Permissions + Persistent Production Data

این نسخه بر پایه v5.6.15 ساخته شده است. قابلیت مدیریت دسترسی‌ها حفظ شده و مشکل مهم نسخه‌های قبلی، یعنی ساخت Volume جدید PostgreSQL با تغییر نام پوشه نسخه، برطرف شده است.

## اصل مهم داده

داده‌های Production به نام پوشه نسخه وابسته نیستند. Compose از Volumeهای خارجی و ثابت زیر استفاده می‌کند:

- `codesazan-v5612-production-db_postgres_data`
- `codesazan-v5612-production-db_redis_data`
- `codesazan-v5612-production-db_media_data`

در نتیجه اجرای این نسخه از همان PostgreSQL/Redis/Media سالم v5.6.12 استفاده می‌کند. هیچ دستور حذف Volume در Compose وجود ندارد.

## اجرا

قبل از اجرا مطمئن شوید Volumeهای بالا در Docker وجود دارند. سپس:

```powershell
docker compose up --build -d
docker compose ps
curl http://localhost:8080/api/health
curl http://localhost:8080/api/content-integrity
```

اگر Volume Production هنوز وجود ندارد، این نسخه عمداً آن را خودکار نمی‌سازد؛ ابتدا باید Volume صحیح Production مشخص شود.

## هشدار

از `docker compose down -v` استفاده نکنید.
