-- Rollback migration: Drop alert_preferences table
-- Task: 2.5 Create Alert and AlertPreferences models

-- Drop trigger
DROP TRIGGER IF EXISTS update_alert_preferences_updated_at ON alert_preferences;

-- Drop index
DROP INDEX IF EXISTS idx_alert_preferences_user_id;

-- Drop table
DROP TABLE IF EXISTS alert_preferences;
