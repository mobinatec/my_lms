ALTER TABLE plans ADD COLUMN IF NOT EXISTS rank INTEGER NOT NULL DEFAULT 0;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS duration_days INTEGER NOT NULL DEFAULT 30;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS checkout_key VARCHAR(160);

UPDATE plans SET rank = CASE
  WHEN key='free' THEN 0
  WHEN key='normal' THEN 1
  WHEN key='vip' THEN 2
  ELSE 0
END WHERE rank=0;

UPDATE plans SET duration_days = 30 WHERE duration_days IS NULL OR duration_days < 1;
CREATE UNIQUE INDEX IF NOT EXISTS uq_orders_user_checkout_key
  ON orders(user_id, checkout_key) WHERE checkout_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_plan_status
  ON subscriptions(user_id, plan_id, status, ends_at);
