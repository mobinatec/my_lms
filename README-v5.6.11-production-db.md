# Codesazan v5.6.12 — Production DB Runtime

این نسخه ادامه مستقیم مسیر Production است و Recovery به JSON نیست.

## منبع اصلی داده
PostgreSQL منبع اصلی Runtime است. فایل‌های JSON فقط برای seed/migration اولیه نگه داشته شده‌اند و مسیرهای عمومی/پنل برای خواندن و نوشتن Runtime از PostgreSQL استفاده می‌کنند.

## مسیر Startup
1. PostgreSQL / Redis healthy
2. migrations
3. role + user seed از داده legacy
4. content seed از داده legacy
5. migration یک‌باره داده‌های legacy به PostgreSQL
6. infrastructure health check
7. شروع HTTP API

## حوزه‌های DB-backed
- Authentication / users / roles / permissions
- Courses / portfolio / services / team / blog در `content_items`
- Membership plans
- Subscriptions
- Orders / payments
- Enrollments / progress
- Reviews / moderation
- Messages to teacher
- Contact submissions
- Site settings
- Analytics / page views
- Audit logs
- Media storage metadata/runtime و HLS worker

## حفظ داده قبلی
Migration جدید non-destructive است. داده‌های legacy از `backend/src/data` و فایل‌های محتوای ماژول‌ها به PostgreSQL منتقل می‌شوند. فایل‌های JSON حذف نمی‌شوند.

برای جلوگیری از اجرای مجدد migration legacy، جدول `legacy_migration_state` استفاده می‌شود.

## حساب‌های نمونه
- `admin / Admin123!`
- `employee / Employee123!`
- `teacher / Teacher123!`
- `team / Team123!`
- `user / User123!`

این حساب‌های نمونه برای محیط توسعه/دمو هستند و در استقرار واقعی باید رمزها تغییر کنند.

## اجرا
فایل `.env.example` را به `.env` تبدیل کنید و مقادیر Secret را تغییر دهید، سپس:

```powershell
docker compose build

docker compose up -d

docker compose ps
```

سپس:

```powershell
curl http://localhost:8080/api/health
curl http://localhost:8080/api/content-integrity
```

### نکته مهم درباره داده قبلی
از `docker compose down -v` استفاده نکنید؛ این دستور Volume دیتابیس را حذف می‌کند. برای ادامه Production و حفظ داده، Volume PostgreSQL باید باقی بماند.

## Production hygiene
- `container_name` ثابت حذف شده تا چند Compose project باعث conflict کانتینر نشوند.
- پورت Edge قابل تنظیم است: `EDGE_PORT`.
- Backend پشت Nginx قرار دارد و مستقیماً publish نمی‌شود.
- PostgreSQL و Redis روی شبکه داخلی Compose هستند.
- Health check برای DB/Redis و بررسی storage قبل از HTTP startup وجود دارد.
- Rate limiting، Helmet، compression و JSON size limit فعال هستند.
- Worker جداگانه برای پردازش HLS/FFmpeg وجود دارد.

## Verification انجام‌شده در محیط ساخت
- تمام فایل‌های JavaScript بخش Backend با `node --check` بررسی شدند.
- ساختار migration و مسیر startup بررسی شد.
- ZIP نهایی با `unzip -t` بررسی خواهد شد.

## محدودیت تست این محیط
Docker Engine در محیط ساخت در دسترس نبود، بنابراین اجرای واقعی `docker compose up --build` در همین محیط امکان‌پذیر نبود. به همین دلیل ادعای تست Runtime Docker در این نسخه ارائه نمی‌شود. اجرای Compose روی سیستم مقصد باید مرحله نهایی verification باشد.

## v5.6.12 DB consistency correction
- `content_items` remains the canonical content payload store for courses/portfolio/team/services/blog.
- The relational `courses` table is now synchronized from course content so foreign keys used by enrollments/reviews/messages remain valid.
- Course create/update/delete operations synchronize both stores in PostgreSQL.
- Legacy JSON files are read only during startup seed/migration; runtime APIs do not use them as the source of truth.
- Edge defaults to host port `8080` to avoid the host port 80 conflict observed during the previous run.
