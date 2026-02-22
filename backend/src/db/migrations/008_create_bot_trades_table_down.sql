-- Migration Rollback: Drop bot_trades table
-- Task: 1.2 bot_trades tablosu için migration oluştur

-- Drop indexes first
DROP INDEX IF EXISTS idx_bot_trades_investment_executed;
DROP INDEX IF EXISTS idx_bot_trades_exchange;
DROP INDEX IF EXISTS idx_bot_trades_executed_at;
DROP INDEX IF EXISTS idx_bot_trades_investment_id;

-- Drop the table
DROP TABLE IF EXISTS bot_trades;
