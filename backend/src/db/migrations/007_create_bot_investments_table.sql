-- Migration: Create bot_investments table
-- Task: 1.1 bot_investments tablosu için migration oluştur
-- Requirements: 10.1, 10.2

-- Create bot_investments table
CREATE TABLE IF NOT EXISTS bot_investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  cryptocurrency VARCHAR(20) NOT NULL,
  principal_amount NUMERIC(20, 2) NOT NULL CHECK (principal_amount >= 100 AND principal_amount <= 100000),
  trading_period_hours INTEGER NOT NULL CHECK (trading_period_hours IN (1, 2, 3, 4, 5, 6, 12, 24, 48, 60)),
  start_time TIMESTAMP(3) WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP(3) WITH TIME ZONE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  current_value NUMERIC(20, 2) DEFAULT 0,
  final_value NUMERIC(20, 2),
  profit NUMERIC(20, 2),
  commission NUMERIC(20, 2),
  risk_acknowledged_at TIMESTAMP WITH TIME ZONE NOT NULL,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index on user_id for fast lookups by user
-- Requirement 10.6: Query performance for user investments
CREATE INDEX IF NOT EXISTS idx_bot_investments_user_id ON bot_investments(user_id);

-- Create index on status for active investment queries
-- Requirement 10.7: Active investment queries
CREATE INDEX IF NOT EXISTS idx_bot_investments_status ON bot_investments(status);

-- Create index on end_time for period monitoring
-- Requirement 6.1: Monitor investment periods
CREATE INDEX IF NOT EXISTS idx_bot_investments_end_time ON bot_investments(end_time);

-- Create index on cryptocurrency for analytics
-- Requirement 17.4: Track performance by cryptocurrency
CREATE INDEX IF NOT EXISTS idx_bot_investments_cryptocurrency ON bot_investments(cryptocurrency);

-- Create composite index for common query pattern: user_id + status
CREATE INDEX IF NOT EXISTS idx_bot_investments_user_status ON bot_investments(user_id, status);

-- Add comments to table and columns
COMMENT ON TABLE bot_investments IS 'Stores bot trading investments with lifecycle tracking';
COMMENT ON COLUMN bot_investments.id IS 'Unique identifier for the investment';
COMMENT ON COLUMN bot_investments.user_id IS 'Reference to the user who created the investment';
COMMENT ON COLUMN bot_investments.cryptocurrency IS 'Cryptocurrency symbol (e.g., BTC, ETH, BNB, SOL, ADA)';
COMMENT ON COLUMN bot_investments.principal_amount IS 'Initial investment amount in USDT (100-100,000)';
COMMENT ON COLUMN bot_investments.trading_period_hours IS 'Trading period in hours (1,2,3,4,5,6,12,24,48,60)';
COMMENT ON COLUMN bot_investments.start_time IS 'Investment start timestamp with millisecond precision';
COMMENT ON COLUMN bot_investments.end_time IS 'Investment end timestamp (start_time + trading_period_hours)';
COMMENT ON COLUMN bot_investments.status IS 'Investment status: active, completed, or cancelled';
COMMENT ON COLUMN bot_investments.current_value IS 'Current investment value (updated every 30 seconds)';
COMMENT ON COLUMN bot_investments.final_value IS 'Final investment value after completion';
COMMENT ON COLUMN bot_investments.profit IS 'Profit or loss (final_value - principal_amount)';
COMMENT ON COLUMN bot_investments.commission IS 'Platform commission (1% of positive profit)';
COMMENT ON COLUMN bot_investments.risk_acknowledged_at IS 'Timestamp when user acknowledged risk disclosure';
COMMENT ON COLUMN bot_investments.cancellation_reason IS 'Reason for cancellation (if cancelled)';
COMMENT ON COLUMN bot_investments.cancelled_at IS 'Timestamp when investment was cancelled';
COMMENT ON COLUMN bot_investments.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN bot_investments.updated_at IS 'Record last update timestamp';
