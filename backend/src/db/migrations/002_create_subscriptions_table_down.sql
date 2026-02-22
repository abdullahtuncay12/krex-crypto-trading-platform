-- Migration Down: Drop subscriptions table
-- Task: 2.2 Create Subscription model
-- Requirements: 8.2, 8.4, 8.5

-- Drop trigger
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;

-- Drop indexes
DROP INDEX IF EXISTS idx_subscriptions_stripe_subscription_id;
DROP INDEX IF EXISTS idx_subscriptions_current_period_end;
DROP INDEX IF EXISTS idx_subscriptions_status;
DROP INDEX IF EXISTS idx_subscriptions_user_id;

-- Drop table
DROP TABLE IF EXISTS subscriptions;
