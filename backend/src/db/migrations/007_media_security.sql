-- v5.6.21: media/HLS security is tokenized at the API layer.
-- No destructive schema change is required; lesson.video_key remains the ownership link.
CREATE INDEX IF NOT EXISTS idx_lessons_video_key ON lessons(video_key);
