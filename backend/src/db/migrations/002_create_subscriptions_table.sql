-- Migration: Create subscriptions table
-- Task: 2.2 Create Subscription model
-- Requirements: 8.2, 8.4, 8.5

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'cancelled', 'expired')),
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  stripe_subscription_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on user_id for fast user subscription lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);

-- Create index on status for filtering active/cancelled/expired subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Create index on current_period_end for finding expired subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_current_period_end ON subscriptions(current_period_end);

-- Create unique index on stripe_subscription_id for Stripe webhook lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);

-- Create trigger to automatically update updated_at on row updates
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments to table and columns
COMMENT ON TABLE subscriptions IS 'Stores user subscription data for premium membership management';
COMMENT ON COLUMN subscriptions.id IS 'Unique identifier for the subscription';
COMMENT ON COLUMN subscriptions.user_id IS 'Foreign key reference to users table';
COMMENT ON COLUMN subscriptions.plan_id IS 'Identifier for the subscription plan (e.g., premium_monthly)';
COMMENT ON COLUMN subscriptions.status IS 'Current subscription status: active, cancelled, or expired';
COMMENT ON COLUMN subscriptions.current_period_start IS 'Start date of the current billing period';
COMMENT ON COLUMN subscriptions.current_period_end IS 'End date of the current billing period';
COMMENT ON COLUMN subscriptions.cancel_at_period_end IS 'Flag indicating if subscription should be cancelled at period end (Requirement 8.4)';
COMMENT ON COLUMN subscriptions.stripe_subscription_id IS 'Stripe subscription ID for payment processing integration';
COMMENT ON COLUMN subscriptions.created_at IS 'Timestamp when subscription was created';
COMMENT ON COLUMN subscriptions.updated_at IS 'Timestamp when subscription was last updated';
