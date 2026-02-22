# SubscriptionModal Component

## Overview

The `SubscriptionModal` component provides a complete subscription upgrade flow for users to upgrade from normal to premium membership. It integrates with Stripe Elements for secure payment processing and displays premium plan features and pricing.

## Features

- **Premium Plan Display**: Shows plan name, pricing ($29.99/month), and comprehensive feature list
- **Stripe Integration**: Secure payment processing using Stripe Elements
- **Payment Flow**: Two-step process (plan review → payment form)
- **Success/Failure Handling**: Visual feedback for payment outcomes
- **Responsive Design**: Works on desktop and mobile devices
- **Accessibility**: Proper ARIA labels and keyboard navigation

## Usage

```tsx
import { SubscriptionModal } from './components';

function MyComponent() {
  const [showModal, setShowModal] = useState(false);

  const handleUpgrade = () => {
    // Refresh user data to reflect premium status
    dispatch(fetchCurrentUser());
  };

  return (
    <>
      <button onClick={() => setShowModal(true)}>
        Upgrade to Premium
      </button>
      
      <SubscriptionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onUpgrade={handleUpgrade}
      />
    </>
  );
}
```

## Props

### SubscriptionModalProps

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | `boolean` | Yes | Controls modal visibility |
| `onClose` | `() => void` | Yes | Callback when modal is closed |
| `onUpgrade` | `() => void` | Yes | Callback when upgrade succeeds |

## Premium Plan Features

The component displays the following premium features:

1. Advanced trading signals with AI analysis
2. Real-time data updates
3. Stop-loss recommendations
4. Limit order suggestions
5. Price movement alerts
6. Pump detection notifications
7. Extended historical analysis
8. Priority support

## Payment Flow

### Step 1: Plan Review
- Displays premium plan details
- Shows all features with checkmarks
- "Continue to Payment" button
- Cancellation policy information

### Step 2: Payment Form
- Stripe CardElement for secure card input
- Submit button with loading state
- Error display for failed payments
- Success confirmation with auto-close

## Environment Variables

The component requires the following environment variable:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

Set this in your `.env` file with your Stripe publishable key.

## API Integration

The component uses the `subscriptionAPI.upgrade()` method:

```typescript
subscriptionAPI.upgrade({
  planId: 'premium',
  paymentMethodId: 'pm_xxx'
})
```

Expected response:
```typescript
{
  subscription: {
    id: string;
    status: 'active';
    // ... other subscription fields
  }
}
```

## Error Handling

The component handles various error scenarios:

1. **Stripe Errors**: Invalid card, declined card, etc.
2. **API Errors**: Network failures, server errors
3. **Validation Errors**: Missing payment method

All errors are displayed in a red alert box above the payment form.

## Success Flow

On successful payment:
1. Shows success message with checkmark icon
2. Displays "Payment Successful!" confirmation
3. Auto-closes after 2 seconds
4. Calls `onUpgrade()` callback
5. Calls `onClose()` callback

## Styling

The component uses Tailwind CSS classes for styling:

- **Colors**: Blue for primary actions, green for success, red for errors
- **Layout**: Centered modal with max-width of 2xl
- **Responsive**: Scrollable content on small screens
- **Animations**: Smooth transitions for hover states

## Accessibility

- Close button has `aria-label="Close modal"`
- Keyboard navigation supported
- Focus management for modal
- Screen reader friendly error messages

## Testing

The component includes comprehensive tests covering:

- Modal visibility
- Premium plan display
- Payment flow
- Success/failure handling
- Stripe integration
- Error handling
- State management

Run tests:
```bash
npm test SubscriptionModal.test.tsx
```

## Integration with User Role

When a user successfully upgrades:

1. Backend updates user role to 'premium'
2. Frontend calls `onUpgrade()` to refresh user data
3. User gains access to premium features immediately
4. Premium-only components become available

## Security Considerations

- Never stores card details locally
- Uses Stripe's secure CardElement
- Payment method tokens are single-use
- All payment processing happens server-side
- Stripe publishable key is safe to expose

## Future Enhancements

Potential improvements:

- Multiple plan tiers (monthly, yearly)
- Promo code support
- Trial period handling
- Subscription management (cancel, update payment)
- Invoice history display

## Related Components

- `SignalDisplay`: Shows premium vs. basic signals
- `HistoricalChart`: Extended analysis for premium users
- `AlertPreferences`: Premium-only alert configuration

## Requirements Validation

This component validates:

- **Requirement 8.1**: Display premium subscription options when normal user requests upgrade
- **Requirement 8.2**: Activate premium membership immediately upon payment completion
