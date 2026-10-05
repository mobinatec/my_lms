# Codesazan v5.6.6 — Real DB-backed Content

This release fixes the partial DB migration identified in v5.6.5.

## Source of truth
PostgreSQL `content_items` is now the source of truth for:
- portfolio
- team
- services
- blog
- courses

Legacy JSON files are seed sources only.

## Admin
Admin now reads/writes the same PostgreSQL content store for the above domains.
Services and Blog have their own admin menu items and CRUD endpoints.
Admin loading uses `Promise.allSettled` so one failed endpoint cannot blank the whole panel.

## Courses and plans
Course detail `/api/learning/courses/:id` reads the DB-backed course service.
Course plan CRUD reads/writes course payloads in PostgreSQL.
Membership plans are seeded into the PostgreSQL `plans` table.

## Verification
Backend JavaScript syntax checks pass for the modified files.
A full Vite build was not completed in this environment because dependency installation timed out; Docker/Vite should be verified on the user's machine.
