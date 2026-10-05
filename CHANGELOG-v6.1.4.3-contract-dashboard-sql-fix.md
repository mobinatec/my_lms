# Codesazan v6.1.4.3 — Contract Dashboard SQL Fix

Targeted hotfix based on runtime logs from v6.1.4.2.

## Fixed
- Fixed PostgreSQL syntax error in `backend/src/modules/crm/contracts.service.js` in the contract dashboard 30-day trend query.
- Replaced the ambiguous `day` alias with explicit `AS date_day` and `AS count`.

## Preserved
- v6.1.4.2 PowerShell setup compatibility.
- v6.1.4.1 rate-limit / `TRUST_PROXY=1` hardening.
- Admin authentication separation.
- No unrelated modules or database migrations changed.
