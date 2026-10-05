# Codesazan v6.1.5.0 — Production Standardization + Media Identity

## Production hardening
- Added explicit image/file upload limits: 10 MB images, 25 MB generic files, 500 MB video media.
- Passed the integration encryption key and DB timeout settings explicitly into runtime/notification worker containers.
- Kept PostgreSQL/Redis/media data on persistent host bind mounts.
- Version frozen at 6.1.5.0 as a Production Standardization candidate; this is not yet the final production release.

## Identity and uploads
- Added persistent upload service under the shared media volume.
- Profile images for all authenticated users can be uploaded and stored as files rather than Data URLs.
- Admin can upload team/profile images and generic professional files.
- Site logo and favicon can be uploaded from Site Settings.
- Favicon is applied dynamically to the browser tab.
- Team avatar and the profile button avatar are circular.
- Generic authenticated file upload accepts any MIME type up to the configured 25 MB limit; image-specific uploads require an image MIME type.
- Existing video/HLS upload path remains unchanged with its separate 500 MB limit.

## Validation
- Backend JavaScript syntax check passed for all backend source files.
- Frontend full Vite build is still pending because the current environment does not have frontend dependencies installed and package-lock files could not be generated within the build environment timeout.
