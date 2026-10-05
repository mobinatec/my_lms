# سیاست ماندگاری داده Codesazan

از v5.6.30 منبع اصلی داده‌های Runtime روی دیسک میزبان و در پوشه `data/` است، نه Docker Named Volume.

این طراحی باعث می‌شود lifecycle کانتینر/Compose از lifecycle داده جدا باشد.

- Build مجدد → داده باقی می‌ماند
- حذف کانتینر → داده باقی می‌ماند
- `docker compose down` → داده باقی می‌ماند
- `docker compose down -v` → داده‌های bind mount شده حذف نمی‌شوند
- حذف دستی `data/` → داده حذف می‌شود

بنابراین پوشه `data/` باید مثل دیتابیس اصلی محافظت و Backup شود.
