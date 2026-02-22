-- Migration: Create bot_positions table
-- Task: 1.3 bot_positions tablosu için migration oluştur
-- Requirements: 4.4, 5.6

-- Create bot_positions table
CREATE TABLE IF NOT EXISTS bot_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investment_id UUID NOT NULL,
  cryptocurrency VARCHAR(20) NOT NULL,
  quantity NUMERIC(20, 8) NOT NULL CHECK (quantity > 0),
  entry_price NUMERIC(20, 8) NOT NULL CHECK (entry_price > 0),
  current_price NUMERIC(20, 8) NOT NULL CHECK (current_price > 0),
  stop_loss NUMERIC(20, 8) NOT NULL CHECK (stop_loss > 0),
  status VARCHAR(10) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  opened_at TIMESTAMP WITH TIME ZONE NOT NULL,
  closed_at TIMESTAMP WITH TIME ZONE,
  profit_loss NUMERIC(20, 2),
  CONSTRAINT fk_investment FOREIGN KEY (investment_id) REFERENCES bot_investments(id) ON DELETE CASCADE
);

-- Create index on investment_id for position queries
-- Requirement 4.4: Track positions for each investment
CREATE INDEX IF NOT EXISTS idx_bot_positions_investment_id ON bot_positions(investment_id);

-- Create index on status for open position queries
-- Requirement 6.3: Close all open positions
CREATE INDEX IF NOT EXISTS idx_bot_positions_status ON bot_positions(status);

-- Create composite index for common query pattern: investment_id + status
CREATE INDEX IF NOT EXISTS idx_bot_positions_investment_status ON bot_positions(investment_id, status);

-- Add comments to table and columns
COMMENT ON TABLE bot_positions IS 'Tracks open and closed trading positions for bot investments';
COMMENT ON COLUMN bot_positions.id IS 'Unique identifier for the position';
COMMENT ON COLUMN bot_positions.investment_id IS 'Reference to the bot investment this position belongs to';
COMMENT ON COLUMN bot_positions.cryptocurrency IS 'Cryptocurrency symbol (e.g., BTC, ETH, BNB, SOL, ADA)';
COMMENT ON COLUMN bot_positions.quantity IS 'Quantity of cryptocurrency in this position';
COMMENT ON COLUMN bot_positions.entry_price IS 'Price at which position was opened';
COMMENT ON COLUMN bot_positions.current_price IS 'Current market price (updated periodically)';
COMMENT ON COLUMN bot_positions.stop_loss IS 'Stop-loss price (5% below entry price)';
COMMENT ON COLUMN bot_positions.status IS 'Position status: open or closed';
COMMENT ON COLUMN bot_positions.opened_at IS 'Timestamp when position was opened';
COMMENT ON COLUMN bot_positions.closed_at IS 'Timestamp when position was closed';
COMMENT ON COLUMN bot_positions.profit_loss IS 'Profit or loss when position was closed';
