# Codesazan v5.6.22 — Persistent Media Jobs

## هدف
پردازش ویدئو دیگر فقط به Redis وابسته نیست و وضعیت Job در PostgreSQL ذخیره می‌شود.

## تغییرات
- جدول `media_jobs` برای وضعیت پایدار پردازش ویدئو.
- وضعیت‌های queued / processing / ready / failed.
- progress، quality، attempts، error و زمان‌های شروع/پایان در DB.
- Worker بعد از Restart، Jobهای queued/processing قابل‌بازیابی را دوباره وارد صف می‌کند.
- FFmpeg تا سقف `max_attempts` تلاش مجدد می‌کند.
- وضعیت Redis همچنان برای نمایش سریع حفظ شده، ولی PostgreSQL منبع پایدار Job است.
- Worker به PostgreSQL متصل شد.
- Migration جدید `008_media_jobs.sql`.
- Volumeهای Production تغییر نمی‌کنند و migration به‌صورت non-destructive اجرا می‌شود.
