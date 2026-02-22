-- Rollback Migration: Drop trading_signals table
-- Task: 2.3 Create TradingSignal model

-- Drop indexes first
DROP INDEX IF EXISTS idx_trading_signals_crypto_created;
DROP INDEX IF EXISTS idx_trading_signals_signal_type;
DROP INDEX IF EXISTS idx_trading_signals_created_at;
DROP INDEX IF EXISTS idx_trading_signals_cryptocurrency;

-- Drop the trading_signals table
DROP TABLE IF EXISTS trading_signals;
