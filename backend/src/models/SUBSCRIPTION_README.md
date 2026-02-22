# Subscription Model

## Overview

The Subscription model manages user premium membership subscriptions, including billing periods, status tracking, and Stripe payment integration.

## Schema

```typescript
interface Subscription {
  id: string;                           // UUID primary key
  userId: string;                       // Foreign key to users table
  planId: string;                       // Subscription plan identifier (e.g., 'premium_monthly')
  status: 'active' | 'cancelled' | 'expired';  // Current subscription status
  currentPeriodStart: Date;             // Start of current billing period
  currentPeriodEnd: Date;               // End of current billing period
  cancelAtPeriodEnd: boolean;           // Flag for deferred cancellation (Req 8.4)
  stripeSubscriptionId: string;         // Stripe subscription ID for webhooks
  createdAt: Date;                      // Creation timestamp
  updatedAt: Date;                      // Last update timestamp
}
```

## Database Indexes

The following indexes are created for optimal query performance:

- `idx_subscriptions_user_id` - Fast user subscription lookups
- `idx_subscriptions_status` - Filter by subscription status
- `idx_subscriptions_current_period_end` - Find expired subscriptions
- `idx_subscriptions_stripe_subscription_id` (unique) - Stripe webhook lookups

## Repository Methods

### Create Operations

- `create(input: CreateSubscriptionInput): Promise<Subscription>`
  - Creates a new subscription
  - Default `cancelAtPeriodEnd` is `false`
  - **Requirement 8.2**: Premium activation on payment success

### Read Operations

- `findById(id: string): Promise<Subscription | null>`
  - Find subscription by ID

- `findByUserId(userId: string): Promise<Subscription | null>`
  - Find most recent subscription for a user
  - Returns the latest subscription ordered by `created_at DESC`

- `findByStripeSubscriptionId(stripeSubscriptionId: string): Promise<Subscription | null>`
  - Find subscription by Stripe subscription ID
  - Used for processing Stripe webhooks

- `findExpiredSubscriptions(): Promise<Subscription[]>`
  - Find all active subscriptions past their end date
  - Used by scheduled job to revert user roles

- `findByStatus(status: 'active' | 'cancelled' | 'expired'): Promise<Subscription[]>`
  - Find all subscriptions with given status

### Update Operations

- `update(id: string, input: UpdateSubscriptionInput): Promise<Subscription | null>`
  - Update subscription fields
  - **Requirement 8.4**: Access retention on subscription cancellation

- `cancelAtPeriodEnd(id: string): Promise<Subscription | null>`
  - Set `cancelAtPeriodEnd` flag to `true`
  - Maintains active status until period end
  - **Requirement 8.4**: Maintain access until period end

### Delete Operations

- `delete(id: string): Promise<boolean>`
  - Delete subscription by ID
  - Returns `true` if deleted, `false` if not found

## Usage Examples

### Creating a Subscription

```typescript
import { subscriptionRepository } from './models';

const subscription = await subscriptionRepository.create({
  userId: 'user-uuid',
  planId: 'premium_monthly',
  status: 'active',
  currentPeriodStart: new Date(),
  currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  stripeSubscriptionId: 'sub_123456'
});
```

### Cancelling a Subscription (Deferred)

```typescript
// User cancels but retains access until period end (Requirement 8.4)
const subscription = await subscriptionRepository.cancelAtPeriodEnd(subscriptionId);
// subscription.status is still 'active'
// subscription.cancelAtPeriodEnd is now true
```

### Finding Expired Subscriptions

```typescript
// Run by scheduled job to revert user roles
const expiredSubscriptions = await subscriptionRepository.findExpiredSubscriptions();

for (const subscription of expiredSubscriptions) {
  // Update subscription status to 'expired'
  await subscriptionRepository.update(subscription.id, { status: 'expired' });
  
  // Revert user role to 'normal' (Requirement 1.3)
  await userRepository.updateRole(subscription.userId, 'normal');
}
```

### Processing Stripe Webhooks

```typescript
// Handle Stripe webhook for subscription update
const subscription = await subscriptionRepository.findByStripeSubscriptionId(
  stripeEvent.data.object.id
);

if (subscription) {
  // Update subscription based on Stripe event
  await subscriptionRepository.update(subscription.id, {
    status: 'active',
    currentPeriodEnd: new Date(stripeEvent.data.object.current_period_end * 1000)
  });
}
```

## Requirements Mapping

- **Requirement 8.2**: Premium activation on payment success
  - Implemented via `create()` method
  - Creates active subscription immediately upon successful payment

- **Requirement 8.4**: Access retention on subscription cancellation
  - Implemented via `cancelAtPeriodEnd()` method
  - Sets flag but maintains active status until period end
  - Scheduled job checks `findExpiredSubscriptions()` to update status

- **Requirement 8.5**: Notification on payment failure
  - Subscription repository provides data access
  - Notification logic handled by SubscriptionManager service

## Migration Files

- **Up**: `002_create_subscriptions_table.sql`
- **Down**: `002_create_subscriptions_table_down.sql`

## Related Models

- **User**: Foreign key relationship via `userId`
- User role is updated to 'premium' when subscription is active
- User role is reverted to 'normal' when subscription expires

## Testing

Unit tests are located in `__tests__/SubscriptionRepository.test.ts` and cover:

- Creating subscriptions with default and custom values
- Finding subscriptions by various criteria
- Updating subscription fields
- Cancelling subscriptions with deferred access
- Finding expired subscriptions for scheduled jobs
- Deleting subscriptions
