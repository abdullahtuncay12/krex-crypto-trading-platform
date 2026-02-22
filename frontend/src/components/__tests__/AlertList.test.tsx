import { render, screen, waitFor } from '@testing-library/react';
import { AlertList } from '../AlertList';
import { alertAPI } from '../../api/client';

// Mock the API client
jest.mock('../../api/client', () => ({
  alertAPI: {
    getAlerts: jest.fn(),
  },
}));

const mockedAlertAPI = alertAPI as jest.Mocked<typeof alertAPI>;

describe('AlertList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays upgrade prompt for normal users', () => {
    render(<AlertList userRole="normal" />);

    expect(screen.getByText('Premium Feature')).toBeInTheDocument();
    expect(screen.getByText(/Get real-time alerts/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Upgrade to Premium/i })).toBeInTheDocument();
  });

  it('fetches and displays alerts for premium users', async () => {
    const mockAlerts = [
      {
        id: '1',
        userId: 'user1',
        cryptocurrency: 'BTC',
        alertType: 'price_movement' as const,
        message: 'Bitcoin price increased by 5%',
        read: false,
        createdAt: new Date('2024-01-01T10:00:00Z'),
      },
      {
        id: '2',
        userId: 'user1',
        cryptocurrency: 'ETH',
        alertType: 'pump_detected' as const,
        message: 'Ethereum pump detected',
        read: true,
        createdAt: new Date('2024-01-01T09:00:00Z'),
      },
    ];

    mockedAlertAPI.getAlerts.mockResolvedValue({
      data: { alerts: mockAlerts },
    } as any);

    render(<AlertList userRole="premium" />);

    await waitFor(() => {
      expect(screen.getByText('BTC')).toBeInTheDocument();
      expect(screen.getByText('Bitcoin price increased by 5%')).toBeInTheDocument();
      expect(screen.getByText('ETH')).toBeInTheDocument();
      expect(screen.getByText('Ethereum pump detected')).toBeInTheDocument();
    });
  });

  it('displays loading state while fetching alerts', () => {
    mockedAlertAPI.getAlerts.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<AlertList userRole="premium" />);

    expect(screen.getByText('Alerts')).toBeInTheDocument();
    // Check for loading spinner
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('displays error message when alert fetch fails', async () => {
    mockedAlertAPI.getAlerts.mockRejectedValue({
      response: {
        data: {
          error: {
            message: 'Failed to load alerts',
          },
        },
      },
    });

    render(<AlertList userRole="premium" />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load alerts')).toBeInTheDocument();
    });
  });

  it('displays empty state when no alerts are available', async () => {
    mockedAlertAPI.getAlerts.mockResolvedValue({
      data: { alerts: [] },
    } as any);

    render(<AlertList userRole="premium" />);

    await waitFor(() => {
      expect(screen.getByText('No alerts yet')).toBeInTheDocument();
    });
  });

  it('displays unread count badge when there are unread alerts', async () => {
    const mockAlerts = [
      {
        id: '1',
        userId: 'user1',
        cryptocurrency: 'BTC',
        alertType: 'price_movement' as const,
        message: 'Bitcoin price increased by 5%',
        read: false,
        createdAt: new Date(),
      },
      {
        id: '2',
        userId: 'user1',
        cryptocurrency: 'ETH',
        alertType: 'trading_opportunity' as const,
        message: 'Trading opportunity detected',
        read: false,
        createdAt: new Date(),
      },
      {
        id: '3',
        userId: 'user1',
        cryptocurrency: 'BTC',
        alertType: 'pump_detected' as const,
        message: 'Pump detected',
        read: true,
        createdAt: new Date(),
      },
    ];

    mockedAlertAPI.getAlerts.mockResolvedValue({
      data: { alerts: mockAlerts },
    } as any);

    render(<AlertList userRole="premium" />);

    await waitFor(() => {
      expect(screen.getByText('2 new')).toBeInTheDocument();
    });
  });

  it('displays correct icon for price_movement alert type', async () => {
    const mockAlerts = [
      {
        id: '1',
        userId: 'user1',
        cryptocurrency: 'BTC',
        alertType: 'price_movement' as const,
        message: 'Price movement detected',
        read: false,
        createdAt: new Date(),
      },
    ];

    mockedAlertAPI.getAlerts.mockResolvedValue({
      data: { alerts: mockAlerts },
    } as any);

    const { container } = render(<AlertList userRole="premium" />);

    await waitFor(() => {
      const icon = container.querySelector('.text-blue-600');
      expect(icon).toBeInTheDocument();
    });
  });

  it('displays cryptocurrency symbol and message in alert', async () => {
    const mockAlerts = [
      {
        id: '1',
        userId: 'user1',
        cryptocurrency: 'BTC',
        alertType: 'price_movement' as const,
        message: 'Bitcoin price increased by 10%',
        read: false,
        createdAt: new Date(),
      },
    ];

    mockedAlertAPI.getAlerts.mockResolvedValue({
      data: { alerts: mockAlerts },
    } as any);

    render(<AlertList userRole="premium" />);

    await waitFor(() => {
      expect(screen.getByText('BTC')).toBeInTheDocument();
      expect(screen.getByText('Bitcoin price increased by 10%')).toBeInTheDocument();
    });
  });

  it('applies different styling for read vs unread alerts', async () => {
    const mockAlerts = [
      {
        id: '1',
        userId: 'user1',
        cryptocurrency: 'BTC',
        alertType: 'price_movement' as const,
        message: 'Unread alert',
        read: false,
        createdAt: new Date(),
      },
      {
        id: '2',
        userId: 'user1',
        cryptocurrency: 'ETH',
        alertType: 'price_movement' as const,
        message: 'Read alert',
        read: true,
        createdAt: new Date(),
      },
    ];

    mockedAlertAPI.getAlerts.mockResolvedValue({
      data: { alerts: mockAlerts },
    } as any);

    const { container } = render(<AlertList userRole="premium" />);

    await waitFor(() => {
      const unreadAlert = container.querySelector('.bg-blue-50');
      const readAlert = container.querySelector('.bg-gray-50');
      expect(unreadAlert).toBeInTheDocument();
      expect(readAlert).toBeInTheDocument();
    });
  });
});
