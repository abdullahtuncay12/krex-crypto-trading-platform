-- Migration Rollback: Drop bot_investments table
-- Task: 1.1 bot_investments tablosu için migration oluştur

-- Drop indexes first
DROP INDEX IF EXISTS idx_bot_investments_user_status;
DROP INDEX IF EXISTS idx_bot_investments_cryptocurrency;
DROP INDEX IF EXISTS idx_bot_investments_end_time;
DROP INDEX IF EXISTS idx_bot_investments_status;
DROP INDEX IF EXISTS idx_bot_investments_user_id;

-- Drop the table
DROP TABLE IF EXISTS bot_investments;
