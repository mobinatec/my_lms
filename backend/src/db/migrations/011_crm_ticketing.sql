CREATE TABLE IF NOT EXISTS crm_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(180) NOT NULL,
  company VARCHAR(180) DEFAULT '',
  email VARCHAR(220) DEFAULT '',
  phone VARCHAR(80) DEFAULT '',
  type VARCHAR(40) NOT NULL DEFAULT 'lead',
  status VARCHAR(40) NOT NULL DEFAULT 'new',
  source VARCHAR(80) DEFAULT '',
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_status ON crm_contacts(status);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_owner ON crm_contacts(owner_id);

CREATE TABLE IF NOT EXISTS crm_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES crm_contacts(id) ON DELETE CASCADE,
  type VARCHAR(40) NOT NULL DEFAULT 'note',
  subject VARCHAR(220) DEFAULT '',
  body TEXT DEFAULT '',
  due_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_crm_activities_contact ON crm_activities(contact_id,created_at DESC);

CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_no BIGSERIAL UNIQUE,
  contact_id UUID REFERENCES crm_contacts(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  subject VARCHAR(240) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category VARCHAR(80) NOT NULL DEFAULT 'general',
  priority VARCHAR(30) NOT NULL DEFAULT 'normal',
  status VARCHAR(40) NOT NULL DEFAULT 'open',
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  team VARCHAR(100) DEFAULT '',
  first_response_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  sla_due_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_assignee ON tickets(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tickets_contact ON tickets(contact_id);

CREATE TABLE IF NOT EXISTS ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  body TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON ticket_messages(ticket_id,created_at);

INSERT INTO permissions(key,title,category,description) VALUES
('crm.view','مشاهده CRM','CRM','مشاهده مشتریان و Timeline'),
('crm.create','ایجاد مشتری','CRM','ایجاد مخاطب و مشتری'),
('crm.edit','ویرایش مشتری','CRM','ویرایش اطلاعات CRM'),
('crm.delete','حذف مشتری','CRM','حذف مخاطب CRM'),
('crm.activities','مدیریت فعالیت‌های CRM','CRM','یادداشت، تماس، پیگیری و فعالیت'),
('crm.reports','گزارش‌های CRM','CRM','مشاهده گزارش‌ها و KPIهای CRM'),
('tickets.view','مشاهده تیکت‌ها','تیکت','مشاهده فهرست و جزئیات تیکت'),
('tickets.create','ایجاد تیکت','تیکت','ایجاد تیکت'),
('tickets.reply','پاسخ به تیکت','تیکت','ارسال پاسخ عمومی'),
('tickets.internal_reply','پاسخ داخلی تیکت','تیکت','ارسال یادداشت داخلی تیم'),
('tickets.assign','تخصیص تیکت','تیکت','تخصیص تیکت به کارشناس یا تیم'),
('tickets.manage','مدیریت تیکت','تیکت','تغییر وضعیت، اولویت، دسته و SLA'),
('tickets.delete','حذف تیکت','تیکت','حذف تیکت'),
('tickets.reports','گزارش‌های تیکت','تیکت','مشاهده SLA و گزارش عملکرد')
ON CONFLICT(key) DO UPDATE SET title=EXCLUDED.title,category=EXCLUDED.category,description=EXCLUDED.description,updated_at=NOW();
