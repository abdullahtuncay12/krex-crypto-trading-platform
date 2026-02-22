import { render, screen, waitFor } from '@testing-library/react';
import { PerformanceDisplay } from '../PerformanceDisplay';
import { signalAPI } from '../../api/client';

// Mock the API client
jest.mock('../../api/client');

const mockSignalAPI = signalAPI as jest.Mocked<typeof signalAPI>;

describe('PerformanceDisplay', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display loading state initially', () => {
    mockSignalAPI.getPerformance.mockReturnValue(new Promise(() => {}));
    
    render(<PerformanceDisplay />);
    
    expect(screen.getByText('Premium Signal Performance')).toBeInTheDocument();
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument(); // Loading spinner
  });

  it('should display completed trades with all required fields', async () => {
    const mockTrades = [
      {
        id: '1',
        signalId: 'signal-1',
        cryptocurrency: 'BTC',
        entryPrice: 50000,
        exitPrice: 55000,
        profitPercent: 10.0,
        entryDate: new Date('2024-01-01'),
        exitDate: new Date('2024-01-10'),
        signalType: 'premium' as const,
      },
      {
        id: '2',
        signalId: 'signal-2',
        cryptocurrency: 'ETH',
        entryPrice: 3000,
        exitPrice: 3300,
        profitPercent: 10.0,
        entryDate: new Date('2024-01-05'),
        exitDate: new Date('2024-01-15'),
        signalType: 'premium' as const,
      },
    ];

    mockSignalAPI.getPerformance.mockResolvedValue({
      data: { trades: mockTrades },
    } as any);

    render(<PerformanceDisplay />);

    await waitFor(() => {
      expect(screen.getByText('BTC')).toBeInTheDocument();
    });

    // Verify cryptocurrency is displayed
    expect(screen.getByText('BTC')).toBeInTheDocument();
    expect(screen.getByText('ETH')).toBeInTheDocument();

    // Verify entry prices are displayed
    expect(screen.getByText('$50,000.00')).toBeInTheDocument();
    expect(screen.getByText('$3,000.00')).toBeInTheDocument();

    // Verify exit prices are displayed
    expect(screen.getByText('$55,000.00')).toBeInTheDocument();
    expect(screen.getByText('$3,300.00')).toBeInTheDocument();

    // Verify profit percentages are displayed
    const profitElements = screen.getAllByText('+10.00%');
    expect(profitElements).toHaveLength(2);
  });

  it('should style profitable trades in green', async () => {
    const mockTrades = [
      {
        id: '1',
        signalId: 'signal-1',
        cryptocurrency: 'BTC',
        entryPrice: 50000,
        exitPrice: 55000,
        profitPercent: 10.0,
        entryDate: new Date('2024-01-01'),
        exitDate: new Date('2024-01-10'),
        signalType: 'premium' as const,
      },
    ];

    mockSignalAPI.getPerformance.mockResolvedValue({
      data: { trades: mockTrades },
    } as any);

    render(<PerformanceDisplay />);

    await waitFor(() => {
      expect(screen.getByText('+10.00%')).toBeInTheDocument();
    });

    const profitElement = screen.getByText('+10.00%');
    expect(profitElement).toHaveClass('text-green-600');
  });

  it('should style losing trades in red', async () => {
    const mockTrades = [
      {
        id: '1',
        signalId: 'signal-1',
        cryptocurrency: 'BTC',
        entryPrice: 50000,
        exitPrice: 45000,
        profitPercent: -10.0,
        entryDate: new Date('2024-01-01'),
        exitDate: new Date('2024-01-10'),
        signalType: 'premium' as const,
      },
    ];

    mockSignalAPI.getPerformance.mockResolvedValue({
      data: { trades: mockTrades },
    } as any);

    render(<PerformanceDisplay />);

    await waitFor(() => {
      expect(screen.getByText('-10.00%')).toBeInTheDocument();
    });

    const profitElement = screen.getByText('-10.00%');
    expect(profitElement).toHaveClass('text-red-600');
  });

  it('should display error message when API call fails', async () => {
    mockSignalAPI.getPerformance.mockRejectedValue({
      response: {
        data: {
          error: {
            message: 'Failed to fetch performance data',
          },
        },
      },
    });

    render(<PerformanceDisplay />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch performance data')).toBeInTheDocument();
    });
  });

  it('should display message when no trades are available', async () => {
    mockSignalAPI.getPerformance.mockResolvedValue({
      data: { trades: [] },
    } as any);

    render(<PerformanceDisplay />);

    await waitFor(() => {
      expect(screen.getByText('No completed trades yet')).toBeInTheDocument();
    });
  });

  it('should format dates correctly', async () => {
    const mockTrades = [
      {
        id: '1',
        signalId: 'signal-1',
        cryptocurrency: 'BTC',
        entryPrice: 50000,
        exitPrice: 55000,
        profitPercent: 10.0,
        entryDate: new Date('2024-01-01'),
        exitDate: new Date('2024-01-10'),
        signalType: 'premium' as const,
      },
    ];

    mockSignalAPI.getPerformance.mockResolvedValue({
      data: { trades: mockTrades },
    } as any);

    render(<PerformanceDisplay />);

    await waitFor(() => {
      expect(screen.getByText('Jan 10, 2024')).toBeInTheDocument();
    });
  });

  it('should display table headers', async () => {
    mockSignalAPI.getPerformance.mockResolvedValue({
      data: { trades: [] },
    } as any);

    render(<PerformanceDisplay />);

    await waitFor(() => {
      expect(screen.getByText('No completed trades yet')).toBeInTheDocument();
    });

    // Headers should not be visible when there are no trades
    expect(screen.queryByText('Cryptocurrency')).not.toBeInTheDocument();
  });

  it('should display table headers when trades exist', async () => {
    const mockTrades = [
      {
        id: '1',
        signalId: 'signal-1',
        cryptocurrency: 'BTC',
        entryPrice: 50000,
        exitPrice: 55000,
        profitPercent: 10.0,
        entryDate: new Date('2024-01-01'),
        exitDate: new Date('2024-01-10'),
        signalType: 'premium' as const,
      },
    ];

    mockSignalAPI.getPerformance.mockResolvedValue({
      data: { trades: mockTrades },
    } as any);

    render(<PerformanceDisplay />);

    await waitFor(() => {
      expect(screen.getByText('Cryptocurrency')).toBeInTheDocument();
    });

    expect(screen.getByText('Entry Price')).toBeInTheDocument();
    expect(screen.getByText('Exit Price')).toBeInTheDocument();
    expect(screen.getByText('Profit')).toBeInTheDocument();
    expect(screen.getByText('Exit Date')).toBeInTheDocument();
  });

  it('should display count of trades', async () => {
    const mockTrades = [
      {
        id: '1',
        signalId: 'signal-1',
        cryptocurrency: 'BTC',
        entryPrice: 50000,
        exitPrice: 55000,
        profitPercent: 10.0,
        entryDate: new Date('2024-01-01'),
        exitDate: new Date('2024-01-10'),
        signalType: 'premium' as const,
      },
      {
        id: '2',
        signalId: 'signal-2',
        cryptocurrency: 'ETH',
        entryPrice: 3000,
        exitPrice: 3300,
        profitPercent: 10.0,
        entryDate: new Date('2024-01-05'),
        exitDate: new Date('2024-01-15'),
        signalType: 'premium' as const,
      },
    ];

    mockSignalAPI.getPerformance.mockResolvedValue({
      data: { trades: mockTrades },
    } as any);

    render(<PerformanceDisplay />);

    await waitFor(() => {
      expect(screen.getByText('Showing 2 most recent completed premium signals')).toBeInTheDocument();
    });
  });
});
