# Codesazan v5.6.20 — Production Subscription Hardening

## هدف
پایدارسازی لایه اشتراک، سفارش، پرداخت آزمایشی و دسترسی دوره‌ها بدون تغییر یا حذف Volumeهای PostgreSQL/Redis/Media نسخه Production.

## تغییرات
- اضافه شدن `rank` و `duration_days` به جدول `plans`.
- حذف وابستگی runtime به ترتیب hard-coded پلن‌ها؛ سطح دسترسی از rank موجود در DB محاسبه می‌شود.
- اشتراک منقضی‌شده دیگر به‌عنوان اشتراک فعال محاسبه نمی‌شود.
- هنگام خرید اشتراک، تاریخ انقضا بر اساس `duration_days` ثبت می‌شود.
- خرید مجدد همان پلن فعال، مدت باقی‌مانده را به مدت جدید اضافه می‌کند.
- سفارش Checkout دارای `checkout_key` و unique constraint برای جلوگیری از ثبت دوباره سفارش در retry است.
- پرداخت آزمایشی فقط یک رکورد `payments` برای هر سفارش ایجاد می‌کند.
- Checkout به‌صورت transaction-based باقی مانده و cart فقط در همان تراکنش سفارش‌شده می‌شود.
- فرانت‌اند Checkout یک کلید idempotency در sessionStorage نگه می‌دارد.
- بازطراحی effectهای CourseDetail: ذخیره progress دیگر باعث recreate شدن HLS/video player نمی‌شود.
- Resume ویدئو از آخرین position ثبت‌شده ادامه پیدا می‌کند.

## حفظ داده Production
Compose همچنان باید از Volumeهای ثابت Production نسخه 5.6.12 استفاده کند:
- `codesazan-v5612-production-db_postgres_data`
- `codesazan-v5612-production-db_redis_data`
- `codesazan-v5612-production-db_media_data`

**هرگز برای این ارتقا `docker compose down -v` اجرا نکنید.**

## تست انجام‌شده
- syntax check فایل‌های Backend تغییرکرده: موفق.
- archive integrity با `unzip -t`: باید بدون خطا باشد.
- Full Vite production build در محیط ساخت این نسخه به دلیل نبود `node_modules` اجرا نشده است.
