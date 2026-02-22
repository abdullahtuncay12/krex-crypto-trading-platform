-- Migration: Create alerts table
-- Task: 2.5 Create Alert and AlertPreferences models
-- Requirements: 10.1, 10.4

-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cryptocurrency VARCHAR(20) NOT NULL,
  alert_type VARCHAR(30) NOT NULL CHECK (alert_type IN ('price_movement', 'pump_detected', 'trading_opportunity')),
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on user_id for fast user alert lookups
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);

-- Create index on read status for filtering unread alerts
CREATE INDEX IF NOT EXISTS idx_alerts_read ON alerts(read);

-- Create index on created_at for chronological ordering
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC);

-- Create composite index on user_id and read for efficient unread alert queries
CREATE INDEX IF NOT EXISTS idx_alerts_user_id_read ON alerts(user_id, read);

-- Add comments to table and columns
COMMENT ON TABLE alerts IS 'Stores alert notifications for premium users about price movements and trading opportunities';
COMMENT ON COLUMN alerts.id IS 'Unique identifier for the alert';
COMMENT ON COLUMN alerts.user_id IS 'Foreign key reference to users table';
COMMENT ON COLUMN alerts.cryptocurrency IS 'Cryptocurrency symbol that triggered the alert (e.g., BTC, ETH)';
COMMENT ON COLUMN alerts.alert_type IS 'Type of alert: price_movement, pump_detected, or trading_opportunity';
COMMENT ON COLUMN alerts.message IS 'Alert message describing the reason for the alert (Requirement 10.4)';
COMMENT ON COLUMN alerts.read IS 'Flag indicating if the user has read the alert';
COMMENT ON COLUMN alerts.created_at IS 'Timestamp when alert was created';
