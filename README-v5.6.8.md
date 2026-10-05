# Codesazan v5.6.8 — Auth DB Seed Fix

این نسخه یک خطای واقعی در startup را اصلاح می‌کند: در نسخه قبل `auth.seed()` بعد از migration اجرا نمی‌شد، بنابراین جدول‌های `roles` و `users` برای حساب‌های نمونه seed نمی‌شدند و Login با حساب‌های نمونه شکست می‌خورد.

Startup اکنون به ترتیب:
1. PostgreSQL migrations
2. seed نقش‌ها، کاربران نمونه و پلن‌های پایه
3. seed محتوای legacy به `content_items`
4. infrastructure checks

حساب‌های نمونه:
- admin / Admin123!
- employee / Employee123!
- teacher / Teacher123!
- team / Team123!
- user / User123!

نکته: این نسخه را به عنوان فیکس مشخص Login/seed می‌سازیم؛ هنوز بخش‌هایی از enrollment/order/cart/review در کد قدیمی نیاز به مهاجرت کامل به PostgreSQL دارند و این نسخه ادعا نمی‌کند همه آن‌ها یکپارچه شده‌اند.

اجرای بدون حذف داده:
```powershell
docker compose down --remove-orphans
docker rm -f codesazan-edge codesazan-media-worker codesazan-backend codesazan-frontend codesazan-postgres codesazan-redis 2>$null
docker compose up --build -d
docker compose ps
```

`docker compose down -v` اجرا نکنید.
