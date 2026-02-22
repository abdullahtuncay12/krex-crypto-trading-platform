# Error Handling and Validation Middleware

This document describes the global error handling and request validation middleware implemented for the Crypto Trading Signals API.

## Overview

The middleware provides:
- **Global error handler**: Catches all errors and returns consistent error responses
- **Request validation**: Validates request bodies, parameters, and query strings
- **Centralized error logging**: Logs errors with request context for debugging
- **Production-safe error messages**: Hides sensitive details in production

## Error Handler Middleware

### Location
`backend/src/middleware/errorHandler.ts`

### Features

1. **Consistent Error Format**
   All errors return a standardized JSON response:
   ```json
   {
     "error": {
       "code": "ERROR_CODE",
       "message": "Human-readable error message",
       "details": {},
       "timestamp": "2024-01-01T00:00:00.000Z",
       "requestId": "req_123456"
     }
   }
   ```

2. **Error Types Handled**
   - Custom `AppError` instances with status codes
   - Stripe payment errors (402)
   - JWT authentication errors (401)
   - PostgreSQL constraint violations (409, 400)
   - Database connection errors (503)
   - Validation errors (400)
   - Generic errors (500)

3. **Request Context Logging**
   Logs include:
   - Request ID (from header or auto-generated)
   - HTTP method and path
   - User ID (if authenticated)
   - Error name, message, and code
   - Full stack trace (development only)

4. **Production Safety**
   - Hides sensitive error details in production
   - Returns generic "An unexpected error occurred" message
   - Logs full details server-side for debugging

### Usage

#### In Express App (index.ts)
```typescript
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// ... routes ...

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Global error handler - must be last
app.use(errorHandler);
```

#### Creating Custom Errors
```typescript
import { AppError } from './middleware/errorHandler';

// Throw custom error with status code
throw new AppError(400, 'INVALID_INPUT', 'Invalid cryptocurrency symbol');

// With additional details
throw new AppError(400, 'VALIDATION_ERROR', 'Invalid data', {
  fields: ['email', 'password']
});
```

#### In Route Handlers
```typescript
router.get('/example', async (req, res, next) => {
  try {
    // Your code here
  } catch (error) {
    // Pass error to global handler
    next(error);
  }
});
```

### HTTP Status Codes

| Status | Code | Description |
|--------|------|-------------|
| 400 | VALIDATION_ERROR | Invalid request data |
| 400 | INVALID_REFERENCE | Referenced resource doesn't exist |
| 401 | AUTHENTICATION_REQUIRED | Missing or invalid token |
| 401 | TOKEN_EXPIRED | JWT token expired |
| 402 | PAYMENT_ERROR | Payment processing failed |
| 403 | INSUFFICIENT_PERMISSIONS | User lacks required permissions |
| 404 | NOT_FOUND | Route or resource not found |
| 409 | DUPLICATE_ENTRY | Resource already exists |
| 500 | INTERNAL_SERVER_ERROR | Unexpected server error |
| 503 | SERVICE_UNAVAILABLE | Service temporarily unavailable |

## Validation Middleware

### Location
`backend/src/middleware/validation.ts`

### Validators

#### 1. Authentication Validators

**validateRegister**
- Validates email format
- Ensures password is at least 8 characters
- Validates name is non-empty
- Returns field-specific error messages

**validateLogin**
- Validates email format
- Ensures password is provided

#### 2. Cryptocurrency Validators

**validateCryptoSymbol**
- Validates symbol against supported list
- Normalizes symbol to uppercase
- Returns list of supported symbols on error

Supported symbols: BTC, ETH, BNB, SOL, ADA, XRP, DOT, DOGE

**validateDateRange**
- Validates `days` query parameter
- Ensures days is between 1 and 365
- Optional parameter (defaults to 30)

#### 3. Subscription Validators

**validateSubscriptionUpgrade**
- Validates `planId` is non-empty string
- Validates `paymentMethodId` is non-empty string
- Returns field-specific errors

#### 4. Alert Validators

**validateAlertPreferences**
- Validates `priceMovementThreshold` is number between 0-100
- Validates `enablePumpAlerts` is boolean
- Validates `cryptocurrencies` is array of supported symbols
- Returns detailed error for invalid symbols

### Usage in Routes

```typescript
import { 
  validateCryptoSymbol, 
  validateDateRange,
  validateSubscriptionUpgrade,
  validateAlertPreferences 
} from '../middleware/validation';

// Validate cryptocurrency symbol
router.get('/:symbol', validateCryptoSymbol, async (req, res) => {
  // req.params.symbol is now validated and normalized
});

// Validate date range
router.get('/:symbol/history', validateCryptoSymbol, validateDateRange, async (req, res) => {
  // Both symbol and days are validated
});

// Validate subscription upgrade
router.post('/upgrade', requireAuth, validateSubscriptionUpgrade, async (req, res) => {
  // planId and paymentMethodId are validated
});

// Validate alert preferences
router.post('/preferences', requireAuth, requireRole('premium'), validateAlertPreferences, async (req, res) => {
  // All alert preference fields are validated
});
```

### Validation Error Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      },
      {
        "field": "password",
        "message": "Password must be at least 8 characters"
      }
    ],
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

## Testing

### Unit Tests
- `backend/src/middleware/__tests__/errorHandler.test.ts`
- `backend/src/middleware/__tests__/validation.test.ts`

### Running Tests
```bash
cd backend
npm test middleware/__tests__/errorHandler.test.ts
npm test middleware/__tests__/validation.test.ts
```

### Test Coverage
- All error types (AppError, Stripe, JWT, database)
- All validators with valid and invalid inputs
- Edge cases (boundary values, empty strings, null values)
- Production vs development behavior

## Best Practices

1. **Always use validation middleware** before route handlers
2. **Pass errors to next()** instead of handling in route
3. **Use AppError** for custom application errors
4. **Include request context** in error logs
5. **Never expose sensitive data** in error messages
6. **Validate early** to fail fast and provide clear feedback
7. **Use consistent error codes** across the application

## Requirements Satisfied

- **Task 17.1**: Global error handler middleware
  - ✅ Catches all errors
  - ✅ Returns consistent error format
  - ✅ Logs errors with request context
  - ✅ Returns appropriate HTTP status codes
  - ✅ Hides sensitive details in production

- **Task 17.2**: Request validation middleware
  - ✅ Validates request bodies for POST/PUT endpoints
  - ✅ Validates cryptocurrency symbols against supported list
  - ✅ Validates date ranges for historical data
  - ✅ Returns 400 Bad Request with field-specific errors
