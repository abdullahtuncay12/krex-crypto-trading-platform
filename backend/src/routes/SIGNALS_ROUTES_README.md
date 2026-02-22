# Trading Signal Routes

This module provides REST API endpoints for retrieving trading signals and performance data.

## Endpoints

### GET /api/signals/performance

**Public endpoint** - Returns historical performance data for premium trading signals.

**Query Parameters:**
- `limit` (optional): Number of trades to return (default: 10, max: 50)

**Response:**
```json
{
  "trades": [
    {
      "id": "uuid",
      "signalId": "uuid",
      "cryptocurrency": "BTC",
      "entryPrice": 45000,
      "exitPrice": 48000,
      "profitPercent": 6.67,
      "entryDate": "2024-01-01T00:00:00.000Z",
      "exitDate": "2024-01-05T00:00:00.000Z",
      "signalType": "premium"
    }
  ]
}
```

**Error Responses:**
- `400 INVALID_LIMIT`: Limit parameter is invalid (not a positive number)
- `500 PERFORMANCE_FETCH_FAILED`: Database error occurred

**Requirements:** 6.1

---

### GET /api/signals/:symbol

**Protected endpoint** - Requires authentication. Returns trading signal for the specified cryptocurrency.

**Path Parameters:**
- `symbol`: Cryptocurrency symbol (e.g., 'BTC', 'ETH')

**Headers:**
- `Authorization: Bearer <token>` (required)

**Response for Normal Users:**
```json
{
  "signal": {
    "recommendation": "buy",
    "confidence": 75,
    "timestamp": "2024-01-01T00:00:00.000Z",
    "basicAnalysis": "Technical analysis indicates a BUY signal..."
  }
}
```

**Response for Premium Users:**
```json
{
  "signal": {
    "recommendation": "buy",
    "confidence": 85,
    "timestamp": "2024-01-01T00:00:00.000Z",
    "basicAnalysis": "Technical analysis indicates a BUY signal...",
    "stopLoss": 45000,
    "limitOrder": 52000,
    "riskLevel": "medium",
    "detailedAnalysis": "Advanced Technical Analysis: Current Price: 50000..."
  }
}
```

**Error Responses:**
- `400 INVALID_SYMBOL`: Symbol parameter is missing or empty
- `400 UNSUPPORTED_CRYPTOCURRENCY`: The cryptocurrency is not supported
- `401 AUTHENTICATION_REQUIRED`: No valid authentication token provided
- `503 SERVICE_UNAVAILABLE`: Exchange APIs are temporarily unavailable
- `500 SIGNAL_GENERATION_FAILED`: Error occurred during signal generation

**Requirements:** 3.1, 4.1

## Role-Based Access Control

The `/api/signals/:symbol` endpoint implements role-based access control:

- **Normal users** receive basic signals with:
  - Recommendation (buy/sell/hold)
  - Confidence level
  - Basic analysis text

- **Premium users** receive advanced signals with all basic fields plus:
  - Stop-loss price
  - Limit order price
  - Risk level assessment
  - Detailed technical analysis

## Implementation Details

### Route Order

**IMPORTANT:** The `/performance` route is defined BEFORE the `/:symbol` route to prevent Express from treating "performance" as a symbol parameter.

### Signal Generation

- Signals are generated using the `SignalGenerator` service
- Basic signals use algorithmic analysis (RSI, MACD, Bollinger Bands)
- Premium signals include risk management calculations
- All generated signals are stored in the database

### Performance Data

- Performance data is fetched from the `CompletedTradeRepository`
- Only premium signal results are displayed publicly
- Data is sorted by exit date (most recent first)
- Limit parameter prevents excessive data retrieval

## Testing

Unit tests are located in `__tests__/signals.test.ts` and cover:

- Basic signal generation for normal users
- Premium signal generation for premium users
- Authentication requirements
- Input validation (empty symbols, invalid limits)
- Error handling (unsupported cryptocurrencies, API failures)
- Symbol case conversion (lowercase to uppercase)
- Performance data retrieval with various limit values

## Dependencies

- `SignalGenerator`: Service for generating trading signals
- `CompletedTradeRepository`: Repository for accessing completed trade data
- `requireAuth`: Middleware for JWT authentication

## Error Handling

All endpoints follow a consistent error response format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

## Integration

The signals routes are mounted in `src/index.ts`:

```typescript
import signalRoutes from './routes/signals';
app.use('/api/signals', signalRoutes);
```
