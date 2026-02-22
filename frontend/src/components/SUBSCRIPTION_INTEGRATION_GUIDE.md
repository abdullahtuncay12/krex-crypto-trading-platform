# SubscriptionModal Integration Guide

## Overview

This guide explains how to integrate the SubscriptionModal component throughout the application to handle premium feature access and upgrade flows.

## Integration Points

### 1. SignalDisplay Component

When normal users view signals, show basic analysis only. When they try to access premium features, trigger the upgrade modal.

```tsx
import { SignalDisplay, SubscriptionModal } from './components';
import { useSelector } from 'react-redux';
import { useState } from 'react';

function TradingSignalPage() {
  const user = useSelector((state) => state.auth.user);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [signal, setSignal] = useState(null);

  const handlePremiumFeatureClick = () => {
    if (user?.role === 'normal') {
      setShowUpgradeModal(true);
    }
  };

  return (
    <>
      <SignalDisplay 
        signal={signal}
        userRole={user?.role || 'normal'}
        onPremiumFeatureClick={handlePremiumFeatureClick}
      />
      
      <SubscriptionModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={() => {
          // Refresh user data
          dispatch(fetchCurrentUser());
        }}
      />
    </>
  );
}
```

### 2. Alert Configuration (Premium Only)

Wrap the alert configuration UI with PremiumFeatureGuard:

```tsx
import { PremiumFeatureGuard } from './components';

function AlertSettings() {
  const user = useSelector((state) => state.auth.user);

  return (
    <PremiumFeatureGuard userRole={user?.role || 'normal'}>
      <AlertConfigurationForm />
    </PremiumFeatureGuard>
  );
}
```

### 3. Historical Chart Extended Analysis

Show basic chart to all users, but lock extended analysis behind premium:

```tsx
import { HistoricalChart, PremiumFeatureGuard } from './components';

function CryptoAnalysis({ symbol }) {
  const user = useSelector((state) => state.auth.user);

  return (
    <div>
      {/* Basic chart - available to all */}
      <HistoricalChart 
        cryptocurrency={symbol}
        data={priceData}
        userRole={user?.role || 'normal'}
      />

      {/* Extended analysis - premium only */}
      <PremiumFeatureGuard userRole={user?.role || 'normal'}>
        <ExtendedAnalysisPanel symbol={symbol} />
      </PremiumFeatureGuard>
    </div>
  );
}
```

### 4. Navigation/Header

Add upgrade button in header for normal users:

```tsx
function Header() {
  const user = useSelector((state) => state.auth.user);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  return (
    <header>
      <nav>
        {/* ... other nav items ... */}
        
        {user?.role === 'normal' && (
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold"
          >
            Upgrade to Premium
          </button>
        )}

        {user?.role === 'premium' && (
          <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full font-semibold">
            Premium
          </span>
        )}
      </nav>

      <SubscriptionModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={() => dispatch(fetchCurrentUser())}
      />
    </header>
  );
}
```

### 5. Feature Comparison Page

Create a dedicated pricing/features page:

```tsx
function PricingPage() {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const features = {
    normal: [
      'Basic trading signals',
      'Hourly signal updates',
      'Basic trend analysis',
      'Community support',
    ],
    premium: [
      'Advanced AI-powered signals',
      'Real-time data updates',
      'Stop-loss recommendations',
      'Limit order suggestions',
      'Price movement alerts',
      'Pump detection notifications',
      'Extended historical analysis',
      'Priority support',
    ],
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Normal Plan */}
      <div className="border rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Normal</h2>
        <p className="text-3xl font-bold mb-6">Free</p>
        <ul className="space-y-3 mb-6">
          {features.normal.map((feature) => (
            <li key={feature} className="flex items-start">
              <CheckIcon className="text-green-500" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Premium Plan */}
      <div className="border-2 border-blue-600 rounded-lg p-6 relative">
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
          Recommended
        </div>
        <h2 className="text-2xl font-bold mb-4">Premium</h2>
        <p className="text-3xl font-bold mb-6">$29.99/month</p>
        <ul className="space-y-3 mb-6">
          {features.premium.map((feature) => (
            <li key={feature} className="flex items-start">
              <CheckIcon className="text-green-500" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <button
          onClick={() => setShowUpgradeModal(true)}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
        >
          Upgrade Now
        </button>
      </div>

      <SubscriptionModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={() => {
          dispatch(fetchCurrentUser());
          // Optionally redirect to dashboard
          navigate('/dashboard');
        }}
      />
    </div>
  );
}
```

