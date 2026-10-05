-- v5.6.23: store media duration discovered by ffprobe.
ALTER TABLE media_jobs ADD COLUMN IF NOT EXISTS duration_seconds NUMERIC(12,3);
CREATE INDEX IF NOT EXISTS idx_media_jobs_duration ON media_jobs(duration_seconds);
