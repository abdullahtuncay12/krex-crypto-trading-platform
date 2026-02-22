# HistoricalChart Component

## Overview

The `HistoricalChart` component displays historical price data for a selected cryptocurrency with visualization using Chart.js. It provides basic trend analysis for all users and extended analysis with volatility metrics, support/resistance levels for premium users.

## Requirements Validation

This component validates the following requirements:

- **Requirement 7.1**: Displays historical price data when a user selects a cryptocurrency
- **Requirement 7.2**: Shows at least 30 days of price history
- **Requirement 7.4**: Provides extended historical analysis for premium users

## Features

### For All Users (Normal & Premium)
- Line chart visualization of 30-day price history
- Basic trend analysis including:
  - Price change percentage over the period
  - Price range (min/max)
  - Gain/loss summary
- Loading and error states
- Responsive design with TailwindCSS

### For Premium Users Only
- Extended analysis including:
  - **Volatility metrics**: Calculated standard deviation of returns
  - **Trend analysis**: Linear regression slope indicating market direction
  - **Support level**: Recent price floor based on last 10 data points
  - **Resistance level**: Recent price ceiling based on last 10 data points
  - Detailed trend descriptions (bullish, bearish, consolidating)
- Premium badge indicator
- Enhanced visual styling

### For Normal Users
- Upgrade prompt to access premium features
- Clear indication of locked features

## Props

```typescript
interface HistoricalChartProps {
  cryptocurrency: string;  // Symbol of the cryptocurrency (e.g., "BTC", "ETH")
  userRole: 'normal' | 'premium';  // User's membership level
}
```

## Data Structure

```typescript
interface PricePoint {
  timestamp: Date;    // Date/time of the price point
  price: number;      // Price in USD
  volume: number;     // Trading volume
}
```

## Usage Example

```tsx
import { HistoricalChart } from './components';

function TradingPage() {
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const userRole = useSelector((state) => state.auth.user?.role || 'normal');

  return (
    <div>
      <HistoricalChart 
        cryptocurrency={selectedCrypto} 
        userRole={userRole}
      />
    </div>
  );
}
```

## API Integration

The component fetches historical data from:
- **Endpoint**: `GET /api/cryptocurrencies/:symbol/history`
- **Query Parameters**: `days=30` (minimum 30 days as per requirement 7.2)
- **Response Format**:
  ```json
  {
    "data": [
      {
        "timestamp": "2024-01-01T00:00:00Z",
        "price": 50000,
        "volume": 1000000000
      }
    ]
  }
  ```

## Analysis Calculations

### Basic Analysis (All Users)
- **Price Change**: `((lastPrice - firstPrice) / firstPrice) * 100`
- **Price Range**: `min(prices)` to `max(prices)`

### Extended Analysis (Premium Only)

#### Volatility
Calculated as the standard deviation of daily returns:
```
returns = [(price[i] - price[i-1]) / price[i-1] for each day]
volatility = sqrt(variance(returns)) * 100
```

#### Trend
Linear regression slope indicating price direction:
```
slope = Σ((x - x̄)(y - ȳ)) / Σ((x - x̄)²)
where x = day index, y = price
```

#### Support Level
Minimum price from the last 10 data points

#### Resistance Level
Maximum price from the last 10 data points

## States

### Loading State
- Displays animated spinner
- Shown while fetching data from API

### Error State
- Displays error icon and message
- Handles API failures gracefully
- Shows user-friendly error messages

### Empty State
- Displays "No historical data available"
- Shown when API returns empty data array

### Success State
- Displays chart with price history
- Shows analysis section with role-appropriate content
- Includes upgrade prompt for normal users

## Styling

The component uses TailwindCSS classes for styling:
- **Chart container**: White background, rounded corners, shadow
- **Premium analysis**: Purple-blue gradient background
- **Normal analysis**: Gray background
- **Upgrade prompt**: Purple-blue gradient with call-to-action button

## Chart Configuration

Uses Chart.js with the following configuration:
- **Type**: Line chart with area fill
- **Tension**: 0.4 (smooth curves)
- **Colors**: Indigo (rgb(99, 102, 241))
- **Responsive**: Maintains aspect ratio on different screen sizes
- **Tooltip**: Shows formatted price on hover
- **Y-axis**: Formatted with dollar signs and commas

## Testing

Comprehensive unit tests cover:
- Data fetching with 30+ days requirement
- Loading, error, and empty states
- Basic vs. extended analysis display
- Premium badge and upgrade prompt visibility
- Analysis calculations (price change, range)
- Edge cases (empty symbol, single data point, extreme volatility)
- Component re-rendering on prop changes

Run tests with:
```bash
npm test -- HistoricalChart.test.tsx
```

## Error Handling

The component handles the following error scenarios:
1. **API failure**: Displays error message from server
2. **Network error**: Shows generic "Failed to load historical data" message
3. **Empty data**: Shows "No historical data available" message
4. **Empty cryptocurrency symbol**: Prevents API call, shows empty state

## Accessibility

- Semantic HTML structure
- Loading state with appropriate ARIA attributes
- Error messages are clearly visible
- Interactive elements (buttons) have proper contrast
- Chart.js provides keyboard navigation support

## Performance Considerations

- Data fetching only occurs when cryptocurrency or userRole changes
- Chart.js efficiently handles re-renders
- Analysis calculations are performed once per data load
- Component uses React.memo patterns where appropriate

## Future Enhancements

Potential improvements for future iterations:
- Customizable time ranges (7 days, 90 days, 1 year)
- Multiple chart types (candlestick, bar)
- Technical indicators overlay (RSI, MACD, Bollinger Bands)
- Zoom and pan functionality
- Export chart as image
- Compare multiple cryptocurrencies
- Real-time data updates with WebSocket

## Dependencies

- `react`: ^18.2.0
- `chart.js`: ^4.4.1
- `react-chartjs-2`: ^5.2.0
- `axios`: ^1.6.2 (via API client)

## Related Components

- **CryptoSelector**: Provides cryptocurrency selection
- **SignalDisplay**: Shows trading signals for selected cryptocurrency
- **PerformanceDisplay**: Shows historical trading performance

## Notes

- The component automatically fetches data when mounted or when props change
- Premium analysis includes advanced metrics not available to normal users
- All analysis text is in English (requirement 3.3)
- The 30-day minimum is enforced in the API call (requirement 7.2)
