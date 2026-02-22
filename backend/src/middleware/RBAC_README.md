# RBAC Middleware Documentation

## Overview

The RBAC (Role-Based Access Control) middleware provides authentication and authorization for protected routes in the cryptocurrency trading signals platform. It implements JWT token verification and role-based access control to enforce user permissions.

**Requirements:** 1.4, 1.5, 3.4

## Middleware Functions

### `requireAuth`

Validates JWT tokens and attaches the authenticated user to the request object.

**Behavior:**
- Extracts JWT token from `Authorization: Bearer <token>` header
- Verifies token signature and expiration
- Fetches user from database
- Attaches user object to `req.user`
- Returns **401 Unauthorized** if:
  - Authorization header is missing
  - Token format is invalid
  - Token is expired
  - Token signature is invalid
  - User not found in database

**Usage:**
```typescript
import { requireAuth } from '../middleware/auth';

router.get('/protected', requireAuth, (req, res) => {
  // req.user is available here
  res.json({ user: req.user });
});
```

### `requireRole(role)`

Enforces role-based access control for specific user roles.

**Parameters:**
- `role`: `'normal'` | `'premium'` - The required role to access the route

**Behavior:**
- Checks if `req.user` exists (must be used after `requireAuth`)
- For `'premium'` role: Only allows users with `role === 'premium'`
- For `'normal'` role: Allows both `'normal'` and `'premium'` users
- Returns **401 Unauthorized** if user is not authenticated
- Returns **403 Forbidden** if user lacks required role

**Usage:**
```typescript
import { requireAuth, requireRole } from '../middleware/auth';

// Premium-only endpoint
router.get('/premium-signals', 
  requireAuth, 
  requireRole('premium'), 
  (req, res) => {
    // Only premium users can access
    res.json({ signals: premiumSignals });
  }
);

// Normal user endpoint (both normal and premium can access)
router.get('/basic-signals', 
  requireAuth, 
  requireRole('normal'), 
  (req, res) => {
    // All authenticated users can access
    res.json({ signals: basicSignals });
  }
);
```

## Request User Object

After successful authentication, the user object is attached to `req.user`:

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'normal' | 'premium';
  createdAt: Date;
  updatedAt: Date;
}
```

**Note:** The `passwordHash` field is excluded for security.

## Error Responses

All error responses follow this format:

```typescript
{
  error: {
    code: string;
    message: string;
    timestamp: string; // ISO 8601
  }
}
```

### 401 Unauthorized Errors

**Missing Authorization Header:**
```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "Authentication required",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

**Expired Token:**
```json
{
  "error": {
    "code": "TOKEN_EXPIRED",
    "message": "Token expired, please login again",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

**Invalid Token:**
```json
{
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Invalid token",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### 403 Forbidden Errors

**Insufficient Permissions:**
```json
{
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "Premium membership required",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

## Common Patterns

### Public Route (No Authentication)
```typescript
router.get('/public', (req, res) => {
  res.json({ data: 'public data' });
});
```

### Protected Route (Any Authenticated User)
```typescript
router.get('/protected', requireAuth, (req, res) => {
  res.json({ user: req.user });
});
```

### Premium-Only Route
```typescript
router.get('/premium', requireAuth, requireRole('premium'), (req, res) => {
  res.json({ premiumData: 'premium content' });
});
```

### Role-Based Response
```typescript
router.get('/signals/:symbol', requireAuth, async (req, res) => {
  const { symbol } = req.params;
  
  if (req.user!.role === 'premium') {
    const signal = await signalGenerator.generatePremiumSignal(symbol);
    res.json({ signal });
  } else {
    const signal = await signalGenerator.generateBasicSignal(symbol);
    res.json({ signal });
  }
});
```

## Testing

The middleware includes comprehensive unit tests covering:

### `requireAuth` Tests
- ✓ Authenticates user with valid token
- ✓ Returns 401 when Authorization header is missing
- ✓ Returns 401 when Authorization header format is invalid
- ✓ Returns 401 when token is expired
- ✓ Returns 401 when token is invalid
- ✓ Returns 401 when user not found

### `requireRole` Tests
- ✓ Allows premium users to access premium routes
- ✓ Returns 403 when normal user tries to access premium route
- ✓ Returns 401 when user is not authenticated (premium role)
- ✓ Allows normal users to access normal routes
- ✓ Allows premium users to access normal routes
- ✓ Returns 401 when user is not authenticated (normal role)

Run tests with:
```bash
npm test -- auth.test.ts
```

## Security Considerations

1. **Always use HTTPS** in production to protect JWT tokens in transit
2. **Token expiration** is configured in `config/index.ts` (default: 24 hours)
3. **Password hashing** uses bcrypt with 10 salt rounds
4. **Token verification** checks signature and expiration on every request
5. **User lookup** ensures token references a valid, existing user
6. **No password exposure** - passwordHash is never included in responses

## Integration Example

See `backend/src/routes/example.ts` for a complete example of RBAC middleware usage.
