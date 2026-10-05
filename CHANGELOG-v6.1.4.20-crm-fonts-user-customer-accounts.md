# v6.1.4.20

- Increased CRM typography and control sizes for readability.
- Admin user editor now supports username, email and optional password change.
- Added CRM customer account linkage via `crm_contacts.user_id`.
- Customer create/edit supports username/password; passwords use the existing scrypt auth service.
- Customer accounts use the main `/auth` login flow; admin login remains separate.
- Added migration `014_crm_customer_accounts.sql`.
- PostgreSQL volumes/data are preserved.
