# Alert Routes

## Overview

The Alert Routes module provides REST API endpoints for managing alerts and alert preferences for premium users. All endpoints require authentication and premium role access.

## Requirements

- **10.1**: Alert generation on trading opportunities
- **10.3**: Alert preferences persistence
- **10.4**: Alert content completeness

## Endpoints

### GET /api/alerts

Get all alerts for the authenticated premium user.

**Authentication**: Required (Bearer token)  
**Authorization**: Premium role required

**Request Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response** (200 OK):
```json
{
  "alerts": [
    {
      "id": "alert-123",
      "userId": "user-456",
      "cryptocurrency": "BTC",
      "alertType": "price_movement",
      "message": "BTC price increased by 5%",
      "read": false,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User does not have premium role
- `500 Internal Server Error`: Database error

---

### POST /api/alerts/preferences

Save or update alert preferences for the authenticated premium user.

**Authentication**: Required (Bearer token)  
**Authorization**: Premium role required

**Request Headers**:
```
Authorization: Bearer <jwt_token>
```

**Request Body**:
```json
{
  "priceMovementThreshold": 5,
  "enablePumpAlerts": true,
  "cryptocurrencies": ["BTC", "ETH", "ADA"]
}
```

**Request Body Fields**:
- `priceMovementThreshold` (number, required): Percentage threshold for price movement alerts (0-100)
- `enablePumpAlerts` (boolean, required): Whether to enable pump detection alerts
- `cryptocurrencies` (string[], required): Array of cryptocurrency symbols to monitor

**Response** (200 OK):
```json
{
  "preferences": {
    "id": "pref-789",
    "userId": "user-456",
    "priceMovementThreshold": 5,
    "enablePumpAlerts": true,
    "cryptocurrencies": ["BTC", "ETH", "ADA"],
    "updatedAt": "2024-01-15T10:35:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Missing required fields or invalid data types
  - `MISSING_REQUIRED_FIELDS`: One or more required fields are missing
  - `INVALID_FIELD_TYPE`: Field has incorrect data type
  - `INVALID_THRESHOLD`: Threshold must be between 0 and 100
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User does not have premium role
- `500 Internal Server Error`: Database error

---

### GET /api/alerts/preferences

Get alert preferences for the authenticated premium user.

**Authentication**: Required (Bearer token)  
**Authorization**: Premium role required

**Request Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response** (200 OK):
```json
{
  "preferences": {
    "id": "pref-789",
    "userId": "user-456",
    "priceMovementThreshold": 5,
    "enablePumpAlerts": true,
    "cryptocurrencies": ["BTC", "ETH", "ADA"],
    "updatedAt": "2024-01-15T10:35:00Z"
  }
}
```

**Response** (200 OK - No preferences set):
```json
{
  "preferences": null
}
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User does not have premium role
- `500 Internal Server Error`: Database error

## Middleware

All endpoints use the following middleware chain:

1. **requireAuth**: Validates JWT token and attaches user to request
2. **requireRole('premium')**: Ensures user has premium role

## Data Models

### Alert

```typescript
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

### AlertPreferences

```typescript
interface AlertPreferences {
  id: string;
  userId: string;
  priceMovementThreshold: number;
  enablePumpAlerts: boolean;
  cryptocurrencies: string[];
  updatedAt: Date;
}
```

## Validation Rules

### POST /api/alerts/preferences

- `priceMovementThreshold`:
  - Must be a number
  - Must be between 0 and 100 (inclusive)
- `enablePumpAlerts`:
  - Must be a boolean
- `cryptocurrencies`:
  - Must be an array
  - Can be empty array

## Error Response Format

All error responses follow this structure:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "timestamp": "2024-01-15T10:40:00Z"
  }
}
```

## Usage Examples

### Get User Alerts

```bash
curl -X GET http://localhost:3000/api/alerts \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Save Alert Preferences

```bash
curl -X POST http://localhost:3000/api/alerts/preferences \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "priceMovementThreshold": 10,
    "enablePumpAlerts": true,
    "cryptocurrencies": ["BTC", "ETH"]
  }'
```

### Get Alert Preferences

```bash
curl -X GET http://localhost:3000/api/alerts/preferences \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Testing

Unit tests are located in `__tests__/alerts.test.ts` and cover:

- Successful retrieval of alerts
- Successful save/update of preferences
- Successful retrieval of preferences
- Missing required fields validation
- Invalid data type validation
- Threshold range validation
- Database error handling
- Empty results handling

Run tests with:
```bash
npm test -- alerts.test.ts
```

## Dependencies

- **express**: Web framework
- **AlertRepository**: Data access layer for alerts
- **AlertPreferencesRepository**: Data access layer for alert preferences
- **requireAuth**: Authentication middleware
- **requireRole**: Role-based authorization middleware

## Integration

The alert routes are mounted in the main Express application:

```typescript
import alertRoutes from './routes/alerts';
app.use('/api/alerts', alertRoutes);
```

## Security Considerations

1. All endpoints require valid JWT authentication
2. All endpoints require premium role authorization
3. Users can only access their own alerts and preferences
4. Input validation prevents invalid data from being stored
5. Database errors are logged but not exposed to clients

## Future Enhancements

- Pagination for alert list
- Mark alerts as read endpoint
- Delete alerts endpoint
- Filter alerts by type or cryptocurrency
- Real-time alert delivery via WebSocket
