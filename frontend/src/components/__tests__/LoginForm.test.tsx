import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { LoginForm } from '../LoginForm';
import authReducer from '../../store/slices/authSlice';
import '@testing-library/jest-dom';

// Mock the navigate function
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock the API client
jest.mock('../../api/client', () => ({
  authAPI: {
    login: jest.fn(),
    register: jest.fn(),
    getCurrentUser: jest.fn(),
  },
}));

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: initialState,
  });
};

const renderWithProviders = (component: React.ReactElement, store = createMockStore()) => {
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('LoginForm', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    localStorage.clear();
  });

  it('renders login form with all fields', () => {
    renderWithProviders(<LoginForm />);
    
    expect(screen.getByText('Login to Your Account')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
  });

  it('validates email field is required', async () => {
    renderWithProviders(<LoginForm />);
    
    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    renderWithProviders(<LoginForm />);
    
    const emailInput = screen.getByLabelText('Email');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  it('validates password field is required', async () => {
    renderWithProviders(<LoginForm />);
    
    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  it('validates password minimum length', async () => {
    renderWithProviders(<LoginForm />);
    
    const passwordInput = screen.getByLabelText('Password');
    fireEvent.change(passwordInput, { target: { value: 'short' } });
    
    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    });
  });

  it('clears validation errors when user types', async () => {
    renderWithProviders(<LoginForm />);
    
    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });
    
    const emailInput = screen.getByLabelText('Email');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    await waitFor(() => {
      expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
    });
  });

  it('displays server error message', () => {
    const storeWithError = createMockStore({
      auth: {
        user: null,
        token: null,
        loading: false,
        error: 'Invalid email or password',
      },
    });
    
    renderWithProviders(<LoginForm />, storeWithError);
    
    expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
  });

  it('disables form inputs while loading', () => {
    const storeWithLoading = createMockStore({
      auth: {
        user: null,
        token: null,
        loading: true,
        error: null,
      },
    });
    
    renderWithProviders(<LoginForm />, storeWithLoading);
    
    expect(screen.getByLabelText('Email')).toBeDisabled();
    expect(screen.getByLabelText('Password')).toBeDisabled();
    expect(screen.getByRole('button', { name: /logging in/i })).toBeDisabled();
  });

  it('redirects to home when user is already logged in', () => {
    const storeWithUser = createMockStore({
      auth: {
        user: { id: '1', email: 'test@example.com', name: 'Test User', role: 'normal' },
        token: 'fake-token',
        loading: false,
        error: null,
      },
    });
    
    renderWithProviders(<LoginForm />, storeWithUser);
    
    // The component should trigger navigation
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('allows custom redirect path', () => {
    const storeWithUser = createMockStore({
      auth: {
        user: { id: '1', email: 'test@example.com', name: 'Test User', role: 'normal' },
        token: 'fake-token',
        loading: false,
        error: null,
      },
    });
    
    renderWithProviders(<LoginForm redirectTo="/dashboard" />, storeWithUser);
    
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('has link to registration page', () => {
    renderWithProviders(<LoginForm />);
    
    const registerLink = screen.getByText('Register here');
    expect(registerLink).toBeInTheDocument();
    expect(registerLink).toHaveAttribute('href', '/register');
  });
});
