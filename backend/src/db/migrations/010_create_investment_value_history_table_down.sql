-- Migration Rollback: Drop investment_value_history table
-- Task: 1.4 investment_value_history tablosu için migration oluştur

-- Drop indexes first
DROP INDEX IF EXISTS idx_investment_value_history_investment_timestamp;

-- Drop the table
DROP TABLE IF EXISTS investment_value_history;
