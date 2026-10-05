# Codesazan v5.6.42 — Bootstrap Startup Hotfix

## هدف
رفع خطای Bootstrap هنگام recovery/startup طولانی PostgreSQL بدون حذف یا جابه‌جایی داده‌های Production.

## اصلاحات
- Bootstrap قبل از migration یک `SELECT 1` واقعی روی PostgreSQL اجرا می‌کند.
- تعداد تلاش پیش‌فرض از 30 به 90 افزایش یافت.
- فاصله تلاش‌ها 5 ثانیه و قابل تنظیم از `.env` است.
- healthcheck PostgreSQL زمان شروع و تعداد retry بیشتری دارد.
- ساختار ZIP با پوشه ریشه‌ی `codesazan-v5.6.42-crm-bootstrap-hotfix` ارائه شده تا نسخه با 5.6.40 اشتباه نشود.
- Persistence، مسیر DATA_ROOT، CRM UI، CRM contracts، RBAC و migrationهای قبلی تغییر نکرده‌اند.

## نکته مهم
این نسخه هیچ دستور حذف دیتابیس یا volume ندارد.
از `docker compose down -v` و حذف `codesazan-production-data` خودداری کنید.
