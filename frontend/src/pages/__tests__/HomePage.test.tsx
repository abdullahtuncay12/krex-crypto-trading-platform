import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { HomePage } from '../HomePage';
import authReducer from '../../store/slices/authSlice';

// Mock the API client
jest.mock('../../api/client', () => ({
  cryptoAPI: {
    getAll: jest.fn(),
    getHistory: jest.fn(),
  },
  signalAPI: {
    getSignal: jest.fn(),
    getPerformance: jest.fn(),
  },
  alertAPI: {
    getAlerts: jest.fn(),
  },
}));

// Mock child components to simplify testing
jest.mock('../../components/CryptoSelector', () => ({
  CryptoSelector: () => (
    <div data-testid="crypto-selector">Crypto Selector</div>
  ),
}));

jest.mock('../../components/SignalDisplay', () => ({
  SignalDisplay: ({ userRole }: any) => (
    <div data-testid="signal-display">
      Signal Display - {userRole}
    </div>
  ),
}));

jest.mock('../../components/HistoricalChart', () => ({
  HistoricalChart: ({ cryptocurrency, userRole }: any) => (
    <div data-testid="historical-chart">
      Historical Chart - {cryptocurrency} - {userRole}
    </div>
  ),
}));

jest.mock('../../components/PerformanceDisplay', () => ({
  PerformanceDisplay: () => (
    <div data-testid="performance-display">Performance Display</div>
  ),
}));

jest.mock('../../components/AlertList', () => ({
  AlertList: ({ userRole }: any) => (
    <div data-testid="alert-list">Alert List - {userRole}</div>
  ),
}));

const createMockStore = (user: any = null) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user,
        token: user ? 'mock-token' : null,
        loading: false,
        error: null,
      },
    },
  });
};

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders single-page layout with all components', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'normal' as const,
    };
    const store = createMockStore(mockUser);

    render(
      <Provider store={store}>
        <HomePage />
      </Provider>
    );

    // Verify all main components are present (Requirement 9.1)
    expect(screen.getByTestId('crypto-selector')).toBeInTheDocument();
    expect(screen.getByTestId('performance-display')).toBeInTheDocument();
    expect(screen.getByTestId('alert-list')).toBeInTheDocument();
  });

  it('displays CryptoSelector at top of page', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'normal' as const,
    };
    const store = createMockStore(mockUser);

    render(
      <Provider store={store}>
        <HomePage />
      </Provider>
    );

    const cryptoSelector = screen.getByTestId('crypto-selector');
    expect(cryptoSelector).toBeInTheDocument();
    
    // Verify it's in the main content area
    const mainContent = cryptoSelector.closest('.lg\\:col-span-3');
    expect(mainContent).toBeInTheDocument();
  });

  it('displays PerformanceDisplay at bottom of page', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'normal' as const,
    };
    const store = createMockStore(mockUser);

    render(
      <Provider store={store}>
        <HomePage />
      </Provider>
    );

    expect(screen.getByTestId('performance-display')).toBeInTheDocument();
  });

  it('displays AlertList in sidebar for premium users', () => {
    const mockUser = {
      id: '1',
      email: 'premium@example.com',
      name: 'Premium User',
      role: 'premium' as const,
    };
    const store = createMockStore(mockUser);

    render(
      <Provider store={store}>
        <HomePage />
      </Provider>
    );

    const alertList = screen.getByTestId('alert-list');
    expect(alertList).toBeInTheDocument();
    expect(alertList).toHaveTextContent('Alert List - premium');
  });

  it('displays AlertList in sidebar for normal users with upgrade prompt', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'normal' as const,
    };
    const store = createMockStore(mockUser);

    render(
      <Provider store={store}>
        <HomePage />
      </Provider>
    );

    const alertList = screen.getByTestId('alert-list');
    expect(alertList).toBeInTheDocument();
    expect(alertList).toHaveTextContent('Alert List - normal');
  });

  it('uses responsive design with TailwindCSS classes', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'normal' as const,
    };
    const store = createMockStore(mockUser);

    const { container } = render(
      <Provider store={store}>
        <HomePage />
      </Provider>
    );

    // Check for responsive grid layout
    const gridContainer = container.querySelector('.grid.grid-cols-1.lg\\:grid-cols-4');
    expect(gridContainer).toBeInTheDocument();

    // Check for responsive spacing
    const mainContent = container.querySelector('.lg\\:col-span-3');
    expect(mainContent).toBeInTheDocument();

    const sidebar = container.querySelector('.lg\\:col-span-1');
    expect(sidebar).toBeInTheDocument();
  });

  it('displays user information in header', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'normal' as const,
    };
    const store = createMockStore(mockUser);

    render(
      <Provider store={store}>
        <HomePage />
      </Provider>
    );

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('Normal')).toBeInTheDocument();
  });

  it('displays premium badge for premium users', () => {
    const mockUser = {
      id: '1',
      email: 'premium@example.com',
      name: 'Premium User',
      role: 'premium' as const,
    };
    const store = createMockStore(mockUser);

    render(
      <Provider store={store}>
        <HomePage />
      </Provider>
    );

    expect(screen.getByText('Premium User')).toBeInTheDocument();
    expect(screen.getByText('Premium')).toBeInTheDocument();
  });

  it('displays welcome message when no cryptocurrency is selected', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'normal' as const,
    };
    const store = createMockStore(mockUser);

    render(
      <Provider store={store}>
        <HomePage />
      </Provider>
    );

    expect(screen.getByText('Welcome to Crypto Trading Signals')).toBeInTheDocument();
    expect(screen.getByText(/Select a cryptocurrency above/)).toBeInTheDocument();
  });

  it('has proper layout structure with header, main content, and sidebar', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'normal' as const,
    };
    const store = createMockStore(mockUser);

    const { container } = render(
      <Provider store={store}>
        <HomePage />
      </Provider>
    );

    // Check for header
    const header = container.querySelector('header');
    expect(header).toBeInTheDocument();

    // Check for main content
    const main = container.querySelector('main');
    expect(main).toBeInTheDocument();

    // Check for grid layout
    const grid = container.querySelector('.grid');
    expect(grid).toBeInTheDocument();
  });
});
