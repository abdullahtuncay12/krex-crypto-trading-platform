import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { RegisterForm } from '../RegisterForm';
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

describe('RegisterForm', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    localStorage.clear();
  });

  it('renders registration form with all fields', () => {
    renderWithProviders(<RegisterForm />);
    
    expect(screen.getByText('Create Your Account')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/)).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
    expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
  });

  it('validates name field is required', async () => {
    renderWithProviders(<RegisterForm />);
    
    const submitButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });
  });

  it('validates name minimum length', async () => {
    renderWithProviders(<RegisterForm />);
    
    const nameInput = screen.getByLabelText('Name');
    fireEvent.change(nameInput, { target: { value: 'A' } });
    
    const submitButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument();
    });
  });

  it('validates email field is required', async () => {
    renderWithProviders(<RegisterForm />);
    
    const submitButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    renderWithProviders(<RegisterForm />);
    
    const emailInput = screen.getByLabelText('Email');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    const submitButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  it('validates password field is required', async () => {
    renderWithProviders(<RegisterForm />);
    
    const submitButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  it('validates password minimum length', async () => {
    renderWithProviders(<RegisterForm />);
    
    const passwordInput = screen.getByLabelText(/^Password$/);
    fireEvent.change(passwordInput, { target: { value: 'short' } });
    
    const submitButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    });
  });

  it('validates password complexity requirements', async () => {
    renderWithProviders(<RegisterForm />);
    
    const passwordInput = screen.getByLabelText(/^Password$/);
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    const submitButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Password must contain uppercase, lowercase, and number')).toBeInTheDocument();
    });
  });

  it('validates password confirmation is required', async () => {
    renderWithProviders(<RegisterForm />);
    
    const submitButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Please confirm your password')).toBeInTheDocument();
    });
  });

  it('validates passwords match', async () => {
    renderWithProviders(<RegisterForm />);
    
    const passwordInput = screen.getByLabelText(/^Password$/);
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password456' } });
    
    const submitButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  it('clears validation errors when user types', async () => {
    renderWithProviders(<RegisterForm />);
    
    const submitButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });
    
    const nameInput = screen.getByLabelText('Name');
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    
    await waitFor(() => {
      expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
    });
  });

  it('displays server error message', () => {
    const storeWithError = createMockStore({
      auth: {
        user: null,
        token: null,
        loading: false,
        error: 'Email already registered',
      },
    });
    
    renderWithProviders(<RegisterForm />, storeWithError);
    
    expect(screen.getByText('Email already registered')).toBeInTheDocument();
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
    
    renderWithProviders(<RegisterForm />, storeWithLoading);
    
    expect(screen.getByLabelText('Name')).toBeDisabled();
    expect(screen.getByLabelText('Email')).toBeDisabled();
    expect(screen.getByLabelText(/^Password$/)).toBeDisabled();
    expect(screen.getByLabelText('Confirm Password')).toBeDisabled();
    expect(screen.getByRole('button', { name: /creating account/i })).toBeDisabled();
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
    
    renderWithProviders(<RegisterForm />, storeWithUser);
    
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
    
    renderWithProviders(<RegisterForm redirectTo="/dashboard" />, storeWithUser);
    
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('has link to login page', () => {
    renderWithProviders(<RegisterForm />);
    
    const loginLink = screen.getByText('Login here');
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('shows password requirements hint', () => {
    renderWithProviders(<RegisterForm />);
    
    expect(screen.getByText('Must contain uppercase, lowercase, and number')).toBeInTheDocument();
  });
});
