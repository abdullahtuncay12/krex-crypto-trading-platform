-- Migration Down: Drop completed_trades table
-- Task: 2.4 Create CompletedTrade model

-- Drop indexes first
DROP INDEX IF EXISTS idx_completed_trades_crypto_exit;
DROP INDEX IF EXISTS idx_completed_trades_signal_id;
DROP INDEX IF EXISTS idx_completed_trades_profit_percent;
DROP INDEX IF EXISTS idx_completed_trades_exit_date;
DROP INDEX IF EXISTS idx_completed_trades_cryptocurrency;

-- Drop the completed_trades table
DROP TABLE IF EXISTS completed_trades;
