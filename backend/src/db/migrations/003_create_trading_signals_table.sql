-- Migration: Create trading_signals table
-- Task: 2.3 Create TradingSignal model
-- Requirements: 3.1, 4.1, 4.2, 4.3

-- Create trading_signals table
CREATE TABLE IF NOT EXISTS trading_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cryptocurrency VARCHAR(20) NOT NULL,
  recommendation VARCHAR(10) NOT NULL CHECK (recommendation IN ('buy', 'sell', 'hold')),
  confidence NUMERIC(5, 2) NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  entry_price NUMERIC(20, 8) NOT NULL,
  stop_loss NUMERIC(20, 8),
  limit_order NUMERIC(20, 8),
  signal_type VARCHAR(10) NOT NULL CHECK (signal_type IN ('basic', 'premium')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on cryptocurrency for fast lookups by crypto symbol
CREATE INDEX IF NOT EXISTS idx_trading_signals_cryptocurrency ON trading_signals(cryptocurrency);

-- Create index on created_at for time-based queries and sorting
CREATE INDEX IF NOT EXISTS idx_trading_signals_created_at ON trading_signals(created_at DESC);

-- Create index on signal_type for filtering basic vs premium signals
CREATE INDEX IF NOT EXISTS idx_trading_signals_signal_type ON trading_signals(signal_type);

-- Create composite index for common query pattern: cryptocurrency + created_at
CREATE INDEX IF NOT EXISTS idx_trading_signals_crypto_created ON trading_signals(cryptocurrency, created_at DESC);

-- Add comments to table and columns
COMMENT ON TABLE trading_signals IS 'Stores trading signals (buy/sell/hold recommendations) for cryptocurrencies';
COMMENT ON COLUMN trading_signals.id IS 'Unique identifier for the trading signal';
COMMENT ON COLUMN trading_signals.cryptocurrency IS 'Cryptocurrency symbol (e.g., BTC, ETH)';
COMMENT ON COLUMN trading_signals.recommendation IS 'Trading recommendation: buy, sell, or hold';
COMMENT ON COLUMN trading_signals.confidence IS 'Confidence level of the signal (0-100)';
COMMENT ON COLUMN trading_signals.entry_price IS 'Recommended entry price for the trade';
COMMENT ON COLUMN trading_signals.stop_loss IS 'Stop-loss price for risk management (premium signals only)';
COMMENT ON COLUMN trading_signals.limit_order IS 'Limit order price suggestion (premium signals only)';
COMMENT ON COLUMN trading_signals.signal_type IS 'Type of signal: basic (for normal users) or premium (for premium users)';
COMMENT ON COLUMN trading_signals.created_at IS 'Timestamp when the signal was generated';
