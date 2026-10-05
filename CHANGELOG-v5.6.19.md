# Codesazan v5.6.19 — Production Learning

- Added relational lesson API backed by PostgreSQL.
- Added lesson CRUD authorization for admin/teacher and `lessons.manage`.
- Added lesson-level access checks based on course membership/access plans.
- Added lesson progress persistence and automatic course progress refresh.
- Added lesson progress resume/reporting to the course player.
- Synced course lesson metadata into PostgreSQL `lessons` during content synchronization.
- Added production indexes for lesson progress and enrollments.
- Fixed `/subscriptions/purchase` missing `await`, which could return an unresolved Promise.
- Extended `/api/content-integrity` with lesson and enrollment counts.
- Existing PostgreSQL external production volumes remain unchanged.
