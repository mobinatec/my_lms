CREATE TABLE IF NOT EXISTS content_items (
  id VARCHAR(160) NOT NULL,
  content_type VARCHAR(40) NOT NULL,
  title VARCHAR(400) NOT NULL DEFAULT '',
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (content_type, id)
);
CREATE INDEX IF NOT EXISTS idx_content_type ON content_items(content_type);

INSERT INTO plans(key,title,price,features,is_free,active)
VALUES
('free','رایگان',0,'["دسترسی به دوره‌های رایگان","مطالب عمومی سایت","بدون هزینه"]'::jsonb,TRUE,TRUE),
('normal','عادی',1490000,'["دوره‌های عادی","محتوای آموزشی ویژه","پشتیبانی استاندارد"]'::jsonb,FALSE,TRUE),
('vip','VIP',3490000,'["همه امکانات عادی","دوره‌های VIP","پشتیبانی ویژه و مزایای VIP"]'::jsonb,FALSE,TRUE)
ON CONFLICT(key) DO NOTHING;
