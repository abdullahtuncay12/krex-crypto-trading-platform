# Alert Components

This document describes the AlertList and AlertPreferences components for premium users.

## AlertList Component

Displays a list of alerts for premium users with unread count badge and mark-as-read functionality.

### Features

- Fetches alerts from `/api/alerts` endpoint
- Displays cryptocurrency symbol and alert message (reason)
- Shows unread count badge
- Marks alerts as read when clicked
- Different icons for different alert types (price_movement, pump_detected, trading_opportunity)
- Visual distinction between read and unread alerts
- Relative timestamps (e.g., "5m ago", "2h ago")

### Props

```typescript
interface AlertListProps {
  onAlertClick?: (alert: Alert) => void;
}

interface Alert {
  id: string;
  userId: string;
  cryptocurrency: string;
  alertType: 'price_movement' | 'pump_detected' | 'trading_opportunity';
  message: string;
  read: boolean;
  createdAt: Date;
}
```

### Usage

```tsx
import { AlertList } from './components/AlertList';

function App() {
  const handleAlertClick = (alert) => {
    console.log('Alert clicked:', alert);
  };

  return <AlertList onAlertClick={handleAlertClick} />;
}
```

### Requirements

- **Requirement 10.1**: Fetches alerts from API
- **Requirement 10.4**: Displays cryptocurrency symbol and reason

## AlertPreferences Component

Allows premium users to configure their alert settings.

### Features

- Price movement threshold slider (1-50%)
- Toggle for pump detection alerts
- Cryptocurrency selection with checkboxes
- Select All / Deselect All functionality
- Saves preferences to `/api/alerts/preferences` endpoint
- Loads existing preferences on mount
- Success/error message display
- Validates at least one cryptocurrency is selected

### Props

```typescript
interface AlertPreferencesProps {
  onSave?: (preferences: AlertPreferences) => void;
}

interface AlertPreferences {
  id: string;
  userId: string;
  priceMovementThreshold: number;
  enablePumpAlerts: boolean;
  cryptocurrencies: string[];
  updatedAt: Date;
}
```

### Usage

```tsx
import { AlertPreferences } from './components/AlertPreferences';

function App() {
  const handleSave = (preferences) => {
    console.log('Preferences saved:', preferences);
  };

  return <AlertPreferences onSave={handleSave} />;
}
```

### Requirements

- **Requirement 10.3**: Allows premium users to configure alert settings

## API Integration

Both components use the `alertAPI` from `src/api/client.ts`:

```typescript
// Get alerts
alertAPI.getAlerts()

// Get preferences
alertAPI.getPreferences()

// Update preferences
alertAPI.updatePreferences({
  priceMovementThreshold: 10,
  enablePumpAlerts: true,
  cryptocurrencies: ['BTC', 'ETH']
})
```

## Styling

Both components use TailwindCSS for styling and follow the design patterns established in other components:

- White background with rounded corners and shadow
- Blue accent color for interactive elements
- Green for success messages, red for errors
- Responsive design with proper spacing
- Loading spinners during API calls

## Testing

Unit tests are provided in:
- `__tests__/AlertList.test.tsx`
- `__tests__/AlertPreferences.test.tsx`

Tests cover:
- Loading states
- Error handling
- User interactions
- API integration
- Visual styling
- Requirement validation

## Integration with HomePage

These components should be integrated into the HomePage for premium users:

```tsx
import { AlertList, AlertPreferences } from './components';
import { useSelector } from 'react-redux';

function HomePage() {
  const user = useSelector((state) => state.auth.user);
  const isPremium = user?.role === 'premium';

  return (
    <div>
      {/* Other components */}
      
      {isPremium && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <AlertList />
          <AlertPreferences />
        </div>
      )}
    </div>
  );
}
```
