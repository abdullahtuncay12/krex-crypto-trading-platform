import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { PrivateRoute } from '../PrivateRoute';
import authReducer from '../../store/slices/authSlice';
import '@testing-library/jest-dom';

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

const TestComponent = () => <div>Protected Content</div>;
const LoginComponent = () => <div>Login Page</div>;

const renderWithProviders = (
  component: React.ReactElement,
  store = createMockStore()
) => {
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginComponent />} />
          <Route path="/" element={component} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
};

describe('PrivateRoute', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders protected content when user is authenticated', () => {
    const storeWithUser = createMockStore({
      auth: {
        user: { id: '1', email: 'test@example.com', name: 'Test User', role: 'normal' },
        token: 'fake-token',
        loading: false,
        error: null,
      },
    });

    renderWithProviders(
      <PrivateRoute>
        <TestComponent />
      </PrivateRoute>,
      storeWithUser
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to login when user is not authenticated', () => {
    const storeWithoutUser = createMockStore({
      auth: {
        user: null,
        token: null,
        loading: false,
        error: null,
      },
    });

    renderWithProviders(
      <PrivateRoute>
        <TestComponent />
      </PrivateRoute>,
      storeWithoutUser
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('shows loading state when fetching user data', () => {
    const storeWithLoading = createMockStore({
      auth: {
        user: null,
        token: 'fake-token',
        loading: true,
        error: null,
      },
    });

    renderWithProviders(
      <PrivateRoute>
        <TestComponent />
      </PrivateRoute>,
      storeWithLoading
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('shows loading state when token exists but user is not loaded', () => {
    const storeWithTokenNoUser = createMockStore({
      auth: {
        user: null,
        token: 'fake-token',
        loading: false,
        error: null,
      },
    });

    renderWithProviders(
      <PrivateRoute>
        <TestComponent />
      </PrivateRoute>,
      storeWithTokenNoUser
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders content for premium user when requirePremium is true', () => {
    const storeWithPremiumUser = createMockStore({
      auth: {
        user: { id: '1', email: 'test@example.com', name: 'Test User', role: 'premium' },
        token: 'fake-token',
        loading: false,
        error: null,
      },
    });

    renderWithProviders(
      <PrivateRoute requirePremium>
        <TestComponent />
      </PrivateRoute>,
      storeWithPremiumUser
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('shows premium required message for normal user when requirePremium is true', () => {
    const storeWithNormalUser = createMockStore({
      auth: {
        user: { id: '1', email: 'test@example.com', name: 'Test User', role: 'normal' },
        token: 'fake-token',
        loading: false,
        error: null,
      },
    });

    renderWithProviders(
      <PrivateRoute requirePremium>
        <TestComponent />
      </PrivateRoute>,
      storeWithNormalUser
    );

    expect(screen.getByText('Premium Required')).toBeInTheDocument();
    expect(screen.getByText(/this feature is only available to premium members/i)).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders content for normal user when requirePremium is false', () => {
    const storeWithNormalUser = createMockStore({
      auth: {
        user: { id: '1', email: 'test@example.com', name: 'Test User', role: 'normal' },
        token: 'fake-token',
        loading: false,
        error: null,
      },
    });

    renderWithProviders(
      <PrivateRoute requirePremium={false}>
        <TestComponent />
      </PrivateRoute>,
      storeWithNormalUser
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('premium required screen has go to home button', () => {
    const storeWithNormalUser = createMockStore({
      auth: {
        user: { id: '1', email: 'test@example.com', name: 'Test User', role: 'normal' },
        token: 'fake-token',
        loading: false,
        error: null,
      },
    });

    renderWithProviders(
      <PrivateRoute requirePremium>
        <TestComponent />
      </PrivateRoute>,
      storeWithNormalUser
    );

    const homeButton = screen.getByRole('button', { name: /go to home/i });
    expect(homeButton).toBeInTheDocument();
  });

  it('redirects to login when token is missing', () => {
    const storeWithoutToken = createMockStore({
      auth: {
        user: null,
        token: null,
        loading: false,
        error: null,
      },
    });

    renderWithProviders(
      <PrivateRoute>
        <TestComponent />
      </PrivateRoute>,
      storeWithoutToken
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });
});
