-- Migration Rollback: Drop bot_positions table
-- Task: 1.3 bot_positions tablosu için migration oluştur

-- Drop indexes first
DROP INDEX IF EXISTS idx_bot_positions_investment_status;
DROP INDEX IF EXISTS idx_bot_positions_status;
DROP INDEX IF EXISTS idx_bot_positions_investment_id;

-- Drop the table
DROP TABLE IF EXISTS bot_positions;
