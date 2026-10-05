CREATE TABLE IF NOT EXISTS ticket_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  description VARCHAR(300) NOT NULL DEFAULT '',
  color VARCHAR(30) NOT NULL DEFAULT '#2587ff',
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_ticket_categories_name ON ticket_categories(LOWER(name));
INSERT INTO ticket_categories(name,description,color,sort_order) VALUES
('فنی','خطا، باگ، مشکل سامانه و زیرساخت','#2587ff',10),
('فروش','استعلام، پیش‌فاکتور و پیگیری فروش','#7b4dff',20),
('مالی','پرداخت، فاکتور، تسویه و امور مالی','#19d3c5',30),
('حساب کاربری','ورود، ثبت‌نام، دسترسی و پروفایل','#ffad42',40),
('آموزش','دوره‌ها، درس‌ها و پشتیبانی آموزشی','#38bdf8',50),
('قرارداد','قرارداد، امضا و امور حقوقی','#a78bfa',60),
('CRM','مشتریان، لیدها و پیگیری‌های CRM','#22c55e',70),
('سایر','سایر درخواست‌ها','#94a3b8',80)
ON CONFLICT DO NOTHING;

ALTER TABLE tickets ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES ticket_categories(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_tickets_category_id ON tickets(category_id);
UPDATE tickets t SET category_id=tc.id FROM ticket_categories tc WHERE t.category_id IS NULL AND LOWER(t.category)=LOWER(tc.name);
