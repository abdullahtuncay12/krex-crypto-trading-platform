# Subscription Routes

This module provides REST API endpoints for managing user subscriptions, including upgrading to premium, canceling subscriptions, checking subscription status, and handling Stripe webhooks.

## Requirements

Implements requirements:
- **8.1**: Display premium subscription options
- **8.2**: Premium activation on payment success
- **8.4**: Access retention on subscription cancellation

## Endpoints

### POST /api/subscriptions/upgrade

Upgrade a user to premium subscription.

**Authentication**: Required (Bearer token)

**Request Body**:
```json
{
  "planId": "price_1234567890",
  "paymentMethodId": "pm_card_visa"
}
```

**Response** (201 Created):
```json
{
  "subscription": {
    "id": "sub-123",
    "userId": "user-123",
    "planId": "price_1234567890",
    "status": "active",
    "currentPeriodStart": "2024-01-01T00:00:00.000Z",
    "currentPeriodEnd": "2024-02-01T00:00:00.000Z",
    "cancelAtPeriodEnd": false,
    "stripeSubscriptionId": "sub_stripe_123",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Missing required fields (planId or paymentMethodId)
- `401 Unauthorized`: Missing or invalid authentication token
- `404 Not Found`: User not found
- `409 Conflict`: User already has an active subscription
- `402 Payment Required`: Payment processing failed (Stripe error)
- `500 Internal Server Error`: Subscription creation failed

---

### POST /api/subscriptions/cancel

Cancel a user's subscription. The user will maintain premium access until the end of the current billing period.

**Authentication**: Required (Bearer token)

**Request Body**: None

**Response** (200 OK):
```json
{
  "subscription": {
    "id": "sub-123",
    "userId": "user-123",
    "planId": "price_1234567890",
    "status": "active",
    "currentPeriodStart": "2024-01-01T00:00:00.000Z",
    "currentPeriodEnd": "2024-02-01T00:00:00.000Z",
    "cancelAtPeriodEnd": true,
    "stripeSubscriptionId": "sub_stripe_123",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid authentication token
- `404 Not Found`: No subscription found for user
- `400 Bad Request`: Subscription is not active
- `500 Internal Server Error`: Subscription cancellation failed

---

### GET /api/subscriptions/status

Get the current user's subscription status.

**Authentication**: Required (Bearer token)

**Request Body**: None

**Response** (200 OK):

With active subscription:
```json
{
  "subscription": {
    "id": "sub-123",
    "userId": "user-123",
    "planId": "price_1234567890",
    "status": "active",
    "currentPeriodStart": "2024-01-01T00:00:00.000Z",
    "currentPeriodEnd": "2024-02-01T00:00:00.000Z",
    "cancelAtPeriodEnd": false,
    "stripeSubscriptionId": "sub_stripe_123",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "status": "active"
}
```

Without subscription:
```json
{
  "subscription": null,
  "status": "none"
}
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid authentication token
- `500 Internal Server Error`: Failed to retrieve subscription status

---

### POST /api/webhooks/stripe

Handle Stripe webhook events for subscription lifecycle management.

**Authentication**: None (public endpoint, verified via Stripe signature)

**Headers**:
- `stripe-signature`: Stripe webhook signature (required)

**Request Body**: Stripe event object (raw body required for signature verification)

**Supported Events**:
- `invoice.payment_succeeded`: Updates subscription and ensures user has premium role
- `invoice.payment_failed`: Marks subscription as expired and reverts user to normal role
- `customer.subscription.deleted`: Handles immediate subscription deletion

**Response** (200 OK):
```json
{
  "received": true
}
```

**Error Responses**:
- `400 Bad Request`: Missing or invalid Stripe signature
- `500 Internal Server Error`: Webhook processing failed or not configured

## Usage Examples

### Upgrade to Premium

```typescript
const response = await fetch('/api/subscriptions/upgrade', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    planId: 'price_premium_monthly',
    paymentMethodId: 'pm_card_visa',
  }),
});

const { subscription } = await response.json();
console.log('Subscription created:', subscription);
```

### Cancel Subscription

```typescript
const response = await fetch('/api/subscriptions/cancel', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

const { subscription } = await response.json();
console.log('Subscription cancelled, access until:', subscription.currentPeriodEnd);
```

### Check Subscription Status

```typescript
const response = await fetch('/api/subscriptions/status', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

const { subscription, status } = await response.json();
console.log('Subscription status:', status);
```

## Stripe Webhook Configuration

To configure Stripe webhooks:

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Select events to listen for:
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`
4. Copy the webhook signing secret
5. Set `STRIPE_WEBHOOK_SECRET` environment variable

## Environment Variables

Required environment variables:

```bash
# Stripe API key
STRIPE_SECRET_KEY=sk_test_...

# Stripe webhook signing secret
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Security Considerations

1. **Authentication**: All subscription management endpoints (except webhooks) require valid JWT authentication
2. **Webhook Verification**: Webhook endpoint verifies Stripe signature to prevent unauthorized requests
3. **User Isolation**: Users can only manage their own subscriptions (enforced via JWT user ID)
4. **Payment Security**: Payment processing is handled entirely by Stripe; no sensitive payment data is stored

## Error Handling

All endpoints follow the standard error response format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

## Testing

Unit tests are located in `__tests__/subscriptions.test.ts` and cover:
- Successful subscription upgrade
- Subscription cancellation
- Status retrieval
- Webhook event handling
- Error cases (missing fields, invalid data, etc.)

Run tests:
```bash
npm test -- subscriptions.test.ts
```

## Dependencies

- `express`: Web framework
- `stripe`: Stripe API client
- `../services/SubscriptionManager`: Business logic for subscription management
- `../middleware/auth`: JWT authentication middleware
- `../models/SubscriptionRepository`: Database operations for subscriptions

## Related Files

- `backend/src/services/SubscriptionManager.ts`: Subscription business logic
- `backend/src/models/SubscriptionRepository.ts`: Database operations
- `backend/src/middleware/auth.ts`: Authentication middleware
- `backend/src/routes/__tests__/subscriptions.test.ts`: Unit tests
