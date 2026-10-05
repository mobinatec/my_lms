# Codesazan v5.6.29

## CRM + Ticketing Core
- Added PostgreSQL CRM contacts, activities and customer timeline.
- Added PostgreSQL tickets and ticket messages.
- Added admin CRM CRUD and activity APIs.
- Added ticket list/detail/create/update/reply/internal-reply/delete APIs.
- Added granular RBAC permissions for CRM and Ticketing.
- New permissions are inserted into the existing permissions catalog and therefore appear in the existing role editor.
- Added visible Admin sidebar modules: CRM مشتریان and مرکز تیکت.
- Added dashboard quick cards for CRM and Ticket Center.
- Added responsive CRM cards, timeline modal, ticket queue and ticket conversation UI.
- Existing PostgreSQL production data/volumes are not deleted or reset by this version.

## Validation
- Backend new modules passed `node --check`.
- Full Vite build could not be executed in this environment because dependency installation timed out; Docker is not available in this build environment.
