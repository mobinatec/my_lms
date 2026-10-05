CREATE TABLE IF NOT EXISTS contract_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(220) NOT NULL,
  category VARCHAR(80) NOT NULL DEFAULT 'عمومی',
  body TEXT NOT NULL DEFAULT '',
  variables JSONB NOT NULL DEFAULT '[]'::jsonb,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_no BIGSERIAL UNIQUE,
  contact_id UUID REFERENCES crm_contacts(id) ON DELETE SET NULL,
  template_id UUID REFERENCES contract_templates(id) ON DELETE SET NULL,
  title VARCHAR(240) NOT NULL,
  category VARCHAR(80) NOT NULL DEFAULT 'عمومی',
  body TEXT NOT NULL DEFAULT '',
  amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  currency VARCHAR(20) NOT NULL DEFAULT 'تومان',
  status VARCHAR(40) NOT NULL DEFAULT 'draft',
  signer_name VARCHAR(180) DEFAULT '',
  signer_email VARCHAR(220) DEFAULT '',
  signer_phone VARCHAR(80) DEFAULT '',
  signing_token_hash VARCHAR(128),
  token_expires_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  signed_at TIMESTAMPTZ,
  countersigned_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  signature_hash VARCHAR(128),
  signer_ip INET,
  signer_user_agent TEXT DEFAULT '',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_contracts_contact ON contracts(contact_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_token ON contracts(signing_token_hash);

CREATE TABLE IF NOT EXISTS contract_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_contract_events_contract ON contract_events(contract_id,created_at DESC);

INSERT INTO permissions(key,title,category,description) VALUES
('contracts.view','مشاهده قراردادها','قراردادها','مشاهده قراردادها و وضعیت امضا'),
('contracts.create','ایجاد قرارداد','قراردادها','ایجاد قرارداد و ارسال برای امضا'),
('contracts.edit','ویرایش قرارداد','قراردادها','ویرایش قراردادهای پیش‌نویس'),
('contracts.send','ارسال قرارداد','قراردادها','ایجاد لینک و ارسال قرارداد برای امضا'),
('contracts.sign','امضای قرارداد','قراردادها','ثبت امضای الکترونیکی و تایید قرارداد'),
('contracts.cancel','لغو قرارداد','قراردادها','لغو یا رد قرارداد'),
('contracts.templates','مدیریت قالب قرارداد','قراردادها','ایجاد و ویرایش قالب‌های قرارداد'),
('contracts.reports','گزارش قراردادها','قراردادها','مشاهده گزارش و آمار قراردادها')
ON CONFLICT(key) DO UPDATE SET title=EXCLUDED.title,category=EXCLUDED.category,description=EXCLUDED.description,updated_at=NOW();
