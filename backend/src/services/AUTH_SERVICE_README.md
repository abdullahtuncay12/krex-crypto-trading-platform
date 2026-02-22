# Authentication Service

## Overview

The Authentication Service handles user registration, login, and JWT token management for the cryptocurrency trading signals platform. It implements secure password hashing with bcrypt and JWT-based authentication.

## Requirements

- **Requirement 1.1**: Default new users to 'normal' role on registration
- **Requirement 1.4**: Authenticate users before granting access to features

## Features

### User Registration
- Creates new user accounts with email, password, and name
- Automatically hashes passwords using bcrypt (10 salt rounds)
- Assigns 'normal' role by default (Requirement 1.1)
- Validates email uniqueness
- Returns user object (without password hash) and JWT token

### User Login
- Authenticates users with email and password
- Verifies password using bcrypt comparison
- Generates JWT token on successful authentication
- Returns user object (without password hash) and JWT token

### Token Management
- Generates JWT tokens with user payload (userId, email, role)
- Configurable token expiration (default: 7 days)
- Verifies and decodes JWT tokens
- Handles token expiration errors

### Token Verification Middleware
- Extracts JWT token from Authorization header (Bearer scheme)
- Verifies token signature and expiration
- Loads user from database and attaches to request
- Returns appropriate error responses (401 for authentication failures)

## API

### AuthService

```typescript
class AuthService {
  // Register new user
  async register(input: RegisterInput): Promise<AuthResponse>
  
  // Login existing user
  async login(input: LoginInput): Promise<AuthResponse>
  
  // Generate JWT token
  generateToken(user: User): string
  
  // Verify JWT token
  verifyToken(token: string): TokenPayload
  
  // Get user by ID (for middleware)
  async getUserById(userId: string): Promise<Omit<User, 'passwordHash'> | null>
}
```

### Middleware

```typescript
// Require authentication for protected routes
export const requireAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>
```

## Usage

### Registration Example

```typescript
import { authService } from './services/AuthService';

const result = await authService.register({
  email: 'user@example.com',
  password: 'SecurePassword123!',
  name: 'John Doe',
});

console.log(result.user.role); // 'normal' (Requirement 1.1)
console.log(result.token); // JWT token
```

### Login Example

```typescript
const result = await authService.login({
  email: 'user@example.com',
  password: 'SecurePassword123!',
});

console.log(result.token); // JWT token
```

### Protected Route Example

```typescript
import { requireAuth } from './middleware/auth';

app.get('/api/protected', requireAuth, (req, res) => {
  // req.user is available here
  res.json({ user: req.user });
});
```

## Error Handling

### Registration Errors
- **Email already registered**: Thrown when email exists in database
- Returns: `Error('Email already registered')`

### Login Errors
- **Invalid credentials**: Thrown when email not found or password incorrect
- Returns: `Error('Invalid email or password')`
- Note: Same error message for both cases (security best practice)

### Token Errors
- **Token expired**: Thrown when JWT token has expired
- Returns: `Error('Token expired, please login again')`
- HTTP Status: 401

- **Invalid token**: Thrown when JWT signature is invalid
- Returns: `Error('Invalid token')`
- HTTP Status: 401

- **Missing token**: Returned when Authorization header is missing
- HTTP Status: 401
- Response: `{ error: { code: 'AUTHENTICATION_REQUIRED', message: 'Authentication required' } }`

## Security Features

1. **Password Hashing**: Uses bcrypt with 10 salt rounds
2. **No Plain Text Passwords**: Passwords never stored or logged in plain text
3. **JWT Expiration**: Tokens expire after configured duration (default: 7 days)
4. **Secure Error Messages**: Login errors don't reveal whether email exists
5. **Password Hash Exclusion**: User objects returned without password hash

## Testing

### Unit Tests
- `AuthService.test.ts`: Tests with mocked dependencies
- Covers registration, login, token generation, and verification
- Tests error cases (duplicate email, invalid credentials, expired tokens)

### Integration Tests
- `AuthService.integration.test.ts`: Tests with real bcrypt and JWT
- Tests complete registration → login flow
- Verifies password hashing works correctly
- Tests role-based token generation

### Middleware Tests
- `auth.test.ts`: Tests token verification middleware
- Tests valid token authentication
- Tests missing/invalid/expired token handling
- Tests user attachment to request

## Configuration

Configuration is managed through environment variables:

```env
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
```

See `backend/src/config/index.ts` for full configuration options.

## Dependencies

- `bcrypt`: Password hashing
- `jsonwebtoken`: JWT token generation and verification
- `express`: Web framework (for middleware types)

## Future Enhancements

- Password reset functionality
- Email verification
- Two-factor authentication
- Refresh token support
- Rate limiting for login attempts
