import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HistoricalChart } from '../HistoricalChart';
import { cryptoAPI } from '../../api/client';

// Mock the API client
jest.mock('../../api/client', () => ({
  cryptoAPI: {
    getHistory: jest.fn(),
  },
}));

// Mock Chart.js to avoid canvas rendering issues in tests
jest.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="chart">Chart</div>,
}));

describe('HistoricalChart', () => {
  const mockHistoricalData = {
    data: {
      data: Array.from({ length: 30 }, (_, i) => ({
        timestamp: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
        price: 50000 + Math.random() * 5000,
        volume: 1000000000 + Math.random() * 500000000,
      })),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Data Fetching', () => {
    it('should display loading state initially', () => {
      (cryptoAPI.getHistory as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<HistoricalChart cryptocurrency="BTC" userRole="normal" />);

      expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
    });

    it('should fetch historical data for selected cryptocurrency', async () => {
      (cryptoAPI.getHistory as jest.Mock).mockResolvedValue(mockHistoricalData);

      render(<HistoricalChart cryptocurrency="BTC" userRole="normal" />);

      await waitFor(() => {
        expect(cryptoAPI.getHistory).toHaveBeenCalledWith('BTC', 30);
      });
    });

    it('should fetch at least 30 days of historical data (requirement 7.2)', async () => {
      (cryptoAPI.getHistory as jest.Mock).mockResolvedValue(mockHistoricalData);

      render(<HistoricalChart cryptocurrency="ETH" userRole="normal" />);

      await waitFor(() => {
        expect(cryptoAPI.getHistory).toHaveBeenCalledWith('ETH', 30);
      });

      // Verify the API was called with days parameter >= 30
      const callArgs = (cryptoAPI.getHistory as jest.Mock).mock.calls[0];
      expect(callArgs[1]).toBeGreaterThanOrEqual(30);
    });

    it('should display error message when API call fails', async () => {
      const errorMessage = 'Failed to fetch data';
      (cryptoAPI.getHistory as jest.Mock).mockRejectedValue({
        response: {
          data: {
            error: {
              message: errorMessage,
            },
          },
        },
      });

      render(<HistoricalChart cryptocurrency="BTC" userRole="normal" />);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('should display generic error when API error has no message', async () => {
      (cryptoAPI.getHistory as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(<HistoricalChart cryptocurrency="BTC" userRole="normal" />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load historical data')).toBeInTheDocument();
      });
    });

    it('should display message when no data is available', async () => {
      (cryptoAPI.getHistory as jest.Mock).mockResolvedValue({
        data: {
          data: [],
        },
      });

      render(<HistoricalChart cryptocurrency="BTC" userRole="normal" />);

      await waitFor(() => {
        expect(screen.getByText('No historical data available')).toBeInTheDocument();
      });
    });
  });

  describe('Chart Display', () => {
    it('should display chart when data is loaded (requirement 7.1)', async () => {
      (cryptoAPI.getHistory as jest.Mock).mockResolvedValue(mockHistoricalData);

      render(<HistoricalChart cryptocurrency="BTC" userRole="normal" />);

      await waitFor(() => {
        expect(screen.getByTestId('chart')).toBeInTheDocument();
      });
    });

    it('should display price history visualization', async () => {
      (cryptoAPI.getHistory as jest.Mock).mockResolvedValue(mockHistoricalData);

      render(<HistoricalChart cryptocurrency="BTC" userRole="normal" />);

      await waitFor(() => {
        expect(screen.getByTestId('chart')).toBeInTheDocument();
      });
    });
  });

  describe('Analysis Display', () => {
    it('should display basic analysis for normal users', async () => {
      (cryptoAPI.getHistory as jest.Mock).mockResolvedValue(mockHistoricalData);

      render(<HistoricalChart cryptocurrency="BTC" userRole="normal" />);

      await waitFor(() => {
        expect(screen.getByText('Basic Analysis')).toBeInTheDocument();
      });
    });

    it('should display extended analysis for premium users (requirement 7.4)', async () => {
      (cryptoAPI.getHistory as jest.Mock).mockResolvedValue(mockHistoricalData);

      render(<HistoricalChart cryptocurrency="BTC" userRole="premium" />);

      await waitFor(() => {
        expect(screen.getByText('Extended Analysis')).toBeInTheDocument();
      });
    });

    it('should show premium badge for premium users', async () => {
      (cryptoAPI.getHistory as jest.Mock).mockResolvedValue(mockHistoricalData);

      render(<HistoricalChart cryptocurrency="BTC" userRole="premium" />);

      await waitFor(() => {
        expect(screen.getByText('Premium Analysis')).toBeInTheDocument();
      });
    });

    it('should include volatility metrics in premium analysis', async () => {
      (cryptoAPI.getHistory as jest.Mock).mockResolvedValue(mockHistoricalData);

      render(<HistoricalChart cryptocurrency="BTC" userRole="premium" />);

      await waitFor(() => {
        expect(screen.getByText(/Volatility:/)).toBeInTheDocument();
      });
    });

    it('should include trend analysis in premium analysis', async () => {
      (cryptoAPI.getHistory as jest.Mock).mockResolvedValue(mockHistoricalData);

      render(<HistoricalChart cryptocurrency="BTC" userRole="premium" />);

      await waitFor(() => {
        expect(screen.getByText(/Trend:/)).toBeInTheDocument();
      });
    });

    it('should include support level in premium analysis', async () => {
      (cryptoAPI.getHistory as jest.Mock).mockResolvedValue(mockHistoricalData);

      render(<HistoricalChart cryptocurrency="BTC" userRole="premium" />);

      await waitFor(() => {
        expect(screen.getByText(/Support Level:/)).toBeInTheDocument();
      });
    });

    it('should include resistance level in premium analysis', async () => {
      (cryptoAPI.getHistory as jest.Mock).mockResolvedValue(mockHistoricalData);

      render(<HistoricalChart cryptocurrency="BTC" userRole="premium" />);

      await waitFor(() => {
        expect(screen.getByText(/Resistance Level:/)).toBeInTheDocument();
      });
    });

    it('should show upgrade prompt for normal users', async () => {
      (cryptoAPI.getHistory as jest.Mock).mockResolvedValue(mockHistoricalData);

      render(<HistoricalChart cryptocurrency="BTC" userRole="normal" />);

      await waitFor(() => {
        expect(screen.getByText(/Unlock extended analysis/)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Upgrade to Premium/i })).toBeInTheDocument();
      });
    });

    it('should not show upgrade prompt for premium users', async () => {
      (cryptoAPI.getHistory as jest.Mock).mockResolvedValue(mockHistoricalData);

      render(<HistoricalChart cryptocurrency="BTC" userRole="premium" />);

      await waitFor(() => {
        expect(screen.getByTestId('chart')).toBeInTheDocument();
      });

      expect(screen.queryByText(/Unlock extended analysis/)).not.toBeInTheDocument();
    });
  });

  describe('Analysis Calculations', () => {
    it('should calculate price change percentage', async () => {
      const specificData = {
        data: {
          data: [
            { timestamp: new Date('2024-01-01').toISOString(), price: 50000, volume: 1000000000 },
            { timestamp: new Date('2024-01-15').toISOString(), price: 52500, volume: 1000000000 },
            { timestamp: new Date('2024-01-30').toISOString(), price: 55000, volume: 1000000000 },
          ],
        },
      };

      (cryptoAPI.getHistory as jest.Mock).mockResolvedValue(specificData);

      render(<HistoricalChart cryptocurrency="BTC" userRole="normal" />);

      await waitFor(() => {
        // 10% gain from 50000 to 55000
        expect(screen.getByText(/gained 10.00%/)).toBeInTheDocument();
      });
    });

    it('should show price range in analysis', async () => {
      const specificData = {
        data: {
          data: [
            { timestamp: new Date('2024-01-01').toISOString(), price: 48000, volume: 1000000000 },
            { timestamp: new Date('2024-01-15').toISOString(), price: 52000, volume: 1000000000 },
            { timestamp: new Date('2024-01-30').toISOString(), price: 50000, volume: 1000000000 },
          ],
        },
      };

      (cryptoAPI.getHistory as jest.Mock).mockResolvedValue(specificData);

      render(<HistoricalChart cryptocurrency="BTC" userRole="normal" />);

      await waitFor(() => {
        expect(screen.getByText(/ranged from \$48,000 to \$52,000/)).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty cryptocurrency symbol gracefully', async () => {
      (cryptoAPI.getHistory as jest.Mock).mockResolvedValue(mockHistoricalData);

      render(<HistoricalChart cryptocurrency="" userRole="normal" />);

      // Should not call API with empty symbol
      expect(cryptoAPI.getHistory).not.toHaveBeenCalled();
    });

    it('should refetch data when cryptocurrency changes', async () => {
      (cryptoAPI.getHistory as jest.Mock).mockResolvedValue(mockHistoricalData);

      const { rerender } = render(<HistoricalChart cryptocurrency="BTC" userRole="normal" />);

      await waitFor(() => {
        expect(cryptoAPI.getHistory).toHaveBeenCalledWith('BTC', 30);
      });

      rerender(<HistoricalChart cryptocurrency="ETH" userRole="normal" />);

      await waitFor(() => {
        expect(cryptoAPI.getHistory).toHaveBeenCalledWith('ETH', 30);
      });

      expect(cryptoAPI.getHistory).toHaveBeenCalledTimes(2);
    });

    it('should update analysis when user role changes', async () => {
      (cryptoAPI.getHistory as jest.Mock).mockResolvedValue(mockHistoricalData);

      const { rerender } = render(<HistoricalChart cryptocurrency="BTC" userRole="normal" />);

      await waitFor(() => {
        expect(screen.getByText('Basic Analysis')).toBeInTheDocument();
      });

      rerender(<HistoricalChart cryptocurrency="BTC" userRole="premium" />);

      await waitFor(() => {
        expect(screen.getByText('Extended Analysis')).toBeInTheDocument();
      });
    });

    it('should handle single data point', async () => {
      const singlePointData = {
        data: {
          data: [
            { timestamp: new Date('2024-01-01').toISOString(), price: 50000, volume: 1000000000 },
          ],
        },
      };

      (cryptoAPI.getHistory as jest.Mock).mockResolvedValue(singlePointData);

      render(<HistoricalChart cryptocurrency="BTC" userRole="normal" />);

      await waitFor(() => {
        expect(screen.getByTestId('chart')).toBeInTheDocument();
      });
    });

    it('should handle extreme price volatility', async () => {
      const volatileData = {
        data: {
          data: [
            { timestamp: new Date('2024-01-01').toISOString(), price: 50000, volume: 1000000000 },
            { timestamp: new Date('2024-01-02').toISOString(), price: 30000, volume: 1000000000 },
            { timestamp: new Date('2024-01-03').toISOString(), price: 70000, volume: 1000000000 },
          ],
        },
      };

      (cryptoAPI.getHistory as jest.Mock).mockResolvedValue(volatileData);

      render(<HistoricalChart cryptocurrency="BTC" userRole="premium" />);

      await waitFor(() => {
        expect(screen.getByText(/Volatility:/)).toBeInTheDocument();
      });
    });
  });
});
