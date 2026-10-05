-- v5.6.22: persistent media processing jobs
CREATE TABLE IF NOT EXISTS media_jobs (
  id VARCHAR(120) PRIMARY KEY,
  filename TEXT NOT NULL,
  original_name TEXT,
  mime TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'queued',
  progress INTEGER NOT NULL DEFAULT 0,
  quality VARCHAR(20),
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  error TEXT,
  hls_path TEXT,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_media_jobs_status ON media_jobs(status);
CREATE INDEX IF NOT EXISTS idx_media_jobs_updated ON media_jobs(updated_at);
