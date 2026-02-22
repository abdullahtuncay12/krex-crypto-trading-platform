# Cryptocurrency Routes

## Overview

The cryptocurrency routes provide public endpoints for accessing cryptocurrency market data, including current prices, 24-hour changes, trading volumes, and historical price data. These endpoints use the ExchangeAggregator service to fetch data from multiple exchanges (Binance, Coinbase, Bybit) and provide aggregated results.

## Requirements

- **2.1**: Display list of supported cryptocurrencies
- **2.2**: Filter cryptocurrencies matching search input
- **2.3**: Display trading signals for selected cryptocurrency
- **2.4**: Support at least BTC and ETH cryptocurrencies
- **2.5**: Show coin symbol and name
- **7.1**: Display historical price data
- **7.2**: Show at least 30 days of price history

## Endpoints

### GET /api/cryptocurrencies

List all supported cryptocurrencies with current market data.

**Response:**
```json
{
  "cryptocurrencies": [
    {
      "symbol": "BTC",
      "name": "Bitcoin",
      "currentPrice": 50000,
      "change24h": 2.5,
      "volume24h": 1000000000
    },
    {
      "symbol": "ETH",
      "name": "Ethereum",
      "currentPrice": 3000,
      "change24h": -1.2,
      "volume24h": 500000000
    }
  ]
}
```

**Status Codes:**
- `200 OK`: Successfully retrieved cryptocurrency list
- `500 Internal Server Error`: Failed to fetch data

**Notes:**
- Fetches data from multiple exchanges in parallel
- Handles partial failures gracefully (returns null values for failed cryptos)
- Includes at least BTC and ETH (Requirement 2.4)
- Each cryptocurrency includes symbol and name (Requirement 2.5)

---

### GET /api/cryptocurrencies/:symbol

Get detailed data for a specific cryptocurrency.

**Parameters:**
- `symbol` (path): Cryptocurrency symbol (e.g., 'BTC', 'ETH') - case insensitive

**Response:**
```json
{
  "cryptocurrency": {
    "symbol": "BTC",
    "name": "Bitcoin",
    "currentPrice": 50000,
    "change24h": 2.5,
    "volume24h": 1000000000
  }
}
```

**Status Codes:**
- `200 OK`: Successfully retrieved cryptocurrency data
- `400 Bad Request`: Unsupported cryptocurrency symbol
- `503 Service Unavailable`: All exchanges unavailable
- `500 Internal Server Error`: Failed to fetch data

