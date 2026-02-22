-- Migration: Create completed_trades table
-- Task: 2.4 Create CompletedTrade model
-- Requirements: 6.1, 6.2, 6.3, 6.4

-- Create completed_trades table
CREATE TABLE IF NOT EXISTS completed_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id UUID NOT NULL,
  cryptocurrency VARCHAR(20) NOT NULL,
  entry_price NUMERIC(20, 8) NOT NULL,
  exit_price NUMERIC(20, 8) NOT NULL,
  profit_percent NUMERIC(10, 2) NOT NULL,
  entry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  exit_date TIMESTAMP WITH TIME ZONE NOT NULL,
  signal_type VARCHAR(10) NOT NULL DEFAULT 'premium' CHECK (signal_type = 'premium'),
  CONSTRAINT fk_signal FOREIGN KEY (signal_id) REFERENCES trading_signals(id) ON DELETE CASCADE
);

-- Create index on cryptocurrency for fast lookups by crypto symbol
-- Requirement 6.1: Display successful premium trades
CREATE INDEX IF NOT EXISTS idx_completed_trades_cryptocurrency ON completed_trades(cryptocurrency);

-- Create index on exit_date for time-based queries and sorting
-- Requirement 6.1: Display trades at bottom of page (sorted by date)
CREATE INDEX IF NOT EXISTS idx_completed_trades_exit_date ON completed_trades(exit_date DESC);

-- Create index on profit_percent for filtering profitable trades
-- Requirement 6.2: Show profitable trades in green color
CREATE INDEX IF NOT EXISTS idx_completed_trades_profit_percent ON completed_trades(profit_percent);

-- Create index on signal_id for referencing trading signals
-- Requirement 6.4: Reference valid trading signal ID
CREATE INDEX IF NOT EXISTS idx_completed_trades_signal_id ON completed_trades(signal_id);

-- Create composite index for common query pattern: cryptocurrency + exit_date
CREATE INDEX IF NOT EXISTS idx_completed_trades_crypto_exit ON completed_trades(cryptocurrency, exit_date DESC);

-- Add comments to table and columns
COMMENT ON TABLE completed_trades IS 'Stores completed premium trading signals with entry/exit prices and profit calculations';
COMMENT ON COLUMN completed_trades.id IS 'Unique identifier for the completed trade';
COMMENT ON COLUMN completed_trades.signal_id IS 'Reference to the trading signal that generated this trade';
COMMENT ON COLUMN completed_trades.cryptocurrency IS 'Cryptocurrency symbol (e.g., BTC, ETH)';
COMMENT ON COLUMN completed_trades.entry_price IS 'Price at which the trade was entered';
COMMENT ON COLUMN completed_trades.exit_price IS 'Price at which the trade was exited';
COMMENT ON COLUMN completed_trades.profit_percent IS 'Profit percentage of the trade (can be negative for losses)';
COMMENT ON COLUMN completed_trades.entry_date IS 'Timestamp when the trade was entered';
COMMENT ON COLUMN completed_trades.exit_date IS 'Timestamp when the trade was exited';
COMMENT ON COLUMN completed_trades.signal_type IS 'Type of signal: always premium (only premium signals are tracked)';
