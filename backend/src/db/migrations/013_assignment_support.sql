ALTER TABLE contracts ADD COLUMN IF NOT EXISTS assignee_id UUID REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_contracts_assignee ON contracts(assignee_id);

INSERT INTO permissions(key,title,category,description) VALUES
('contracts.assign','ارجاع قرارداد','قراردادها','ارجاع قرارداد به کارشناس یا کاربر مشخص')
ON CONFLICT(key) DO UPDATE SET title=EXCLUDED.title,category=EXCLUDED.category,description=EXCLUDED.description,updated_at=NOW();
