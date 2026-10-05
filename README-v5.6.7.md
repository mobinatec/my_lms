# Codesazan v5.6.7 — Single Source of Truth

این نسخه ادامه مستقیم v5.6.6 است و هدف آن رفع ریشه‌ای ناهماهنگی داده‌هاست.

## تغییرات اصلی
- کاربران نمونه و کاربران ثبت‌نامی اکنون از PostgreSQL خوانده و در PostgreSQL نوشته می‌شوند.
- نقش‌ها در جدول `roles` seed/upsert می‌شوند.
- کاربران نمونه هنگام startup در PostgreSQL seed/upsert می‌شوند:
  - admin / Admin123!
  - employee / Employee123!
  - teacher / Teacher123!
  - team / Team123!
  - user / User123!
- احراز هویت، `/auth/me`، middleware کاربر و middleware ادمین به DB متصل شده‌اند.
- ویرایش/تعلیق کاربر در پنل ادمین به جدول `users` نوشته می‌شود.
- پلن‌های اصلی free/normal/vip در PostgreSQL seed/upsert می‌شوند.
- endpoint عمومی پلن‌ها از PostgreSQL می‌خواند.
- وضعیت membership از جدول `subscriptions` و `plans` خوانده می‌شود.
- checkout موفق، subscription را در PostgreSQL ثبت می‌کند.
- دوره‌ها، پورتفولیو، تیم، خدمات و وبلاگ از `content_items` استفاده می‌کنند.
- مسیرهای اصلی learning برای course list/detail/create/update از DB استفاده می‌کنند.
- fallback محتوای فرانت برای داده‌های اصلی حذف شده تا JSON قدیمی نتواند مشکل API/DB را پنهان کند.
- `/api/content-integrity` اکنون فقط شمارش واقعی PostgreSQL را گزارش می‌کند.

## نکته مهم
فایل‌های JSON قدیمی هنوز برای بعضی داده‌های مهاجرت‌نشده مانند پیام‌ها، reviewها، enrollmentهای قدیمی و سفارش‌های قدیمی در پروژه باقی مانده‌اند؛ این نسخه ادعا نمی‌کند تمام domainها یکباره به DB منتقل شده‌اند. هدف این نسخه، حذف دوگانگی از هویت کاربران، نقش‌ها، پلن‌های اصلی و محتوای اصلی سایت است.

## اجرا
```powershell
docker compose down --remove-orphans
docker rm -f codesazan-edge codesazan-media-worker codesazan-backend codesazan-frontend codesazan-postgres codesazan-redis 2>$null
docker compose up --build -d
docker compose ps
```

**از `docker compose down -v` استفاده نکنید** چون volume دیتابیس را پاک می‌کند.

## بررسی یکپارچگی
بعد از بالا آمدن backend، endpoint زیر تعداد واقعی رکوردهای PostgreSQL را نشان می‌دهد:
`/api/content-integrity`

خروجی شامل `users`, `roles`, `plans` و تعداد `courses`, `portfolio`, `services`, `team`, `blog` از `content_items` است.
