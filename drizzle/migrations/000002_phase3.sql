ALTER TABLE users
  ADD COLUMN IF NOT EXISTS report_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS verified_report_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reputation_meta jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE items
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'uncategorized',
  ADD COLUMN IF NOT EXISTS default_unit text NOT NULL DEFAULT 'unit';

ALTER TABLE price_reports
  ADD COLUMN IF NOT EXISTS region_id integer;

UPDATE price_reports pr
SET region_id = m.region_id
FROM markets m
WHERE pr.market_id = m.id
  AND pr.region_id IS NULL;

ALTER TABLE price_reports
  ALTER COLUMN region_id SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'price_reports_region_id_regions_id_fk'
  ) THEN
    ALTER TABLE price_reports
      ADD CONSTRAINT price_reports_region_id_regions_id_fk
      FOREIGN KEY (region_id)
      REFERENCES regions(id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS markets_region_id_idx ON markets(region_id);
CREATE INDEX IF NOT EXISTS markets_is_active_idx ON markets(is_active);
CREATE INDEX IF NOT EXISTS items_is_active_idx ON items(is_active);
CREATE INDEX IF NOT EXISTS items_category_idx ON items(category);
CREATE INDEX IF NOT EXISTS items_name_idx ON items(name);
CREATE INDEX IF NOT EXISTS item_variants_item_id_idx ON item_variants(item_id);
CREATE INDEX IF NOT EXISTS users_role_idx ON users(role);
CREATE INDEX IF NOT EXISTS price_reports_item_region_reported_idx ON price_reports(item_id, region_id, reported_at);
CREATE INDEX IF NOT EXISTS price_reports_market_item_reported_idx ON price_reports(market_id, item_id, reported_at);
CREATE INDEX IF NOT EXISTS price_reports_user_created_idx ON price_reports(user_id, created_at);
CREATE INDEX IF NOT EXISTS price_reports_status_idx ON price_reports(status);
CREATE INDEX IF NOT EXISTS admin_audit_logs_admin_created_idx ON admin_audit_logs(admin_id, created_at);