**Error Response (400):**
```json
{
  "error": {
    "code": "UNSUPPORTED_CRYPTOCURRENCY",
    "message": "Unsupported cryptocurrency: XYZ",
    "details": {
      "supportedSymbols": ["BTC", "ETH", "BNB", "SOL", "ADA"]
    },
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Response (503):**
```json
{
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "Market data temporarily unavailable, please try again",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

**Notes:**
- Symbol parameter is case-insensitive
- Calculates 24h change based on historical data
- Uses ExchangeAggregator with 30-second cache

---

### GET /api/cryptocurrencies/:symbol/history

Get historical price data for a cryptocurrency.

**Parameters:**
- `symbol` (path): Cryptocurrency symbol (e.g., 'BTC', 'ETH') - case insensitive

**Query Parameters:**
- `days` (optional): Number of days of historical data (default: 30, min: 1, max: 365)

**Response:**
```json
{
  "data": [
    {
      "timestamp": "2024-01-01T00:00:00.000Z",
      "price": 50000,
      "volume": 1000000000
    },
    {
      "timestamp": "2024-01-02T00:00:00.000Z",
      "price": 51000,
      "volume": 1100000000
    }
  ]
}
```

**Status Codes:**
- `200 OK`: Successfully retrieved historical data
- `400 Bad Request`: Invalid symbol or date range
- `503 Service Unavailable`: All exchanges unavailable
- `500 Internal Server Error`: Failed to fetch data

**Error Response (400 - Invalid Symbol):**
```json
{
  "error": {
    "code": "UNSUPPORTED_CRYPTOCURRENCY",
    "message": "Unsupported cryptocurrency: XYZ",
    "details": {
      "supportedSymbols": ["BTC", "ETH", "BNB", "SOL", "ADA"]
    },
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Response (400 - Invalid Date Range):**
```json
{
  "error": {
    "code": "INVALID_DATE_RANGE",
    "message": "Invalid date range",
    "details": {
      "validRange": "Days must be between 1 and 365"
    },
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

**Notes:**
- Default returns 30 days of data (Requirement 7.2)
- Data is aggregated from multiple exchanges
- Uses ExchangeAggregator with 30-second cache
- Returns data sorted by timestamp (oldest to newest)

---

## Supported Cryptocurrencies

The system currently supports the following cryptocurrencies:

| Symbol | Name          |
|--------|---------------|
| BTC    | Bitcoin       |
| ETH    | Ethereum      |
| BNB    | Binance Coin  |
| SOL    | Solana        |
| ADA    | Cardano       |

**Note:** BTC and ETH are required by Requirement 2.4.

---

## Implementation Details

### ExchangeAggregator Integration

All endpoints use the `ExchangeAggregator` service to:
- Fetch data from multiple exchanges (Binance, Coinbase, Bybit)
- Aggregate results by averaging prices and volumes
- Handle partial failures gracefully
- Cache results in Redis with 30-second TTL
- Implement retry logic with exponential backoff

### Error Handling

The routes implement comprehensive error handling:
- **Validation errors**: Return 400 with specific error details
- **Service unavailable**: Return 503 when all exchanges are down
- **Partial failures**: Continue with available data, log warnings
- **Unexpected errors**: Return 500 with generic error message

### Caching Strategy

- All data is cached by ExchangeAggregator for 30 seconds
- Cache keys include symbol and parameters (e.g., `price:BTC`, `history:BTC:30`)
- Cache failures are logged but don't block requests
- Stale cache data is used as fallback when exchanges are unavailable

---

## Testing

Unit tests are located in `__tests__/cryptocurrencies.test.ts` and cover:

1. **GET /api/cryptocurrencies**
   - Returns list with BTC and ETH
   - Each crypto has symbol and name
   - Handles partial failures gracefully

2. **GET /api/cryptocurrencies/:symbol**
   - Returns data for valid symbols
   - Handles lowercase symbols
   - Returns 400 for unsupported symbols
   - Returns 503 when exchanges unavailable
   - Calculates 24h change correctly

3. **GET /api/cryptocurrencies/:symbol/history**
   - Returns at least 30 days by default
   - Accepts custom days parameter
   - Returns 400 for invalid symbols
   - Returns 400 for invalid date ranges
   - Returns 503 when exchanges unavailable
   - Data includes timestamp, price, and volume

---

## Usage Examples

### Fetch all cryptocurrencies
```bash
curl http://localhost:3000/api/cryptocurrencies
```

### Get Bitcoin data
```bash
curl http://localhost:3000/api/cryptocurrencies/BTC
```

### Get Ethereum historical data (7 days)
```bash
curl http://localhost:3000/api/cryptocurrencies/ETH/history?days=7
```

### Get default 30 days of historical data
```bash
curl http://localhost:3000/api/cryptocurrencies/BTC/history
```

---

## Future Enhancements

Potential improvements for future iterations:

1. **Search/Filter Endpoint**: Add dedicated endpoint for cryptocurrency search (Requirement 2.2)
2. **More Cryptocurrencies**: Expand supported cryptocurrency list
3. **Real-time Updates**: Implement WebSocket for real-time price updates
4. **Advanced Filtering**: Add query parameters for filtering by price, volume, change
5. **Pagination**: Add pagination for large historical datasets
6. **Rate Limiting**: Implement rate limiting to prevent abuse
7. **Response Compression**: Add gzip compression for large responses
