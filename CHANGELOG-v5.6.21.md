# Codesazan v5.6.21 — Secure Media / HLS

- Removed public static HLS exposure.
- Added short-lived signed media tokens.
- Media access is resolved through the relational lesson -> course ownership chain.
- Paid course media requires an authenticated user with valid course access.
- Free course media can still be accessed by guests when the course permits guest access.
- HLS master and variant playlists are rewritten to carry the signed token to nested playlists/segments.
- Original uploaded source files are protected by the same signed token model.
- Added `idx_lessons_video_key` migration for media ownership lookup.
- CourseDetail now requests a secure media URL before playing protected media.
