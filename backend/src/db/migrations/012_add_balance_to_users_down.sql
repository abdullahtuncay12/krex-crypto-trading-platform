-- Migration Down: Remove balance column from users table

-- Drop index
DROP INDEX IF EXISTS idx_users_balance;

-- Remove balance column
ALTER TABLE users DROP COLUMN IF EXISTS balance;
