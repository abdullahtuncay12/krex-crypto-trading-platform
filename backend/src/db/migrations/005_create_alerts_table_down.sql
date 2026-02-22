-- Rollback migration: Drop alerts table
-- Task: 2.5 Create Alert and AlertPreferences models

-- Drop indexes
DROP INDEX IF EXISTS idx_alerts_user_id_read;
DROP INDEX IF EXISTS idx_alerts_created_at;
DROP INDEX IF EXISTS idx_alerts_read;
DROP INDEX IF EXISTS idx_alerts_user_id;

-- Drop table
DROP TABLE IF EXISTS alerts;
