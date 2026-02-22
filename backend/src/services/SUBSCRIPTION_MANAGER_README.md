# SubscriptionManager Service

## Overview

The SubscriptionManager service handles the complete subscription lifecycle for premium memberships, including creation, cancellation, payment webhook processing, and automatic expiration handling. It integrates with Stripe for payment processing and manages user role updates through the RBAC system.

## Requirements

This service implements the following requirements:
- **8.1**: Display premium subscription options
- **8.2**: Premium activation on payment success
- **8.3**: Monthly recurring billing
- **8.4**: Access retention on subscription cancellation
- **8.5**: Notification on payment failure

## Dependencies

- **Stripe SDK**: For payment processing and subscription management
- **SubscriptionRepository**: Database operations for subscriptions
- **UserRepository**: User role management

## Environment Variables

```bash
STRIPE_SECRET_KEY=sk_test_... # Your Stripe secret key
```

## Installation

```bash
npm install stripe
npm install --save-dev @types/stripe
```

## Usage

### Creating a Subscription

```typescript
import { subscriptionManager } from './services/SubscriptionManager';

// Create a new premium subscription
const subscription = await subscriptionManager.createSubscription(
  'user-123',                    // userId
  'price_premium_monthly',       // Stripe price ID
  'pm_card_visa'                 // Stripe payment method ID
);

// User role is automatically upgraded to 'premium'
```

### Canceling a Subscription

```typescript
// Cancel subscription at period end (maintains access until expiration)
const subscription = await subscriptionManager.cancelSubscription('user-123');

// User retains premium access until currentPeriodEnd
// Role is reverted to 'normal' when subscription expires
```

### Webhook Handlers

#### Payment Success

```typescript
// Handle successful payment (e.g., monthly renewal)
await subscriptionManager.handlePaymentSuccess('sub_stripe_123');

// Updates subscription period dates
// Ensures user has premium role
```

#### Payment Failure

```typescript
// Handle failed payment
await subscriptionManager.handlePaymentFailure('sub_stripe_123');

// Marks subscription as expired
// Reverts user role to 'normal'
// Logs notification (TODO: integrate with email service)
```

### Scheduled Expiration Check

```typescript
// Run this via cron job (e.g., daily at midnight)
await subscriptionManager.checkExpiredSubscriptions();

// Finds all subscriptions past their currentPeriodEnd
// Updates status to 'expired'
// Reverts user roles to 'normal'
```

## Stripe Webhook Integration

To handle Stripe webhooks in your Express app:

```typescript
import express from 'express';
import { subscriptionManager } from './services/SubscriptionManager';

const app = express();

app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

    switch (event.type) {
      case 'invoice.payment_succeeded':
        const subscription = event.data.object.subscription;
        await subscriptionManager.handlePaymentSuccess(subscription);
        break;

      case 'invoice.payment_failed':
        const failedSubscription = event.data.object.subscription;
        await subscriptionManager.handlePaymentFailure(failedSubscription);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});
```

## Cron Job Setup

Set up a scheduled job to check for expired subscriptions:

```typescript
import cron from 'node-cron';
import { subscriptionManager } from './services/SubscriptionManager';

// Run daily at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('Checking for expired subscriptions...');
  await subscriptionManager.checkExpiredSubscriptions();
});
```

## Error Handling

The service throws errors for the following conditions:

- **User not found**: When creating subscription for non-existent user
- **User already has active subscription**: When attempting to create duplicate subscription
- **No subscription found**: When canceling or processing webhooks for non-existent subscription
- **Subscription not active**: When attempting to cancel an already cancelled/expired subscription

All errors should be caught and handled appropriately in your API endpoints:

```typescript
app.post('/api/subscriptions/upgrade', async (req, res) => {
  try {
    const subscription = await subscriptionManager.createSubscription(
      req.user.id,
      req.body.planId,
      req.body.paymentMethodId
    );
    res.json({ subscription });
  } catch (error) {
    if (error.message === 'User already has an active subscription') {
      res.status(409).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to create subscription' });
    }
  }
});
```

## Testing

The service includes comprehensive unit tests covering:

- Subscription creation with new and existing Stripe customers
- Subscription cancellation with access retention
- Payment success webhook handling
- Payment failure webhook handling
- Expired subscription processing
- Error conditions and edge cases

Run tests:

```bash
npm test -- SubscriptionManager.test.ts
```

## Subscription Lifecycle

```
1. User requests upgrade
   ↓
2. createSubscription() called
   ↓
3. Stripe customer created/retrieved
   ↓
4. Stripe subscription created
   ↓
5. Database subscription record created
   ↓
6. User role upgraded to 'premium'
   ↓
7. Monthly payments processed by Stripe
   ↓
8. handlePaymentSuccess() on successful payment
   ↓
9. User cancels (optional)
   ↓
10. cancelSubscription() sets cancel_at_period_end
    ↓
11. Access maintained until currentPeriodEnd
    ↓
12. checkExpiredSubscriptions() runs daily
    ↓
13. Subscription marked as 'expired'
    ↓
14. User role reverted to 'normal'
```

## Future Enhancements

- **Email Notifications**: Integrate with email service for payment failure notifications
- **Multiple Plans**: Support for different subscription tiers (monthly, yearly, etc.)
- **Proration**: Handle mid-cycle plan changes with proration
- **Trial Periods**: Support for free trial periods
- **Dunning**: Automatic retry logic for failed payments
- **Analytics**: Track subscription metrics and churn rates
