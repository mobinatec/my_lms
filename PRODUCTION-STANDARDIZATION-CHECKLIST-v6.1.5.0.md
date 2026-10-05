# Production Standardization Checklist — v6.1.5.0

## Completed in this candidate
- [x] Persistent PostgreSQL/Redis/media bind mounts retained.
- [x] Production runtime hardening retained.
- [x] Upload limits made explicit: images 10 MB, generic files 25 MB, video media 500 MB.
- [x] Profile/team/site branding uploads moved to persistent media storage.
- [x] Site favicon support added.
- [x] Circular avatar beside the public profile/panel button.
- [x] Circular team avatars.
- [x] Authenticated generic file upload endpoint added with private/public separation.
- [x] Multer file-size errors return HTTP 413.
- [x] Backend syntax validation passed.

## Still required before the final Production Release
- [ ] Generate and commit package-lock.json files for every Node service.
- [ ] Replace npm install with npm ci after lockfiles are present.
- [ ] Run the full frontend Vite production build.
- [ ] Run backend automated tests against PostgreSQL/Redis.
- [ ] Run Docker Compose build/start on the target Windows/VPS environment.
- [ ] Verify health/readiness endpoints after migration.
- [ ] Verify backup + restore on a disposable test copy.
- [ ] Configure real domain + HTTPS.
- [ ] Configure real SMTP/SMS/payment provider secrets.
- [ ] Verify Zarinpal callback and idempotent payment verification in staging.
- [ ] Freeze the final release only after the above checks are green.
