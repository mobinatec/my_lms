# Codesazan v5.6.13 — Permission Catalog

- Added PostgreSQL `permissions` catalog table.
- Added PostgreSQL `role_permissions` many-to-many table.
- Existing role permission JSON is preserved for compatibility and synchronized with `role_permissions` for editable roles.
- Added authenticated `GET /api/admin/permissions` endpoint.
- Admin role editor now uses a categorized permission picker instead of comma-separated text.
- Selected permissions appear directly below the picker as removable chips with `×`.
- Added a full-access option for the existing `*` admin permission.
- User editor now uses the same permission picker for per-user permissions.
- Added 26 initial permissions covering dashboard, users, security, courses, lessons, students, messages, content, sales, analytics, audit and settings.
- No existing PostgreSQL data is deleted; migration is additive.
