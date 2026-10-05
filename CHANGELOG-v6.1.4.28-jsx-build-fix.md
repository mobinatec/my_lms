# Codesazan v6.1.4.28
- Fixed the JSX tag mismatch in `frontend/src/pages/Admin.jsx` inside `NotificationsPanel`.
- The notification hub now closes its `<section>` with `</section>` before closing the outer container.
- No database volumes or persisted data are changed.
- Full Vite build could not be completed in the build environment because `npm install` timed out; the reported JSX error itself was corrected.
