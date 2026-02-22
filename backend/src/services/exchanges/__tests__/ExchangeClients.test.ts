/**
 * Exchange Client Unit Tests
 * 
 * Tests exchange client wrappers with retry logic.
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */

import { BinanceClient } from '../BinanceClient';
import { CoinbaseClient } from '../CoinbaseClient';
import { BybitClient } from '../BybitClient';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Exchange Clients', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock axios.create to return a mock instance
    mockedAxios.create = jest.fn().mockReturnValue({
      get: jest.fn(),
    });
  });

  describe('BinanceClient', () => {
    let client: BinanceClient;
    let mockGet: jest.Mock;

    beforeEach(() => {
      client = new BinanceClient();
      mockGet = (client as any).client.get;
    });

    it('should get current price successfully', async () => {
      mockGet.mockResolvedValue({
        data: { price: '50000.00' },
      });

      const price = await client.getCurrentPrice('BTC');

      expect(mockGet).toHaveBeenCalledWith('/api/v3/ticker/price', {
        params: { symbol: 'BTCUSDT' },
      });
      expect(price).toBe(50000);
    });

    it('should get historical data successfully', async () => {
      const mockKlines = [
        [1609459200000, '29000', '30000', '28000', '29500', '1000'],
        [1609545600000, '29500', '31000', '29000', '30500', '1100'],
      ];

      mockGet.mockResolvedValue({
        data: mockKlines,
      });

      const data = await client.getHistoricalData('BTC', 2);

      expect(mockGet).toHaveBeenCalled();
      expect(data).toHaveLength(2);
      expect(data[0].price).toBe(29500);
      expect(data[0].volume).toBe(1000);
      expect(data[1].price).toBe(30500);
    });

    it('should get 24h volume successfully', async () => {
      mockGet.mockResolvedValue({
        data: { volume: '25000.50' },
      });

      const volume = await client.get24hVolume('BTC');

      expect(mockGet).toHaveBeenCalledWith('/api/v3/ticker/24hr', {
        params: { symbol: 'BTCUSDT' },
      });
      expect(volume).toBe(25000.50);
    });

    it('should normalize symbol correctly', async () => {
      mockGet.mockResolvedValue({
        data: { price: '50000.00' },
      });

      await client.getCurrentPrice('btc');
      expect(mockGet).toHaveBeenCalledWith('/api/v3/ticker/price', {
        params: { symbol: 'BTCUSDT' },
      });

      await client.getCurrentPrice('BTCUSDT');
      expect(mockGet).toHaveBeenCalledWith('/api/v3/ticker/price', {
        params: { symbol: 'BTCUSDT' },
      });
    });
  });

  describe('CoinbaseClient', () => {
    let client: CoinbaseClient;
    let mockGet: jest.Mock;

    beforeEach(() => {
      client = new CoinbaseClient();
      mockGet = (client as any).client.get;
    });

    it('should get current price successfully', async () => {
      mockGet.mockResolvedValue({
        data: { data: { amount: '50000.00' } },
      });

      const price = await client.getCurrentPrice('BTC');

      expect(mockGet).toHaveBeenCalledWith('/v2/prices/BTC-USD/spot');
      expect(price).toBe(50000);
    });

    it('should get historical data successfully', async () => {
      mockGet.mockResolvedValue({
        data: {
          data: {
            prices: [
              { time: '2021-01-01T00:00:00Z', price: '29500' },
              { time: '2021-01-02T00:00:00Z', price: '30500' },
            ],
          },
        },
      });

      const data = await client.getHistoricalData('BTC', 2);

      expect(mockGet).toHaveBeenCalled();
      expect(data).toHaveLength(2);
      expect(data[0].price).toBe(29500);
      expect(data[1].price).toBe(30500);
    });

    it('should normalize symbol correctly', async () => {
      mockGet.mockResolvedValue({
        data: { data: { amount: '50000.00' } },
      });

      await client.getCurrentPrice('eth');
      expect(mockGet).toHaveBeenCalledWith('/v2/prices/ETH-USD/spot');

      await client.getCurrentPrice('BTC-USD');
      expect(mockGet).toHaveBeenCalledWith('/v2/prices/BTC-USD/spot');
    });
  });

  describe('BybitClient', () => {
    let client: BybitClient;
    let mockGet: jest.Mock;

    beforeEach(() => {
      client = new BybitClient();
      mockGet = (client as any).client.get;
    });

    it('should get current price successfully', async () => {
      mockGet.mockResolvedValue({
        data: {
          result: {
            list: [{ lastPrice: '50000.00' }],
          },
        },
      });

      const price = await client.getCurrentPrice('BTC');

      expect(mockGet).toHaveBeenCalledWith('/v5/market/tickers', {
        params: { category: 'spot', symbol: 'BTCUSDT' },
      });
      expect(price).toBe(50000);
    });

    it('should get historical data successfully', async () => {
      mockGet.mockResolvedValue({
        data: {
          result: {
            list: [
              ['1609545600000', '29500', '31000', '29000', '30500', '1100'],
              ['1609459200000', '29000', '30000', '28000', '29500', '1000'],
            ],
          },
        },
      });

      const data = await client.getHistoricalData('BTC', 2);

      expect(mockGet).toHaveBeenCalled();
      expect(data).toHaveLength(2);
      // Data should be reversed (Bybit returns descending order)
      expect(data[0].price).toBe(29500);
      expect(data[1].price).toBe(30500);
    });

    it('should get 24h volume successfully', async () => {
      mockGet.mockResolvedValue({
        data: {
          result: {
            list: [{ volume24h: '25000.50' }],
          },
        },
      });

      const volume = await client.get24hVolume('BTC');

      expect(mockGet).toHaveBeenCalledWith('/v5/market/tickers', {
        params: { category: 'spot', symbol: 'BTCUSDT' },
      });
      expect(volume).toBe(25000.50);
    });

    it('should throw error when no price data available', async () => {
      mockGet.mockResolvedValue({
        data: { result: { list: [] } },
      });

      await expect(client.getCurrentPrice('BTC')).rejects.toThrow(
        'No price data available for BTC'
      );
    });
  });

  describe('Retry Logic', () => {
    let client: BinanceClient;
    let mockGet: jest.Mock;

    beforeEach(() => {
      client = new BinanceClient();
      mockGet = (client as any).client.get;
      // Speed up tests by reducing retry delays
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should retry on network error with exponential backoff', async () => {
      const networkError = new Error('Network error');
      mockGet
        .mockRejectedValueOnce(networkError)
        .mockRejectedValueOnce(networkError)
        .mockResolvedValueOnce({ data: { price: '50000.00' } });

      const pricePromise = client.getCurrentPrice('BTC');

      // Fast-forward through retry delays
      await jest.runAllTimersAsync();

      const price = await pricePromise;

      expect(mockGet).toHaveBeenCalledTimes(3);
      expect(price).toBe(50000);
    });

    it('should not retry on 4xx client errors', async () => {
      const clientError = {
        isAxiosError: true,
        response: { status: 400 },
      };
      mockedAxios.isAxiosError = jest.fn().mockReturnValue(true);
      mockGet.mockRejectedValue(clientError);

      await expect(client.getCurrentPrice('BTC')).rejects.toEqual(clientError);
      expect(mockGet).toHaveBeenCalledTimes(1);
    });

    it('should throw error after max retries', async () => {
      const networkError = new Error('Network error');
      mockGet.mockRejectedValue(networkError);

      const pricePromise = client.getCurrentPrice('BTC');

      // Fast-forward through all retry delays
      await jest.runAllTimersAsync();

      await expect(pricePromise).rejects.toThrow('Network error');
      expect(mockGet).toHaveBeenCalledTimes(5); // Initial + 4 retries
    });
  });
});
