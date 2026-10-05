# v5.6.37 — Persistent Data & PostgreSQL Stability

- `DATA_ROOT` واقعاً در Docker Compose استفاده می‌شود.
- PostgreSQL، Redis و Media/HLS از مسیر داده مستقل از پوشه نسخه استفاده می‌کنند.
- پیش‌فرض `DATA_ROOT=../codesazan-production-data` است.
- healthcheck PostgreSQL با `start_period` و retry بیشتر مقاوم‌تر شد.
- ساختار CRM، قراردادهای الکترونیکی، Media، Ticketing و RBAC نسخه 5.6.36 حفظ شده است.
- هیچ `down -v` یا حذف داده در نسخه انجام نمی‌شود.
