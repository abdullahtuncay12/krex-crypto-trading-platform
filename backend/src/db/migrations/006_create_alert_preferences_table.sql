-- Migration: Create alert_preferences table
-- Task: 2.5 Create Alert and AlertPreferences models
-- Requirements: 10.3

-- Create alert_preferences table
CREATE TABLE IF NOT EXISTS alert_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  price_movement_threshold DECIMAL(5, 2) NOT NULL DEFAULT 5.0,
  enable_pump_alerts BOOLEAN NOT NULL DEFAULT true,
  cryptocurrencies TEXT[] NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create unique index on user_id (one preference record per user)
CREATE UNIQUE INDEX IF NOT EXISTS idx_alert_preferences_user_id ON alert_preferences(user_id);

-- Create trigger to automatically update updated_at on row updates
CREATE TRIGGER update_alert_preferences_updated_at
  BEFORE UPDATE ON alert_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments to table and columns
COMMENT ON TABLE alert_preferences IS 'Stores alert configuration preferences for premium users (Requirement 10.3)';
COMMENT ON COLUMN alert_preferences.id IS 'Unique identifier for the alert preferences';
COMMENT ON COLUMN alert_preferences.user_id IS 'Foreign key reference to users table (unique - one preference per user)';
COMMENT ON COLUMN alert_preferences.price_movement_threshold IS 'Percentage threshold for price movement alerts (e.g., 5.0 for 5%)';
COMMENT ON COLUMN alert_preferences.enable_pump_alerts IS 'Flag to enable/disable pump detection alerts';
COMMENT ON COLUMN alert_preferences.cryptocurrencies IS 'Array of cryptocurrency symbols to monitor (e.g., {BTC, ETH})';
COMMENT ON COLUMN alert_preferences.updated_at IS 'Timestamp when preferences were last updated';
