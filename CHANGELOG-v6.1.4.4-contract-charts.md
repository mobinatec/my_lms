# Codesazan v6.1.4.4 — Contract Dashboard Charts

## Targeted fix
- Added the missing visual charts to `frontend/src/pages/Admin.jsx` in `ContractsPanel`.
- The contract dashboard now renders:
  - 30-day contract creation trend from `report.trend`.
  - Contract distribution by category from `report.categories`.
- Added responsive styles in `frontend/src/styles/global.css`.
- Kept the existing PostgreSQL fix from v6.1.4.3 unchanged (`date_day` alias).
- Kept admin authentication, `TRUST_PROXY=1`, setup compatibility, contract CRUD, signing and reporting logic unchanged.
- Updated the visible admin version label to v6.1.4.4.

## Important
The v6.1.4.3 backend already returned HTTP 200/304 for `/api/contracts/dashboard`; the missing charts were a frontend rendering gap because the returned `categories` and `trend` arrays were not rendered by `ContractsPanel`.
