INSERT INTO permissions(key,title,category,description) VALUES ('orders.manage','مدیریت سفارش‌ها','فروش','تغییر وضعیت و نهایی‌سازی سفارش‌ها') ON CONFLICT(key) DO NOTHING;

ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS tracking_code VARCHAR(120);
CREATE UNIQUE INDEX IF NOT EXISTS uq_contact_tracking_code ON contact_submissions(tracking_code) WHERE tracking_code IS NOT NULL;

CREATE TABLE IF NOT EXISTS loyalty_tiers (
  key VARCHAR(60) PRIMARY KEY,
  title VARCHAR(120) NOT NULL,
  min_points INTEGER NOT NULL DEFAULT 0,
  discount_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
INSERT INTO loyalty_tiers(key,title,min_points,discount_percent) VALUES
('bronze','برنزی',0,0),('silver','نقره‌ای',100,3),('gold','طلایی',500,7),('vip','ویژه',1000,12)
ON CONFLICT(key) DO NOTHING;

CREATE TABLE IF NOT EXISTS loyalty_accounts (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  points_balance INTEGER NOT NULL DEFAULT 0,
  lifetime_points INTEGER NOT NULL DEFAULT 0,
  tier_key VARCHAR(60) NOT NULL DEFAULT 'bronze' REFERENCES loyalty_tiers(key),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS loyalty_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  points INTEGER NOT NULL,
  kind VARCHAR(40) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_loyalty_ledger_user_created ON loyalty_ledger(user_id,created_at DESC);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal_amount NUMERIC(14,2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(14,2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS points_redeemed INTEGER NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_code VARCHAR(120);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_due_at TIMESTAMPTZ;
CREATE UNIQUE INDEX IF NOT EXISTS uq_orders_tracking_code ON orders(tracking_code) WHERE tracking_code IS NOT NULL;

CREATE TABLE IF NOT EXISTS notification_templates (
  key VARCHAR(100) PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  channel VARCHAR(20) NOT NULL,
  subject TEXT,
  body TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
INSERT INTO notification_templates(key,title,channel,subject,body) VALUES
('order.pending','سفارش منتظر پرداخت','sms','', 'سفارش شما با کد {trackingCode} ثبت شده و هنوز پرداخت نشده است.'),
('order.pending.email','سفارش منتظر پرداخت ایمیلی','email','پرداخت سفارش {trackingCode} تکمیل نشده است', 'سفارش شما ثبت شده اما هنوز پرداخت نشده است. کد پیگیری: {trackingCode}'),
('order.paid','تأیید خرید','sms','', 'پرداخت سفارش {trackingCode} با موفقیت ثبت شد.'),
('order.paid.email','تأیید خرید ایمیلی','email','تأیید خرید {trackingCode}', 'سفارش شما با کد {trackingCode} با موفقیت ثبت شد.'),
('contact.received','دریافت درخواست','sms','', 'درخواست شما دریافت شد. کد پیگیری: {trackingCode}'),
('contact.received.email','دریافت درخواست ایمیلی','email','دریافت درخواست {trackingCode}', 'درخواست شما دریافت شد. کد پیگیری: {trackingCode}')
ON CONFLICT(key) DO NOTHING;

CREATE TABLE IF NOT EXISTS notification_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel VARCHAR(20) NOT NULL,
  event_key VARCHAR(100) NOT NULL,
  recipient VARCHAR(320) NOT NULL,
  subject TEXT,
  body TEXT NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'queued',
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  provider_message_id TEXT,
  error TEXT,
  related_type VARCHAR(80),
  related_id VARCHAR(160),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notification_jobs_status ON notification_jobs(status,scheduled_at);
CREATE INDEX IF NOT EXISTS idx_notification_jobs_created ON notification_jobs(created_at DESC);
