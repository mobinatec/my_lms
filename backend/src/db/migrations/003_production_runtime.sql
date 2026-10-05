CREATE TABLE IF NOT EXISTS messages (
  id VARCHAR(160) PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id VARCHAR(120) REFERENCES courses(id) ON DELETE SET NULL,
  text TEXT NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'unread',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_messages_user_created ON messages(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS carts (
  id VARCHAR(160) PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(40) NOT NULL DEFAULT 'membership',
  plan_key VARCHAR(80),
  title VARCHAR(300) NOT NULL,
  price NUMERIC(14,2) NOT NULL DEFAULT 0,
  status VARCHAR(40) NOT NULL DEFAULT 'cart',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_carts_user_status ON carts(user_id, status);

CREATE TABLE IF NOT EXISTS contact_submissions (
  id VARCHAR(160) PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  phone VARCHAR(60),
  email VARCHAR(320),
  subject VARCHAR(300),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_contacts_created ON contact_submissions(created_at DESC);

CREATE TABLE IF NOT EXISTS site_settings (
  key VARCHAR(80) PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS page_views (
  id VARCHAR(180) PRIMARY KEY,
  path VARCHAR(500) NOT NULL DEFAULT '/',
  section VARCHAR(160) NOT NULL DEFAULT 'home',
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  day DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_page_views_day ON page_views(day);
CREATE INDEX IF NOT EXISTS idx_page_views_section ON page_views(section);
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS progress NUMERIC(5,2) NOT NULL DEFAULT 0;
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS progress_updated_at TIMESTAMPTZ;
