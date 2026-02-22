# Authentication Components

This directory contains the authentication components for the Crypto Trading Signals application. These components handle user registration, login, and route protection.

## Components

### LoginForm

A form component for user authentication.

**Features:**
- Email and password validation
- Real-time error clearing as user types
- Loading states during authentication
- Server error display
- Automatic redirect after successful login
- Link to registration page

**Props:**
- `redirectTo?: string` - Path to redirect after successful login (default: '/')

**Usage:**
```tsx
import { LoginForm } from './components';

function LoginPage() {
  return <LoginForm redirectTo="/dashboard" />;
}
```

**Validation Rules:**
- Email: Required, must be valid email format
- Password: Required, minimum 8 characters

### RegisterForm

A form component for user registration.

**Features:**
- Comprehensive form validation
- Password strength requirements
- Password confirmation matching
- Real-time error clearing as user types
- Loading states during registration
- Server error display
- Automatic redirect after successful registration
- Link to login page

**Props:**
- `redirectTo?: string` - Path to redirect after successful registration (default: '/')

**Usage:**
```tsx
import { RegisterForm } from './components';

function RegisterPage() {
  return <RegisterForm redirectTo="/dashboard" />;
}
```

**Validation Rules:**
- Name: Required, minimum 2 characters
- Email: Required, must be valid email format
- Password: Required, minimum 8 characters, must contain uppercase, lowercase, and number
- Confirm Password: Required, must match password

### PrivateRoute

A wrapper component for protecting routes that require authentication.

**Features:**
- Automatic authentication check
- Loading state while fetching user data
- Redirect to login for unauthenticated users
- Premium membership check (optional)
- Premium required message for non-premium users
- Preserves intended destination for post-login redirect

**Props:**
- `children: React.ReactNode` - The component(s) to render if authenticated
- `requirePremium?: boolean` - If true, requires premium role (default: false)

**Usage:**

Basic authentication:
```tsx
import { PrivateRoute } from './components';

<Route path="/dashboard" element={
  <PrivateRoute>
    <Dashboard />
  </PrivateRoute>
} />
```

Premium-only route:
```tsx
<Route path="/premium-signals" element={
  <PrivateRoute requirePremium>
    <PremiumSignals />
  </PrivateRoute>
} />
```

## Integration with React Router

Here's a complete example of how to integrate these components with React Router:

```tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { LoginPage, RegisterPage } from './pages';
import { PrivateRoute } from './components';
import HomePage from './pages/HomePage';
import PremiumFeature from './pages/PremiumFeature';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected routes */}
          <Route path="/" element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          } />
          
          {/* Premium-only routes */}
          <Route path="/premium" element={
            <PrivateRoute requirePremium>
              <PremiumFeature />
            </PrivateRoute>
          } />
          
          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
```

## Redux Integration

These components use Redux for state management through the `authSlice`. The auth slice provides:

**State:**
- `user: User | null` - Current authenticated user
- `token: string | null` - JWT authentication token
- `loading: boolean` - Loading state for async operations
- `error: string | null` - Error message from failed operations

**Actions:**
- `login({ email, password })` - Authenticate user
- `register({ email, password, name })` - Create new user account
- `logout()` - Clear user session
- `fetchCurrentUser()` - Fetch current user data
- `clearError()` - Clear error messages

**Example:**
```tsx
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { login, logout } from '../store/slices/authSlice';

function MyComponent() {
  const dispatch = useAppDispatch();
  const { user, loading, error } = useAppSelector((state) => state.auth);
  
  const handleLogin = async () => {
    await dispatch(login({ email: 'user@example.com', password: 'password' }));
  };
  
  const handleLogout = () => {
    dispatch(logout());
  };
  
  return (
    <div>
      {user ? (
        <button onClick={handleLogout}>Logout</button>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

## Form Validation

Both LoginForm and RegisterForm implement client-side validation:

1. **Real-time validation**: Errors clear as user types
2. **Submit validation**: Full validation on form submission
3. **Visual feedback**: Red borders and error messages for invalid fields
4. **Disabled state**: Form inputs disabled during submission

## Error Handling

The components handle various error scenarios:

1. **Validation errors**: Displayed inline below each field
2. **Server errors**: Displayed in a banner at the top of the form
3. **Network errors**: Handled by the Redux slice and displayed as server errors
4. **Token expiration**: Handled by API client interceptor, redirects to login

## Testing

All components include comprehensive unit tests:

- `LoginForm.test.tsx` - Tests for login form validation and behavior
- `RegisterForm.test.tsx` - Tests for registration form validation and behavior
- `PrivateRoute.test.tsx` - Tests for route protection and premium checks

Run tests with:
```bash
npm test
```

## Styling

Components use TailwindCSS for styling with:
- Responsive design
- Consistent color scheme (blue primary, red errors)
- Loading states with disabled styling
- Hover effects on interactive elements
- Accessible form labels and inputs

## Requirements Validation

These components satisfy the following requirements from the spec:

- **Requirement 1.1**: User registration with default normal role
- **Requirement 1.4**: Authentication required for protected features
- Form validation ensures data quality
- Error handling provides good user experience
- Responsive design works on all devices

## Future Enhancements

Potential improvements:
- Password reset functionality
- Email verification
- Social authentication (Google, GitHub)
- Remember me checkbox
- Two-factor authentication
- Password strength meter
- Captcha for bot prevention
