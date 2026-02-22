# Authentication Routes

This module provides REST API endpoints for user authentication including registration, login, and profile retrieval.

## Requirements

- **Requirement 1.1**: User registration with default 'normal' role
- **Requirement 1.4**: JWT-based authentication for protected endpoints

## Endpoints

### POST /api/auth/register

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Validation:**
- `email`: Required, must be valid email format
- `password`: Required, minimum 8 characters
- `name`: Required, non-empty string

**Success Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "normal",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt_token_string"
}
```

**Error Responses:**
- `400 VALIDATION_ERROR`: Invalid request data
- `409 EMAIL_ALREADY_EXISTS`: Email already registered
- `500 REGISTRATION_FAILED`: Server error during registration

### POST /api/auth/login

Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Validation:**
- `email`: Required, must be valid email format
- `password`: Required

**Success Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "normal",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt_token_string"
}
```

**Error Responses:**
- `400 VALIDATION_ERROR`: Invalid request data
- `401 INVALID_CREDENTIALS`: Invalid email or password
- `500 LOGIN_FAILED`: Server error during login

### GET /api/auth/me

Get current authenticated user information.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "normal",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `401 AUTHENTICATION_REQUIRED`: Missing or invalid authorization header
- `401 INVALID_TOKEN`: Invalid JWT token
- `401 TOKEN_EXPIRED`: JWT token has expired

## Middleware

### Validation Middleware

Located in `backend/src/middleware/validation.ts`

- `validateRegister`: Validates registration request body
- `validateLogin`: Validates login request body

### Authentication Middleware

Located in `backend/src/middleware/auth.ts`

- `requireAuth`: Verifies JWT token and attaches user to request

## Integration

The authentication routes are mounted in `backend/src/index.ts`:

```typescript
import authRoutes from './routes/auth';
app.use('/api/auth', authRoutes);
```

## Testing

Unit tests are located in:
- `backend/src/routes/__tests__/auth.test.ts`
- `backend/src/middleware/__tests__/validation.test.ts`

Run tests with:
```bash
npm test
```

## Security Features

1. **Password Hashing**: Passwords are hashed using bcrypt with 10 salt rounds
2. **JWT Tokens**: Secure token-based authentication
3. **Input Validation**: All inputs are validated before processing
4. **Error Messages**: Generic error messages to prevent information disclosure
5. **No Password Exposure**: Password hashes are never returned in responses
