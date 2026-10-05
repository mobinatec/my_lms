# Codesazan v5.6.23 — Admin Media Control

این نسخه رابط واقعی مدیریت ویدئو را به زیرساخت Persistent Media Jobs نسخه 5.6.22 متصل می‌کند.

## امکانات پنل مدیر

- منوی جدید «مدیریت ویدئو / Media»
- نمایش همه Media Jobهای PostgreSQL
- وضعیت تبدیل: در صف / در حال تبدیل / آماده / خطا
- نمایش درصد پیشرفت و کیفیت در حال پردازش
- نمایش مدت ویدئو که Worker با ffprobe استخراج می‌کند
- نمایش تعداد تلاش‌ها و سقف Retry
- نمایش متن خطای FFmpeg
- Retry برای Jobهای failed
- اتصال هر ویدئو به یک درس از داخل پنل
- حذف ویدئو، خروجی HLS و پاک‌کردن اتصال آن از درس
- آپلود ویدئو از خود پنل با درصد پیشرفت آپلود
- Refresh خودکار پنل در زمان queued/processing

## Backend

- `GET /api/admin/media`
- `POST /api/admin/media/:id/retry`
- `PUT /api/admin/media/:id/attach`
- `DELETE /api/admin/media/:id`
- permission: `lessons.manage`
- migration `009_media_job_duration.sql`
- ثبت Audit Log برای Retry، اتصال و حذف

## Worker

- اجرای ffprobe برای استخراج duration
- ذخیره `duration_seconds` در PostgreSQL
- Worker اگر قبل از migration اجرا شود، تا آماده‌شدن جدول `media_jobs` منتظر می‌ماند.

## داده‌های Production

هیچ Volume جدیدی تعریف نشده است و Volumeهای ثابت Production نسخه 5.6.12 حفظ می‌شوند.

## تست انجام‌شده

- `node --check` برای کدهای جدید backend و worker: موفق
- `npm install` برای تست build فرانت در محیط ساخت: به دلیل timeout محیط اجرا کامل نشد؛ بنابراین Full Vite Build در این محیط تأیید نشده است.
