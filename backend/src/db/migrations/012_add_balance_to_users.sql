-- Migration: Add balance column to users table
-- Task: 3.1 BalanceManager sınıfını oluştur
-- Requirements: 1.2, 11.6

-- Add balance column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS balance NUMERIC(20, 2) NOT NULL DEFAULT 0 CHECK (balance >= 0);

-- Create index on balance for balance queries
CREATE INDEX IF NOT EXISTS idx_users_balance ON users(balance);

-- Add comment to column
COMMENT ON COLUMN users.balance IS 'User USDT balance for bot trading investments';
