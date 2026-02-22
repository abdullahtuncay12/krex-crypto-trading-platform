# AlertService

## Overview

The AlertService is responsible for monitoring cryptocurrency price movements and sending real-time alerts to premium users. It runs scheduled checks every 60 seconds to detect significant price changes and pump signals.

## Features

- **Price Movement Monitoring**: Tracks price changes for all cryptocurrencies monitored by premium users
- **Pump Detection**: Identifies rapid price increases (10%+ in 60 seconds)
- **User Preference Validation**: Respects individual user alert preferences before sending notifications
- **In-App Notifications**: Stores alerts in database for in-app delivery
- **Premium-Only**: Only sends alerts to users with premium role

## Requirements Implemented

- **10.1**: Alert generation on trading opportunities
- **10.2**: Pump news detection within 60 seconds
- **10.3**: Query user alert preferences before sending
- **10.4**: Alert content completeness (includes cryptocurrency symbol and reason)
- **10.5**: Deliver alerts through in-app notifications

## API

### Methods

#### `checkPriceMovements(): Promise<void>`

Checks price movements for all monitored cryptocurrencies and sends alerts to users when price changes exceed their configured thresholds.

- Runs every 60 seconds
- Compares current price with cached price from previous check
- Sends alerts for both increases and decreases
- Respects user-specific threshold settings

#### `detectPumpSignals(): Promise<void>`

Detects pump signals (rapid price increases of 10% or more) and notifies users with pump alerts enabled.

- Runs every 60 seconds
- Only triggers on price increases (not decreases)
- Only notifies users with `enablePumpAlerts: true`
- Sends special "PUMP DETECTED" alerts

#### `sendAlert(userId: string, alertInput: Omit<CreateAlertInput, 'userId'>): Promise<void>`

Sends an alert to a specific user after validating preferences and permissions.

**Parameters:**
- `userId`: The ID of the user to send the alert to
- `alertInput`: Alert details including:
  - `cryptocurrency`: Symbol (e.g., 'BTC', 'ETH')
  - `alertType`: 'price_movement' | 'pump_detected' | 'trading_opportunity'
  - `message`: Human-readable alert message

**Validation:**
- Verifies user has premium role
- Checks user has alert preferences configured
- Ensures cryptocurrency is in user's monitored list
- For pump alerts, verifies `enablePumpAlerts` is enabled

#### `startMonitoring(): void`

Starts the alert monitoring service with scheduled checks every 60 seconds.

- Runs `checkPriceMovements()` and `detectPumpSignals()` immediately
- Schedules periodic execution every 60 seconds
- Should be called once on application startup

#### `clearCache(): void`

Clears the internal price cache. Useful for testing.

## Usage Example

```typescript
import { alertService } from './services/AlertService';

// Start monitoring on application startup
alertService.startMonitoring();

// Manually send a custom alert
await alertService.sendAlert('user-123', {
  cryptocurrency: 'BTC',
  alertType: 'trading_opportunity',
  message: 'Strong buy signal detected for BTC at $50,000'
});
```

## Architecture

### Price Caching

The service maintains an in-memory cache of cryptocurrency prices:

```typescript
{
  'BTC': { price: 50000, timestamp: Date },
  'ETH': { price: 3000, timestamp: Date }
}
```

This cache is updated every 60 seconds and used to calculate price changes between checks.

### Alert Flow

1. **Scheduled Check** (every 60 seconds)
   - Get list of monitored cryptocurrencies from premium users
   - Fetch current prices from ExchangeAggregator
   - Compare with cached prices

2. **Price Movement Detection**
   - Calculate percentage change
   - For each user monitoring the cryptocurrency:
     - Check if change exceeds user's threshold
     - Send alert if threshold exceeded

3. **Pump Detection**
   - Check if price increased by 10% or more
   - For each user with pump alerts enabled:
     - Check if user monitors the cryptocurrency
     - Send pump alert

4. **Alert Sending**
   - Validate user is premium
   - Validate user preferences
   - Create alert record in database
   - Alert appears in user's in-app notifications

## Dependencies

- **ExchangeAggregator**: Fetches current cryptocurrency prices
- **AlertRepository**: Stores alerts in database
- **AlertPreferencesRepository**: Retrieves user alert preferences
- **UserRepository**: Validates user roles

## Configuration

### Constants

- `PUMP_THRESHOLD`: 10% (price increase required to trigger pump alert)
- `CHECK_INTERVAL`: 60000ms (60 seconds between checks)

## Error Handling

The service handles errors gracefully:

- Exchange API failures are logged but don't stop monitoring
- User validation errors are logged but don't affect other users
- Database errors are caught and logged
- Service continues running even if individual checks fail

## Testing

Comprehensive unit tests cover:

- Alert sending with various user roles and preferences
- Price movement detection with different thresholds
- Pump signal detection
- User preference validation
- Error handling scenarios
- Multi-user scenarios with different preferences

Run tests:
```bash
npm test -- AlertService.test.ts
```

## Performance Considerations

- **In-Memory Cache**: Prices are cached in memory for fast access
- **Batch Processing**: All cryptocurrencies checked in parallel
- **Efficient Queries**: Uses repository methods optimized for bulk operations
- **Scheduled Execution**: Fixed 60-second interval prevents overlapping checks

## Future Enhancements

Potential improvements:

- WebSocket support for real-time push notifications
- Email/SMS alert delivery options
- Configurable check intervals per user
- Alert history and analytics
- Machine learning for personalized alert thresholds
