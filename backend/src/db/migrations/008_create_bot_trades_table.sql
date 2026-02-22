-- Migration: Create bot_trades table
-- Task: 1.2 bot_trades tablosu için migration oluştur
-- Requirements: 10.3, 10.4, 10.5

-- Create bot_trades table
CREATE TABLE IF NOT EXISTS bot_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investment_id UUID NOT NULL,
  trade_type VARCHAR(10) NOT NULL CHECK (trade_type IN ('buy', 'sell')),
  cryptocurrency VARCHAR(20) NOT NULL,
  quantity NUMERIC(20, 8) NOT NULL CHECK (quantity > 0),
  price NUMERIC(20, 8) NOT NULL CHECK (price > 0),
  total_value NUMERIC(20, 2) NOT NULL,
  exchange VARCHAR(20) NOT NULL CHECK (exchange IN ('Binance', 'Coinbase', 'Bybit')),
  executed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  strategy_confidence NUMERIC(3, 2) NOT NULL CHECK (strategy_confidence >= 0 AND strategy_confidence <= 1),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_investment FOREIGN KEY (investment_id) REFERENCES bot_investments(id) ON DELETE CASCADE
);

-- Create index on investment_id for trade history queries
-- Requirement 10.8: Trade history queries
CREATE INDEX IF NOT EXISTS idx_bot_trades_investment_id ON bot_trades(investment_id);

-- Create index on executed_at for time-based queries and sorting
-- Requirement 4.5: Record trade with timestamp
CREATE INDEX IF NOT EXISTS idx_bot_trades_executed_at ON bot_trades(executed_at DESC);

-- Create index on exchange for exchange analytics
-- Requirement 12.7: Log all API requests and responses
CREATE INDEX IF NOT EXISTS idx_bot_trades_exchange ON bot_trades(exchange);

-- Create composite index for common query pattern: investment_id + executed_at
CREATE INDEX IF NOT EXISTS idx_bot_trades_investment_executed ON bot_trades(investment_id, executed_at DESC);

-- Add comments to table and columns
COMMENT ON TABLE bot_trades IS 'Stores all bot trading executions with full trade details';
COMMENT ON COLUMN bot_trades.id IS 'Unique identifier for the trade';
COMMENT ON COLUMN bot_trades.investment_id IS 'Reference to the bot investment this trade belongs to';
COMMENT ON COLUMN bot_trades.trade_type IS 'Type of trade: buy or sell';
COMMENT ON COLUMN bot_trades.cryptocurrency IS 'Cryptocurrency symbol (e.g., BTC, ETH, BNB, SOL, ADA)';
COMMENT ON COLUMN bot_trades.quantity IS 'Quantity of cryptocurrency traded';
COMMENT ON COLUMN bot_trades.price IS 'Price per unit at execution';
COMMENT ON COLUMN bot_trades.total_value IS 'Total value of the trade in USDT (quantity * price)';
COMMENT ON COLUMN bot_trades.exchange IS 'Exchange where trade was executed (Binance, Coinbase, Bybit)';
COMMENT ON COLUMN bot_trades.executed_at IS 'Timestamp when trade was executed';
COMMENT ON COLUMN bot_trades.strategy_confidence IS 'AI strategy confidence score (0-1) at time of trade';
COMMENT ON COLUMN bot_trades.created_at IS 'Record creation timestamp';