## Backend Integration

### Environment Variables

Add to `.env`:

```env
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### API Endpoint

The SubscriptionModal calls `subscriptionAPI.upgrade()` which hits:

```
POST /api/subscriptions/upgrade
```

Expected request:
```json
{
  "planId": "premium",
  "paymentMethodId": "pm_xxx"
}
```

Expected response:
```json
{
  "subscription": {
    "id": "sub_xxx",
    "userId": "user_xxx",
    "status": "active",
    "currentPeriodStart": "2024-01-01T00:00:00Z",
    "currentPeriodEnd": "2024-02-01T00:00:00Z"
  }
}
```

## User Flow

### Normal User Attempting Premium Feature

1. User clicks on premium feature (e.g., "View Advanced Signals")
2. System checks user role
3. If normal user, show SubscriptionModal
4. User reviews premium features and pricing
5. User clicks "Continue to Payment"
6. Stripe CardElement appears
7. User enters card details
8. User clicks "Subscribe for $29.99/month"
9. System creates payment method via Stripe
10. System calls backend `/api/subscriptions/upgrade`
11. Backend creates subscription and updates user role
12. Frontend shows success message
13. After 2 seconds, modal closes
14. `onUpgrade()` callback refreshes user data
15. User now has premium access

### Error Handling

**Card Declined:**
```tsx
// Error displayed in modal
"Your card was declined. Please try a different payment method."
```

**Network Error:**
```tsx
// Error displayed in modal
"Unable to process payment. Please check your connection and try again."
```

**Subscription Already Active:**
```tsx
// Backend returns 409 Conflict
"You already have an active subscription."
```

## Testing Integration

### Unit Tests

Test that components properly trigger the modal:

```tsx
it('should show upgrade modal when normal user clicks premium feature', () => {
  const { getByText } = render(<SignalDisplay userRole="normal" />);
  
  fireEvent.click(getByText('View Advanced Analysis'));
  
  expect(screen.getByText('Upgrade to Premium')).toBeInTheDocument();
});
```

### Integration Tests

Test the complete upgrade flow:

```tsx
it('should upgrade user from normal to premium', async () => {
  // Mock user as normal
  mockAuthState({ user: { role: 'normal' } });
  
  // Render component
  render(<App />);
  
  // Click premium feature
  fireEvent.click(screen.getByText('Advanced Signals'));
  
  // Modal should appear
  expect(screen.getByText('Upgrade to Premium')).toBeInTheDocument();
  
  // Continue to payment
  fireEvent.click(screen.getByText('Continue to Payment'));
  
  // Fill card details (mocked)
  // Submit payment
  fireEvent.click(screen.getByText('Subscribe for $29.99/month'));
  
  // Wait for success
  await waitFor(() => {
    expect(screen.getByText('Payment Successful!')).toBeInTheDocument();
  });
  
  // Verify user role updated
  await waitFor(() => {
    expect(mockFetchCurrentUser).toHaveBeenCalled();
  });
});
```

## Best Practices

1. **Always refresh user data after upgrade**: Call `fetchCurrentUser()` in `onUpgrade` callback
2. **Show clear value proposition**: Display all premium features before payment
3. **Handle errors gracefully**: Show user-friendly error messages
4. **Provide feedback**: Show loading states during payment processing
5. **Test payment flows**: Use Stripe test cards in development
6. **Secure API keys**: Never expose secret keys in frontend code
7. **Validate on backend**: Always verify subscription status server-side

## Stripe Test Cards

For testing payment flows:

- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Insufficient funds**: 4000 0000 0000 9995
- **Expired card**: 4000 0000 0000 0069

Use any future expiry date and any 3-digit CVC.

## Related Documentation

- [SubscriptionModal README](./SUBSCRIPTION_MODAL_README.md)
- [Stripe Elements Documentation](https://stripe.com/docs/stripe-js/react)
- [Backend Subscription Routes](../../backend/src/routes/SUBSCRIPTION_ROUTES_README.md)
