CREATE TABLE IF NOT EXISTS notification_rules (
  event_key VARCHAR(120) PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  category VARCHAR(80) NOT NULL DEFAULT 'عمومی',
  description TEXT NOT NULL DEFAULT '',
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  in_app BOOLEAN NOT NULL DEFAULT TRUE,
  email BOOLEAN NOT NULL DEFAULT TRUE,
  sms BOOLEAN NOT NULL DEFAULT FALSE,
  push BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_key VARCHAR(120) NOT NULL,
  title VARCHAR(220) NOT NULL,
  body TEXT NOT NULL,
  related_type VARCHAR(80),
  related_id VARCHAR(160),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_created ON user_notifications(user_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_notifications_unread ON user_notifications(user_id,read_at) WHERE read_at IS NULL;
CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_key VARCHAR(120) NOT NULL,
  in_app BOOLEAN NOT NULL DEFAULT TRUE,
  email BOOLEAN NOT NULL DEFAULT TRUE,
  sms BOOLEAN NOT NULL DEFAULT FALSE,
  push BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY(user_id,event_key)
);
CREATE TABLE IF NOT EXISTS integration_settings (
  provider_key VARCHAR(80) PRIMARY KEY,
  kind VARCHAR(30) NOT NULL,
  title VARCHAR(180) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT FALSE,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
INSERT INTO notification_rules(event_key,title,category,description,in_app,email,sms) VALUES
('ticket.created','ثبت تیکت','تیکت','ثبت تیکت جدید و کد رهگیری',TRUE,TRUE,TRUE),
('ticket.reply','پاسخ تیکت','تیکت','ارسال پاسخ جدید در تیکت',TRUE,TRUE,TRUE),
('ticket.assigned','ارجاع تیکت','تیکت','ارجاع تیکت به کارمند/مدرس/عضو تیم',TRUE,TRUE,TRUE),
('ticket.closed','بسته شدن تیکت','تیکت','بسته شدن تیکت',TRUE,TRUE,FALSE),
('contract.created','قرارداد جدید','قرارداد','ایجاد قرارداد جدید',TRUE,TRUE,TRUE),
('contract.sent','ارسال قرارداد','قرارداد','ارسال قرارداد برای مشتری',TRUE,TRUE,TRUE),
('contract.signed','امضای قرارداد','قرارداد','امضای قرارداد',TRUE,TRUE,TRUE),
('order.pending','خرید در انتظار پرداخت','پرداخت','سفارش ایجاد شده ولی پرداخت کامل نشده',TRUE,TRUE,TRUE),
('order.paid','خرید موفق','پرداخت','پرداخت با موفقیت تأیید شده',TRUE,TRUE,TRUE),
('order.failed','پرداخت ناموفق','پرداخت','پرداخت ناموفق یا لغوشده',TRUE,TRUE,TRUE),
('subscription.expiring','موعد تمدید پلن','اشتراک','نزدیک شدن زمان تمدید اشتراک',TRUE,TRUE,TRUE),
('subscription.expired','پایان پلن','اشتراک','پایان اعتبار پلن',TRUE,TRUE,TRUE),
('assignment.created','کار ارجاع شده','کار','ارجاع کار به کارمند/مدرس/عضو تیم',TRUE,TRUE,TRUE),
('system.announcement','اعلان سیستم','سیستم','اعلان عمومی سیستم',TRUE,TRUE,FALSE)
ON CONFLICT(event_key) DO NOTHING;
INSERT INTO integration_settings(provider_key,kind,title,active,config) VALUES
('zarinpal','payment','زرین‌پال',FALSE,'{}'),
('payment.card_to_card','payment','کارت به کارت',FALSE,'{}'),
('payment.cash','payment','پرداخت حضوری',FALSE,'{}'),
('payment.wallet','payment','کیف پول داخلی',FALSE,'{}'),
('payment.free','payment','رایگان / بدون پرداخت',TRUE,'{}'),
('email.smtp','email','ایمیل SMTP',FALSE,'{}'),
('sms.kavenegar','sms','کاوه‌نگار',FALSE,'{}'),
('sms.smsir','sms','SMS.ir',FALSE,'{}'),
('sms.ipanel','sms','IPPanel / فراز SMS',FALSE,'{}'),
('sms.melipayamak','sms','ملی‌پیامک',FALSE,'{}'),
('sms.webhook','sms','SMS Webhook عمومی',FALSE,'{}'),
('email.webhook','email','Email Webhook عمومی',FALSE,'{}')
ON CONFLICT(provider_key) DO NOTHING;

ALTER TABLE payments ADD COLUMN IF NOT EXISTS authority VARCHAR(180);
CREATE INDEX IF NOT EXISTS idx_payments_authority ON payments(authority) WHERE authority IS NOT NULL;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS tracking_code VARCHAR(120);
CREATE UNIQUE INDEX IF NOT EXISTS uq_tickets_tracking_code ON tickets(tracking_code) WHERE tracking_code IS NOT NULL;
INSERT INTO notification_templates(key,title,channel,subject,body) VALUES
('ticket.created','ثبت تیکت','sms','', 'تیکت شما با کد رهگیری {trackingCode} ثبت شد.'),
('ticket.created.email','ثبت تیکت ایمیلی','email','ثبت تیکت {trackingCode}', 'تیکت شما با کد رهگیری {trackingCode} ثبت شد و در حال بررسی است.'),
('ticket.reply','پاسخ تیکت','sms','', 'برای تیکت {trackingCode} پاسخ جدید ثبت شد.'),
('ticket.reply.email','پاسخ تیکت ایمیلی','email','پاسخ جدید تیکت {trackingCode}', 'برای تیکت {trackingCode} پاسخ جدید ثبت شد. لطفاً وارد پنل خود شوید.'),
('ticket.assigned','ارجاع تیکت','sms','', 'تیکت {trackingCode} به شما ارجاع شد.'),
('ticket.assigned.email','ارجاع تیکت ایمیلی','email','ارجاع تیکت {trackingCode}', 'تیکت {trackingCode} برای بررسی به شما ارجاع شد.'),
('ticket.closed','بستن تیکت','sms','', 'تیکت {trackingCode} بسته شد.'),
('ticket.closed.email','بستن تیکت ایمیلی','email','بسته شدن تیکت {trackingCode}', 'تیکت {trackingCode} بسته شد.'),
('contract.created','قرارداد جدید','sms','', 'قرارداد جدید شما با شماره {contractNo} ایجاد شد.'),
('contract.created.email','قرارداد جدید ایمیلی','email','قرارداد جدید {contractNo}', 'قرارداد جدید شما با شماره {contractNo} ایجاد شد.'),
('subscription.expiring','موعد تمدید پلن','sms','', 'اعتبار پلن شما در {daysLeft} روز آینده به پایان می‌رسد.'),
('subscription.expiring.email','موعد تمدید پلن ایمیلی','email','موعد تمدید پلن', 'اعتبار پلن شما در {daysLeft} روز آینده به پایان می‌رسد.'),
('subscription.expired','پایان پلن','sms','', 'اعتبار پلن شما به پایان رسید.'),
('subscription.expired.email','پایان پلن ایمیلی','email','پایان اعتبار پلن', 'اعتبار پلن شما به پایان رسید.'),
('assignment.created','کار ارجاع شده','sms','', 'یک کار جدید به شما ارجاع شد.'),
('assignment.created.email','کار ارجاع شده ایمیلی','email','کار جدید برای شما ارجاع شد', 'یک کار جدید به شما ارجاع شد. لطفاً پنل خود را بررسی کنید.')
ON CONFLICT(key) DO NOTHING;
