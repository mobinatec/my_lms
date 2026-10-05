# Codesazan v6.1.4.18

- User creation save button is fixed/sticky at the top of the user editor.
- Permission options are true toggles: clicking an already selected permission removes it in place.
- Full-access permission is also a toggle.
- Contract creation scrolls the admin content container to the beginning of the contract form.
- Contract form keeps a visible top margin.
- Contract creation now avoids using the synthetic `admin-env` token as a PostgreSQL `created_by` foreign key.
- Contract validation errors remain user-facing (422) and are shown in the contract toast instead of generic alerts.
- PostgreSQL volumes/data are untouched.
