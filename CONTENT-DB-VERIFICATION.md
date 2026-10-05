# v5.6.6 DB-backed content verification

## Root causes fixed
- Admin portfolio/team were still reading legacy JSON instead of PostgreSQL `content_items`.
- Services and Blog had no Admin menu/routes.
- Course detail under `/learning/courses/:id` still read the legacy learning JSON service.
- Admin course-plan listing was not consistently using the PostgreSQL content store.
- Admin `Promise.all` could blank the whole panel when one request failed.

## Current architecture
- PostgreSQL `content_items` is the source of truth for portfolio, team, services, blog, and courses.
- Legacy JSON files are seed sources only.
- Admin CRUD writes back to PostgreSQL.
- Course detail reads the DB-backed course service.
- Admin loader uses `Promise.allSettled` so one failed widget does not hide all other panel data.
