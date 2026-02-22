# CryptoSelector Component

## Overview

The `CryptoSelector` component provides a searchable dropdown interface for selecting cryptocurrencies. It fetches the list of available cryptocurrencies from the API on mount and allows users to filter and select a cryptocurrency.

## Features

- **Automatic Data Fetching**: Fetches cryptocurrency list from API on component mount
- **Search/Filter**: Real-time filtering by cryptocurrency symbol or name (case-insensitive)
- **Dropdown Interface**: Clean dropdown UI with click-outside-to-close functionality
- **Visual Feedback**: Shows loading state, error messages, and selected cryptocurrency
- **Price Display**: Shows current price and 24h change for each cryptocurrency
- **Accessibility**: Proper labels and keyboard-friendly interface

## Usage

```tsx
import { CryptoSelector, Cryptocurrency } from './components';

function MyComponent() {
  const handleCryptoSelect = (crypto: Cryptocurrency) => {
    console.log('Selected:', crypto);
    // Do something with the selected cryptocurrency
  };

  return (
    <CryptoSelector onSelect={handleCryptoSelect} />
  );
}
```

## Props

### `onSelect` (required)
- **Type**: `(crypto: Cryptocurrency) => void`
- **Description**: Callback function called when user selects a cryptocurrency
- **Parameters**: 
  - `crypto`: The selected cryptocurrency object containing symbol, name, currentPrice, and change24h

## Cryptocurrency Interface

```typescript
interface Cryptocurrency {
  symbol: string;        // e.g., "BTC"
  name: string;          // e.g., "Bitcoin"
  currentPrice: number;  // Current price in USD
  change24h: number;     // 24-hour price change percentage
}
```

## API Requirements

The component expects the following API endpoint to be available:

- **GET** `/api/cryptocurrencies`
- **Response**: 
  ```json
  {
    "cryptocurrencies": [
      {
        "symbol": "BTC",
        "name": "Bitcoin",
        "currentPrice": 45000,
        "change24h": 2.5
      }
    ]
  }
  ```

## Behavior

1. **On Mount**: Automatically fetches cryptocurrency list from API
2. **Loading State**: Displays loading spinner and disables input
3. **Error State**: Shows error message if API call fails
4. **Search**: Filters cryptocurrencies as user types (matches symbol or name)
5. **Selection**: Calls `onSelect` callback and updates placeholder to show selected crypto
6. **Dropdown**: Opens on input click or typing, closes on selection or click outside

## Styling

The component uses TailwindCSS classes and follows the existing design system:
- Blue color scheme for focus states
- Gray color scheme for text and borders
- Green/red colors for positive/negative price changes
- Responsive design with proper spacing

## Testing

Comprehensive unit tests are available in `__tests__/CryptoSelector.test.tsx` covering:
- Component rendering
- API data fetching
- Search/filter functionality
- Selection behavior
- Dropdown interactions
- Edge cases and error handling

## Requirements Validation

This component validates the following requirements:
- **Requirement 2.1**: Displays list of supported cryptocurrencies
- **Requirement 2.2**: Filters cryptocurrencies matching search input
- **Requirement 2.3**: Emits selection event when user chooses a crypto
- **Requirement 2.5**: Shows coin symbol and name for each cryptocurrency
