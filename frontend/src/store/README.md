# Redux Store Setup

This directory contains the Redux store configuration and slices for state management.

## Structure

```
store/
├── index.ts           # Store configuration
├── hooks.ts           # Typed Redux hooks
├── slices/
│   ├── authSlice.ts   # Authentication state management
│   └── __tests__/     # Unit tests for slices
└── README.md
```

## Usage

### Using Redux Hooks

Import the typed hooks instead of the default Redux hooks:

```typescript
import { useAppDispatch, useAppSelector } from './store/hooks';

function MyComponent() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  
  // ...
}
```

### Authentication Slice

The auth slice manages user authentication state including:
- User information (id, email, name, role)
- JWT token
- Loading states
- Error messages

#### Actions

**Async Thunks:**
- `register(credentials)` - Register a new user
- `login(credentials)` - Login with email and password
- `fetchCurrentUser()` - Fetch current user from token

**Sync Actions:**
- `logout()` - Clear user session and remove token
- `clearError()` - Clear error messages

#### Example Usage

```typescript
import { useAppDispatch, useAppSelector } from './store/hooks';
import { login, logout, register } from './store/slices/authSlice';

function LoginComponent() {
  const dispatch = useAppDispatch();
  const { user, loading, error } = useAppSelector((state) => state.auth);

  const handleLogin = async () => {
    await dispatch(login({ 
      email: 'user@example.com', 
      password: 'password123' 
    }));
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    // Your component JSX
  );
}
```

## Token Storage

JWT tokens are automatically stored in `localStorage` with the key `token`. The token is:
- Saved on successful login/register
- Removed on logout
- Removed on authentication errors (401)
- Automatically added to API requests via axios interceptor

## API Client

The API client (`src/api/client.ts`) provides:
- Axios instance configured with base URL
- JWT token interceptor for authenticated requests
- Automatic token expiration handling
- Organized API endpoints by feature:
  - `authAPI` - Authentication endpoints
  - `cryptoAPI` - Cryptocurrency data endpoints
  - `signalAPI` - Trading signal endpoints
  - `subscriptionAPI` - Subscription management endpoints
  - `alertAPI` - Alert management endpoints (Premium only)

## Environment Variables

Configure the API base URL in `.env`:

```
VITE_API_BASE_URL=http://localhost:3001
```

## Testing

Tests are located in `__tests__` directories and use Jest with React Testing Library.

Run tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```
