/**
 * Cryptocurrency Routes Unit Tests
 * 
 * Tests cryptocurrency endpoints for listing, details, and historical data.
 * 
 * Requirements: 2.1, 2.2, 2.3, 7.1, 7.2
 */

import request from 'supertest';
import express from 'express';
import cryptocurrencyRoutes from '../cryptocurrencies';
import { ExchangeAggregator } from '../../services/ExchangeAggregator';

// Mock ExchangeAggregator
jest.mock('../../services/ExchangeAggregator');

const app = express();
app.use(express.json());
app.use('/api/cryptocurrencies', cryptocurrencyRoutes);

describe('Cryptocurrency Routes', () => {
  let mockExchangeAggregator: jest.Mocked<ExchangeAggregator>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockExchangeAggregator = new ExchangeAggregator() as jest.Mocked<ExchangeAggregator>;
  });

  describe('GET /api/cryptocurrencies', () => {
    it('should return list of all supported cryptocurrencies with data', async () => {
      // Mock exchange aggregator methods
      mockExchangeAggregator.getCurrentPrice = jest.fn()
        .mockResolvedValueOnce(50000) // BTC
        .mockResolvedValueOnce(3000)  // ETH
        .mockResolvedValueOnce(400)   // BNB
        .mockResolvedValueOnce(100)   // SOL
        .mockResolvedValueOnce(0.5);  // ADA

      mockExchangeAggregator.get24hVolume = jest.fn()
        .mockResolvedValue(1000000000);

      mockExchangeAggregator.getHistoricalData = jest.fn()
        .mockResolvedValue([
          {
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
            price: 49000,
            volume: 1000000000,
          },
        ]);

      // Replace the instance
      (ExchangeAggregator as jest.Mock).mockImplementation(() => mockExchangeAggregator);

      const response = await request(app).get('/api/cryptocurrencies');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('cryptocurrencies');
      expect(Array.isArray(response.body.cryptocurrencies)).toBe(true);
      expect(response.body.cryptocurrencies.length).toBeGreaterThanOrEqual(2);

      // Verify BTC and ETH are included (Requirement 2.4)
      const symbols = response.body.cryptocurrencies.map((c: any) => c.symbol);
      expect(symbols).toContain('BTC');
      expect(symbols).toContain('ETH');

      // Verify each cryptocurrency has required fields (Requirement 2.5)
      response.body.cryptocurrencies.forEach((crypto: any) => {
        expect(crypto).toHaveProperty('symbol');
        expect(crypto).toHaveProperty('name');
        expect(crypto.symbol).toBeTruthy();
        expect(crypto.name).toBeTruthy();
      });
    });

    it('should handle partial failures gracefully', async () => {
      // Mock some cryptocurrencies failing
      mockExchangeAggregator.getCurrentPrice = jest.fn()
        .mockResolvedValueOnce(50000) // BTC succeeds
        .mockRejectedValueOnce(new Error('Exchange unavailable')); // ETH fails

      mockExchangeAggregator.get24hVolume = jest.fn()
        .mockResolvedValue(1000000000);

      mockExchangeAggregator.getHistoricalData = jest.fn()
        .mockResolvedValue([
          {
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
            price: 49000,
            volume: 1000000000,
          },
        ]);

      (ExchangeAggregator as jest.Mock).mockImplementation(() => mockExchangeAggregator);

      const response = await request(app).get('/api/cryptocurrencies');

      expect(response.status).toBe(200);
      expect(response.body.cryptocurrencies).toBeDefined();
      
      // Should still return data with null values for failed cryptos
      const failedCrypto = response.body.cryptocurrencies.find((c: any) => c.currentPrice === null);
      expect(failedCrypto).toBeDefined();
    });
  });

  describe('GET /api/cryptocurrencies/:symbol', () => {
    it('should return specific cryptocurrency data for valid symbol', async () => {
      mockExchangeAggregator.getCurrentPrice = jest.fn().mockResolvedValue(50000);
      mockExchangeAggregator.get24hVolume = jest.fn().mockResolvedValue(1000000000);
      mockExchangeAggregator.getHistoricalData = jest.fn().mockResolvedValue([
        {
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          price: 49000,
          volume: 1000000000,
        },
      ]);

      (ExchangeAggregator as jest.Mock).mockImplementation(() => mockExchangeAggregator);

      const response = await request(app).get('/api/cryptocurrencies/BTC');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('cryptocurrency');
      expect(response.body.cryptocurrency).toMatchObject({
        symbol: 'BTC',
        name: 'Bitcoin',
        currentPrice: 50000,
        volume24h: 1000000000,
      });
      expect(response.body.cryptocurrency).toHaveProperty('change24h');
    });

    it('should handle lowercase symbol', async () => {
      mockExchangeAggregator.getCurrentPrice = jest.fn().mockResolvedValue(3000);
      mockExchangeAggregator.get24hVolume = jest.fn().mockResolvedValue(500000000);
      mockExchangeAggregator.getHistoricalData = jest.fn().mockResolvedValue([
        {
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          price: 2950,
          volume: 500000000,
        },
      ]);

      (ExchangeAggregator as jest.Mock).mockImplementation(() => mockExchangeAggregator);

      const response = await request(app).get('/api/cryptocurrencies/eth');

      expect(response.status).toBe(200);
      expect(response.body.cryptocurrency.symbol).toBe('ETH');
      expect(response.body.cryptocurrency.name).toBe('Ethereum');
    });

    it('should return 400 for unsupported cryptocurrency', async () => {
      const response = await request(app).get('/api/cryptocurrencies/INVALID');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('UNSUPPORTED_CRYPTOCURRENCY');
      expect(response.body.error.message).toContain('INVALID');
      expect(response.body.error.details).toHaveProperty('supportedSymbols');
    });

    it('should return 503 when all exchanges are unavailable', async () => {
      mockExchangeAggregator.getCurrentPrice = jest.fn()
        .mockRejectedValue(new Error('All exchanges unavailable for BTC'));

      (ExchangeAggregator as jest.Mock).mockImplementation(() => mockExchangeAggregator);

      const response = await request(app).get('/api/cryptocurrencies/BTC');

      expect(response.status).toBe(503);
      expect(response.body.error.code).toBe('SERVICE_UNAVAILABLE');
      expect(response.body.error.message).toContain('temporarily unavailable');
    });

    it('should calculate 24h change correctly', async () => {
      const currentPrice = 50000;
      const yesterdayPrice = 48000;
      const expectedChange = ((currentPrice - yesterdayPrice) / yesterdayPrice) * 100;

      mockExchangeAggregator.getCurrentPrice = jest.fn().mockResolvedValue(currentPrice);
      mockExchangeAggregator.get24hVolume = jest.fn().mockResolvedValue(1000000000);
      mockExchangeAggregator.getHistoricalData = jest.fn().mockResolvedValue([
        {
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          price: yesterdayPrice,
          volume: 1000000000,
        },
      ]);

      (ExchangeAggregator as jest.Mock).mockImplementation(() => mockExchangeAggregator);

      const response = await request(app).get('/api/cryptocurrencies/BTC');

      expect(response.status).toBe(200);
      expect(response.body.cryptocurrency.change24h).toBeCloseTo(expectedChange, 2);
    });
  });

  describe('GET /api/cryptocurrencies/:symbol/history', () => {
    it('should return historical data with default 30 days', async () => {
      const mockHistoricalData = Array.from({ length: 30 }, (_, i) => ({
        timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        price: 50000 + Math.random() * 1000,
        volume: 1000000000,
      }));

      mockExchangeAggregator.getHistoricalData = jest.fn().mockResolvedValue(mockHistoricalData);

      (ExchangeAggregator as jest.Mock).mockImplementation(() => mockExchangeAggregator);

      const response = await request(app).get('/api/cryptocurrencies/BTC/history');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(30); // Requirement 7.2
      expect(mockExchangeAggregator.getHistoricalData).toHaveBeenCalledWith('BTC', 30);
    });

    it('should accept custom days parameter', async () => {
      const mockHistoricalData = Array.from({ length: 7 }, (_, i) => ({
        timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        price: 50000 + Math.random() * 1000,
        volume: 1000000000,
      }));

      mockExchangeAggregator.getHistoricalData = jest.fn().mockResolvedValue(mockHistoricalData);

      (ExchangeAggregator as jest.Mock).mockImplementation(() => mockExchangeAggregator);

      const response = await request(app).get('/api/cryptocurrencies/BTC/history?days=7');

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(mockExchangeAggregator.getHistoricalData).toHaveBeenCalledWith('BTC', 7);
    });

    it('should return 400 for unsupported cryptocurrency', async () => {
      const response = await request(app).get('/api/cryptocurrencies/INVALID/history');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('UNSUPPORTED_CRYPTOCURRENCY');
    });

    it('should return 400 for invalid days parameter (too small)', async () => {
      const response = await request(app).get('/api/cryptocurrencies/BTC/history?days=0');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_DATE_RANGE');
      expect(response.body.error.details.validRange).toBeDefined();
    });

    it('should return 400 for invalid days parameter (too large)', async () => {
      const response = await request(app).get('/api/cryptocurrencies/BTC/history?days=500');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_DATE_RANGE');
    });

    it('should return 503 when all exchanges are unavailable', async () => {
      mockExchangeAggregator.getHistoricalData = jest.fn()
        .mockRejectedValue(new Error('All exchanges unavailable for BTC'));

      (ExchangeAggregator as jest.Mock).mockImplementation(() => mockExchangeAggregator);

      const response = await request(app).get('/api/cryptocurrencies/BTC/history');

      expect(response.status).toBe(503);
      expect(response.body.error.code).toBe('SERVICE_UNAVAILABLE');
    });

    it('should return data with timestamp, price, and volume fields', async () => {
      const mockHistoricalData = [
        {
          timestamp: new Date('2024-01-01'),
          price: 50000,
          volume: 1000000000,
        },
        {
          timestamp: new Date('2024-01-02'),
          price: 51000,
          volume: 1100000000,
        },
      ];

      mockExchangeAggregator.getHistoricalData = jest.fn().mockResolvedValue(mockHistoricalData);

      (ExchangeAggregator as jest.Mock).mockImplementation(() => mockExchangeAggregator);

      const response = await request(app).get('/api/cryptocurrencies/ETH/history?days=2');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      
      response.body.data.forEach((point: any) => {
        expect(point).toHaveProperty('timestamp');
        expect(point).toHaveProperty('price');
        expect(point).toHaveProperty('volume');
      });
    });
  });
});
