# Stripe Setup Guide

## Installation

To complete the SubscriptionManager implementation, install the required dependencies:

```bash
cd backend
npm install stripe
npm install --save-dev @types/stripe
```

## Environment Configuration

Add your Stripe keys to `.env`:

```bash
STRIPE_SECRET_KEY=sk_test_your_test_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## Verification

After installation, run the tests to verify everything works:

```bash
npm test -- SubscriptionManager.test.ts
```

## Next Steps

1. Set up Stripe webhook endpoint in your Express app
2. Configure cron job for expired subscription checks
3. Integrate email service for payment failure notifications
