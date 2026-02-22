# PerformanceDisplay Component

## Overview

The `PerformanceDisplay` component displays historical performance data for completed premium trading signals. It fetches data from the `/api/signals/performance` endpoint and presents it in a clean, tabular format at the bottom of the homepage.

## Requirements

This component implements the following requirements:
- **Requirement 6.1**: Display successful premium trades at bottom of page
- **Requirement 6.2**: Show profitable trades in green color
- **Requirement 6.3**: Include profit percentage for each trade

## Features

- Fetches completed trades from the backend API
- Displays cryptocurrency symbol, entry price, exit price, profit percentage, and exit date
- Color-codes profit percentages (green for positive, red for negative)
- Responsive table layout
- Loading and error states
- Empty state when no trades are available

## Usage

```tsx
import { PerformanceDisplay } from './components/PerformanceDisplay';

function HomePage() {
  return (
    <div>
      {/* Other components */}
      <PerformanceDisplay limit={10} />
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `limit` | `number` | `10` | Maximum number of trades to display (optional) |

## Data Structure

The component expects the following data structure from the API:

```typescript
interface CompletedTrade {
  id: string;
  signalId: string;
  cryptocurrency: string;
  entryPrice: number;
  exitPrice: number;
  profitPercent: number;
  entryDate: Date;
  exitDate: Date;
  signalType: 'premium';
}
```

## API Endpoint

**GET** `/api/signals/performance`

**Response:**
```json
{
  "trades": [
    {
      "id": "uuid",
      "signalId": "uuid",
      "cryptocurrency": "BTC",
      "entryPrice": 50000,
      "exitPrice": 55000,
      "profitPercent": 10.0,
      "entryDate": "2024-01-01T00:00:00Z",
      "exitDate": "2024-01-10T00:00:00Z",
      "signalType": "premium"
    }
  ]
}
```

## Styling

The component uses TailwindCSS for styling with the following key features:
- White background with rounded corners and shadow
- Responsive table layout
- Green text (`text-green-600`) for profitable trades
- Red text (`text-red-600`) for losing trades
- Hover effects on table rows
- Purple accent color for premium branding

## States

### Loading State
Displays a loading spinner while fetching data from the API.

### Error State
Shows an error message if the API call fails.

### Empty State
Displays a message when no completed trades are available.

### Success State
Renders a table with all completed trades showing:
- Cryptocurrency symbol
- Entry price (formatted as currency)
- Exit price (formatted as currency)
- Profit percentage (color-coded)
- Exit date (formatted as readable date)

## Testing

The component includes comprehensive unit tests covering:
- Loading state display
- Trade data display with all required fields
- Green styling for profitable trades
- Red styling for losing trades
- Error handling
- Empty state
- Date formatting
- Table headers
- Trade count display

Run tests with:
```bash
npm test PerformanceDisplay.test.tsx
```

## Implementation Notes

1. The component automatically fetches data on mount using `useEffect`
2. All prices are formatted with 2 decimal places and thousand separators
3. Dates are formatted in a human-readable format (e.g., "Jan 10, 2024")
4. The profit percentage includes a "+" prefix for positive values
5. The component is fully responsive and works on mobile devices
6. No authentication is required as this is a public endpoint

## Future Enhancements

Potential improvements for future iterations:
- Pagination for large datasets
- Filtering by cryptocurrency
- Sorting by different columns
- Detailed view modal for individual trades
- Performance statistics (win rate, average profit, etc.)
- Export to CSV functionality
