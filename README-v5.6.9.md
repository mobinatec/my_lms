# Codesazan v5.6.9 — DB/Startup/Admin Login Stabilization

این نسخه بر پایه v5.6.8 ساخته شده و سه ایراد عملی مهم را اصلاح می‌کند:

1. PostgreSQL migration + user/role seed + content seed قبل از باز شدن HTTP انجام می‌شود؛ API قبل از آماده شدن DB پاسخ نمی‌دهد.
2. مسیرهای CRUD مدیریت برای `services` و `blog` در admin routes ثبت شده‌اند.
3. نقش‌ها در پنل مدیریت از PostgreSQL خوانده/ذخیره می‌شوند، نه roles.json.
4. `/admin` اگر کاربر مدیر وارد نشده باشد، فرم ورود واقعی با همان `/api/auth/login` نشان می‌دهد و پس از ورود token/user را در localStorage قرار می‌دهد.
5. fallback محتوای تیم و fallback پلن‌های عضویت از کلاینت حذف شده‌اند؛ UI دیگر نباید دادهٔ قدیمی JSON را جای DB نمایش دهد.
6. `/api/content-integrity` همچنان شمارش واقعی PostgreSQL را گزارش می‌کند.

## حساب نمونه
- admin / Admin123!
- employee / Employee123!
- teacher / Teacher123!
- team / Team123!
- user / User123!

## اجرای امن با حفظ Volume
```powershell
docker rm -f codesazan-edge codesazan-frontend codesazan-backend codesazan-media-worker codesazan-redis 2>$null
docker compose up --build -d
docker compose ps
```

`docker compose down -v` نزنید.

## بررسی DB
```powershell
curl http://localhost/api/content-integrity
```
باید `source: postgresql` و تعداد واقعی کاربران/نقش‌ها/پلن‌ها/محتوا را برگرداند.

## وضعیت تست این build
- Backend فایل‌های تغییرکرده با `node --check` بررسی شده‌اند.
- ZIP با `unzip -t` بررسی می‌شود.
- اجرای کامل Vite در محیط ساخت به timeout خورد؛ بنابراین موفقیت کامل Docker/Vite ادعا نمی‌شود.
