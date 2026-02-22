-- Migration: Create investment_value_history table
-- Task: 1.4 investment_value_history tablosu için migration oluştur
-- Requirements: 13.5

-- Create investment_value_history table
CREATE TABLE IF NOT EXISTS investment_value_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investment_id UUID NOT NULL,
  value NUMERIC(20, 2) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_investment FOREIGN KEY (investment_id) REFERENCES bot_investments(id) ON DELETE CASCADE
);

-- Create composite index on investment_id and timestamp for time-series queries
-- Requirement 13.5: Display real-time chart of investment value over time
CREATE INDEX IF NOT EXISTS idx_investment_value_history_investment_timestamp ON investment_value_history(investment_id, timestamp DESC);

-- Add comments to table and columns
COMMENT ON TABLE investment_value_history IS 'Stores historical value snapshots for investment charting';
COMMENT ON COLUMN investment_value_history.id IS 'Unique identifier for the value snapshot';
COMMENT ON COLUMN investment_value_history.investment_id IS 'Reference to the bot investment';
COMMENT ON COLUMN investment_value_history.value IS 'Investment value at this timestamp';
COMMENT ON COLUMN investment_value_history.timestamp IS 'Timestamp of the value snapshot';
