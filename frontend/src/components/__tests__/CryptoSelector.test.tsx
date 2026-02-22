import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CryptoSelector, Cryptocurrency } from '../CryptoSelector';
import { cryptoAPI } from '../../api/client';

// Mock the API client
jest.mock('../../api/client');

const mockCryptocurrencies: Cryptocurrency[] = [
  { symbol: 'BTC', name: 'Bitcoin', currentPrice: 45000, change24h: 2.5 },
  { symbol: 'ETH', name: 'Ethereum', currentPrice: 3000, change24h: -1.2 },
  { symbol: 'ADA', name: 'Cardano', currentPrice: 0.5, change24h: 5.3 },
  { symbol: 'SOL', name: 'Solana', currentPrice: 100, change24h: -3.1 },
];

describe('CryptoSelector', () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render with search input', async () => {
      (cryptoAPI.getAll as jest.Mock).mockResolvedValue({
        data: { cryptocurrencies: mockCryptocurrencies },
      });

      render(<CryptoSelector onSelect={mockOnSelect} />);

      expect(screen.getByLabelText(/select cryptocurrency/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/search cryptocurrencies/i)).toBeInTheDocument();
    });

    it('should show loading state initially', () => {
      (cryptoAPI.getAll as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<CryptoSelector onSelect={mockOnSelect} />);

      expect(screen.getByLabelText(/select cryptocurrency/i)).toBeDisabled();
    });

    it('should display error message when API fails', async () => {
      const errorMessage = 'Failed to load cryptocurrencies';
      (cryptoAPI.getAll as jest.Mock).mockRejectedValue({
        response: { data: { error: { message: errorMessage } } },
      });

      render(<CryptoSelector onSelect={mockOnSelect} />);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });
  });

  describe('Cryptocurrency List Display', () => {
    it('should fetch and display cryptocurrency list on mount', async () => {
      (cryptoAPI.getAll as jest.Mock).mockResolvedValue({
        data: { cryptocurrencies: mockCryptocurrencies },
      });

      render(<CryptoSelector onSelect={mockOnSelect} />);

      const input = screen.getByPlaceholderText(/search cryptocurrencies/i);
      fireEvent.click(input);

      await waitFor(() => {
        expect(screen.getByText('BTC')).toBeInTheDocument();
        expect(screen.getByText('Bitcoin')).toBeInTheDocument();
        expect(screen.getByText('ETH')).toBeInTheDocument();
        expect(screen.getByText('Ethereum')).toBeInTheDocument();
      });

      expect(cryptoAPI.getAll).toHaveBeenCalledTimes(1);
    });

    it('should display cryptocurrency with symbol and name', async () => {
      (cryptoAPI.getAll as jest.Mock).mockResolvedValue({
        data: { cryptocurrencies: [mockCryptocurrencies[0]] },
      });

      render(<CryptoSelector onSelect={mockOnSelect} />);

      const input = screen.getByPlaceholderText(/search cryptocurrencies/i);
      fireEvent.click(input);

      await waitFor(() => {
        expect(screen.getByText('BTC')).toBeInTheDocument();
        expect(screen.getByText('Bitcoin')).toBeInTheDocument();
      });
    });

    it('should display price and 24h change', async () => {
      (cryptoAPI.getAll as jest.Mock).mockResolvedValue({
        data: { cryptocurrencies: mockCryptocurrencies },
      });

      render(<CryptoSelector onSelect={mockOnSelect} />);

      const input = screen.getByPlaceholderText(/search cryptocurrencies/i);
      fireEvent.click(input);

      await waitFor(() => {
        expect(screen.getByText('$45,000')).toBeInTheDocument();
        expect(screen.getByText('+2.50%')).toBeInTheDocument();
      });
    });
  });

  describe('Search and Filter Functionality', () => {
    beforeEach(async () => {
      (cryptoAPI.getAll as jest.Mock).mockResolvedValue({
        data: { cryptocurrencies: mockCryptocurrencies },
      });
    });

    it('should filter cryptocurrencies by symbol', async () => {
      render(<CryptoSelector onSelect={mockOnSelect} />);

      const input = screen.getByPlaceholderText(/search cryptocurrencies/i);
      
      await waitFor(() => {
        expect(cryptoAPI.getAll).toHaveBeenCalled();
      });

      fireEvent.change(input, { target: { value: 'BTC' } });

      await waitFor(() => {
        expect(screen.getByText('BTC')).toBeInTheDocument();
        expect(screen.queryByText('ETH')).not.toBeInTheDocument();
      });
    });

    it('should filter cryptocurrencies by name', async () => {
      render(<CryptoSelector onSelect={mockOnSelect} />);

      const input = screen.getByPlaceholderText(/search cryptocurrencies/i);
      
      await waitFor(() => {
        expect(cryptoAPI.getAll).toHaveBeenCalled();
      });

      fireEvent.change(input, { target: { value: 'ethereum' } });

      await waitFor(() => {
        expect(screen.getByText('ETH')).toBeInTheDocument();
        expect(screen.queryByText('BTC')).not.toBeInTheDocument();
      });
    });

    it('should filter case-insensitively', async () => {
      render(<CryptoSelector onSelect={mockOnSelect} />);

      const input = screen.getByPlaceholderText(/search cryptocurrencies/i);
      
      await waitFor(() => {
        expect(cryptoAPI.getAll).toHaveBeenCalled();
      });

      fireEvent.change(input, { target: { value: 'btc' } });

      await waitFor(() => {
        expect(screen.getByText('BTC')).toBeInTheDocument();
      });
    });

    it('should show "No cryptocurrencies found" when filter returns empty', async () => {
      render(<CryptoSelector onSelect={mockOnSelect} />);

      const input = screen.getByPlaceholderText(/search cryptocurrencies/i);
      
      await waitFor(() => {
        expect(cryptoAPI.getAll).toHaveBeenCalled();
      });

      fireEvent.change(input, { target: { value: 'NONEXISTENT' } });

      await waitFor(() => {
        expect(screen.getByText(/no cryptocurrencies found/i)).toBeInTheDocument();
      });
    });

    it('should show all cryptocurrencies when search is cleared', async () => {
      render(<CryptoSelector onSelect={mockOnSelect} />);

      const input = screen.getByPlaceholderText(/search cryptocurrencies/i);
      
      await waitFor(() => {
        expect(cryptoAPI.getAll).toHaveBeenCalled();
      });

      fireEvent.change(input, { target: { value: 'BTC' } });
      
      await waitFor(() => {
        expect(screen.queryByText('ETH')).not.toBeInTheDocument();
      });

      fireEvent.change(input, { target: { value: '' } });

      await waitFor(() => {
        expect(screen.getByText('BTC')).toBeInTheDocument();
        expect(screen.getByText('ETH')).toBeInTheDocument();
      });
    });
  });

  describe('Selection Functionality', () => {
    beforeEach(async () => {
      (cryptoAPI.getAll as jest.Mock).mockResolvedValue({
        data: { cryptocurrencies: mockCryptocurrencies },
      });
    });

    it('should emit onSelect event when user chooses a crypto', async () => {
      render(<CryptoSelector onSelect={mockOnSelect} />);

      const input = screen.getByPlaceholderText(/search cryptocurrencies/i);
      fireEvent.click(input);

      await waitFor(() => {
        expect(screen.getByText('BTC')).toBeInTheDocument();
      });

      const btcOption = screen.getByText('BTC').closest('li');
      fireEvent.click(btcOption!);

      expect(mockOnSelect).toHaveBeenCalledWith(mockCryptocurrencies[0]);
      expect(mockOnSelect).toHaveBeenCalledTimes(1);
    });

    it('should update placeholder after selection', async () => {
      render(<CryptoSelector onSelect={mockOnSelect} />);

      const input = screen.getByPlaceholderText(/search cryptocurrencies/i) as HTMLInputElement;
      fireEvent.click(input);

      await waitFor(() => {
        expect(screen.getByText('BTC')).toBeInTheDocument();
      });

      const btcOption = screen.getByText('BTC').closest('li');
      fireEvent.click(btcOption!);

      await waitFor(() => {
        expect(input.placeholder).toContain('BTC - Bitcoin');
      });
    });

    it('should close dropdown after selection', async () => {
      render(<CryptoSelector onSelect={mockOnSelect} />);

      const input = screen.getByPlaceholderText(/search cryptocurrencies/i);
      fireEvent.click(input);

      await waitFor(() => {
        expect(screen.getByText('BTC')).toBeInTheDocument();
      });

      const btcOption = screen.getByText('BTC').closest('li');
      fireEvent.click(btcOption!);

      await waitFor(() => {
        expect(screen.queryByText('ETH')).not.toBeInTheDocument();
      });
    });
  });

  describe('Dropdown Behavior', () => {
    beforeEach(async () => {
      (cryptoAPI.getAll as jest.Mock).mockResolvedValue({
        data: { cryptocurrencies: mockCryptocurrencies },
      });
    });

    it('should open dropdown when input is clicked', async () => {
      render(<CryptoSelector onSelect={mockOnSelect} />);

      await waitFor(() => {
        expect(cryptoAPI.getAll).toHaveBeenCalled();
      });

      const input = screen.getByPlaceholderText(/search cryptocurrencies/i);
      
      expect(screen.queryByText('BTC')).not.toBeInTheDocument();
      
      fireEvent.click(input);

      await waitFor(() => {
        expect(screen.getByText('BTC')).toBeInTheDocument();
      });
    });

    it('should open dropdown when typing in search', async () => {
      render(<CryptoSelector onSelect={mockOnSelect} />);

      await waitFor(() => {
        expect(cryptoAPI.getAll).toHaveBeenCalled();
      });

      const input = screen.getByPlaceholderText(/search cryptocurrencies/i);
      
      fireEvent.change(input, { target: { value: 'B' } });

      await waitFor(() => {
        expect(screen.getByText('BTC')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty cryptocurrency list', async () => {
      (cryptoAPI.getAll as jest.Mock).mockResolvedValue({
        data: { cryptocurrencies: [] },
      });

      render(<CryptoSelector onSelect={mockOnSelect} />);

      const input = screen.getByPlaceholderText(/search cryptocurrencies/i);
      fireEvent.click(input);

      await waitFor(() => {
        expect(screen.getByText(/no cryptocurrencies found/i)).toBeInTheDocument();
      });
    });

    it('should handle API response without cryptocurrencies field', async () => {
      (cryptoAPI.getAll as jest.Mock).mockResolvedValue({
        data: {},
      });

      render(<CryptoSelector onSelect={mockOnSelect} />);

      const input = screen.getByPlaceholderText(/search cryptocurrencies/i);
      fireEvent.click(input);

      await waitFor(() => {
        expect(screen.getByText(/no cryptocurrencies found/i)).toBeInTheDocument();
      });
    });

    it('should handle network error gracefully', async () => {
      (cryptoAPI.getAll as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(<CryptoSelector onSelect={mockOnSelect} />);

      await waitFor(() => {
        expect(screen.getByText(/failed to load cryptocurrencies/i)).toBeInTheDocument();
      });
    });
  });
});
