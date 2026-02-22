import { ExchangeAggregator } from '../ExchangeAggregator';
import { BinanceClient } from '../exchanges/BinanceClient';
import { CoinbaseClient } from '../exchanges/CoinbaseClient';
import { BybitClient } from '../exchanges/BybitClient';
import { PricePoint } from '../exchanges/BaseExchangeClient';
import { redisClient } from '../../config/redis';

// Mock the exchange clients
jest.mock('../exchanges/BinanceClient');
jest.mock('../exchanges/CoinbaseClient');
jest.mock('../exchanges/BybitClient');
jest.mock('../../config/redis', () => ({
  redisClient: {
    get: jest.fn(),
    setEx: jest.fn(),
  },
}));

describe('ExchangeAggregator', () => {
  let aggregator: ExchangeAggregator;
  let mockBinanceClient: jest.Mocked<BinanceClient>;
  let mockCoinbaseClient: jest.Mocked<CoinbaseClient>;
  let mockBybitClient: jest.Mocked<BybitClient>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create aggregator instance
    aggregator = new ExchangeAggregator();

    // Get mocked instances
    mockBinanceClient = (aggregator as any).binanceClient;
    mockCoinbaseClient = (aggregator as any).coinbaseClient;
    mockBybitClient = (aggregator as any).bybitClient;
  });

  describe('getCurrentPrice', () => {
    it('should return cached price if available', async () => {
      const cachedPrice = 50000;
      (redisClient.get as jest.Mock).mockResolvedValue(JSON.stringify(cachedPrice));

      const result = await aggregator.getCurrentPrice('BTC');

      expect(result).toBe(cachedPrice);
      expect(redisClient.get).toHaveBeenCalledWith('price:BTC');
      expect(mockBinanceClient.getCurrentPrice).not.toHaveBeenCalled();
    });

    it('should aggregate prices from multiple exchanges', async () => {
      (redisClient.get as jest.Mock).mockResolvedValue(null);
      mockBinanceClient.getCurrentPrice = jest.fn().mockResolvedValue(50000);
      mockCoinbaseClient.getCurrentPrice = jest.fn().mockResolvedValue(50100);
      mockBybitClient.getCurrentPrice = jest.fn().mockResolvedValue(49900);

      const result = await aggregator.getCurrentPrice('BTC');

      expect(result).toBe(50000); // Average of 50000, 50100, 49900
      expect(mockBinanceClient.getCurrentPrice).toHaveBeenCalledWith('BTC');
      expect(mockCoinbaseClient.getCurrentPrice).toHaveBeenCalledWith('BTC');
      expect(mockBybitClient.getCurrentPrice).toHaveBeenCalledWith('BTC');
      expect(redisClient.setEx).toHaveBeenCalledWith('price:BTC', 30, JSON.stringify(50000));
    });

    it('should handle partial failures and use available exchanges', async () => {
      (redisClient.get as jest.Mock).mockResolvedValue(null);
      mockBinanceClient.getCurrentPrice = jest.fn().mockResolvedValue(50000);
      mockCoinbaseClient.getCurrentPrice = jest.fn().mockRejectedValue(new Error('API Error'));
      mockBybitClient.getCurrentPrice = jest.fn().mockResolvedValue(50200);

      const result = await aggregator.getCurrentPrice('BTC');

      expect(result).toBe(50100); // Average of 50000 and 50200
      expect(redisClient.setEx).toHaveBeenCalledWith('price:BTC', 30, JSON.stringify(50100));
    });

    it('should throw error when all exchanges are unavailable', async () => {
      (redisClient.get as jest.Mock).mockResolvedValue(null);
      mockBinanceClient.getCurrentPrice = jest.fn().mockRejectedValue(new Error('API Error'));
      mockCoinbaseClient.getCurrentPrice = jest.fn().mockRejectedValue(new Error('API Error'));
      mockBybitClient.getCurrentPrice = jest.fn().mockRejectedValue(new Error('API Error'));

      await expect(aggregator.getCurrentPrice('BTC')).rejects.toThrow(
        'All exchanges unavailable for BTC'
      );
    });

    it('should handle Redis cache errors gracefully', async () => {
      (redisClient.get as jest.Mock).mockRejectedValue(new Error('Redis Error'));
      mockBinanceClient.getCurrentPrice = jest.fn().mockResolvedValue(50000);
      mockCoinbaseClient.getCurrentPrice = jest.fn().mockResolvedValue(50000);
      mockBybitClient.getCurrentPrice = jest.fn().mockResolvedValue(50000);

      const result = await aggregator.getCurrentPrice('BTC');

      expect(result).toBe(50000);
    });
  });

  describe('getHistoricalData', () => {
    const mockHistoricalData: PricePoint[] = [
      { timestamp: new Date('2024-01-01'), price: 45000, volume: 1000 },
      { timestamp: new Date('2024-01-02'), price: 46000, volume: 1100 },
    ];

    it('should return cached historical data if available', async () => {
      (redisClient.get as jest.Mock).mockResolvedValue(JSON.stringify(mockHistoricalData));

      const result = await aggregator.getHistoricalData('BTC', 30);

      expect(result).toEqual(mockHistoricalData);
      expect(redisClient.get).toHaveBeenCalledWith('history:BTC:30');
      expect(mockBinanceClient.getHistoricalData).not.toHaveBeenCalled();
    });

    it('should aggregate historical data from multiple exchanges', async () => {
      (redisClient.get as jest.Mock).mockResolvedValue(null);
      const binanceData: PricePoint[] = [
        { timestamp: new Date('2024-01-01'), price: 45000, volume: 1000 },
      ];
      const coinbaseData: PricePoint[] = [
        { timestamp: new Date('2024-01-01'), price: 45100, volume: 1050 },
      ];
      const bybitData: PricePoint[] = [
        { timestamp: new Date('2024-01-01'), price: 44900, volume: 950 },
      ];

      mockBinanceClient.getHistoricalData = jest.fn().mockResolvedValue(binanceData);
      mockCoinbaseClient.getHistoricalData = jest.fn().mockResolvedValue(coinbaseData);
      mockBybitClient.getHistoricalData = jest.fn().mockResolvedValue(bybitData);

      const result = await aggregator.getHistoricalData('BTC', 30);

      expect(result).toHaveLength(1);
      expect(result[0].price).toBe(45000); // Average of 45000, 45100, 44900
      expect(result[0].volume).toBe(1000); // Average of 1000, 1050, 950
      expect(mockBinanceClient.getHistoricalData).toHaveBeenCalledWith('BTC', 30);
      expect(mockCoinbaseClient.getHistoricalData).toHaveBeenCalledWith('BTC', 30);
      expect(mockBybitClient.getHistoricalData).toHaveBeenCalledWith('BTC', 30);
    });

    it('should handle partial failures in historical data fetching', async () => {
      (redisClient.get as jest.Mock).mockResolvedValue(null);
      mockBinanceClient.getHistoricalData = jest.fn().mockResolvedValue(mockHistoricalData);
      mockCoinbaseClient.getHistoricalData = jest.fn().mockRejectedValue(new Error('API Error'));
      mockBybitClient.getHistoricalData = jest.fn().mockResolvedValue(mockHistoricalData);

      const result = await aggregator.getHistoricalData('BTC', 30);

      expect(result).toHaveLength(2);
      expect(result[0].price).toBe(45000); // Average from Binance and Bybit
    });

    it('should throw error when all exchanges fail for historical data', async () => {
      (redisClient.get as jest.Mock).mockResolvedValue(null);
      mockBinanceClient.getHistoricalData = jest.fn().mockRejectedValue(new Error('API Error'));
      mockCoinbaseClient.getHistoricalData = jest.fn().mockRejectedValue(new Error('API Error'));
      mockBybitClient.getHistoricalData = jest.fn().mockRejectedValue(new Error('API Error'));

      await expect(aggregator.getHistoricalData('BTC', 30)).rejects.toThrow(
        'All exchanges unavailable for BTC'
      );
    });

    it('should merge historical data with different timestamps', async () => {
      (redisClient.get as jest.Mock).mockResolvedValue(null);
      const binanceData: PricePoint[] = [
        { timestamp: new Date('2024-01-01'), price: 45000, volume: 1000 },
        { timestamp: new Date('2024-01-02'), price: 46000, volume: 1100 },
      ];
      const coinbaseData: PricePoint[] = [
        { timestamp: new Date('2024-01-01'), price: 45100, volume: 1050 },
        { timestamp: new Date('2024-01-03'), price: 47000, volume: 1200 },
      ];

      mockBinanceClient.getHistoricalData = jest.fn().mockResolvedValue(binanceData);
      mockCoinbaseClient.getHistoricalData = jest.fn().mockResolvedValue(coinbaseData);
      mockBybitClient.getHistoricalData = jest.fn().mockResolvedValue([]);

      const result = await aggregator.getHistoricalData('BTC', 30);

      expect(result).toHaveLength(3);
      expect(result[0].timestamp).toEqual(new Date('2024-01-01'));
      expect(result[1].timestamp).toEqual(new Date('2024-01-02'));
      expect(result[2].timestamp).toEqual(new Date('2024-01-03'));
    });
  });

  describe('get24hVolume', () => {
    it('should return cached volume if available', async () => {
      const cachedVolume = 1000000;
      (redisClient.get as jest.Mock).mockResolvedValue(JSON.stringify(cachedVolume));

      const result = await aggregator.get24hVolume('BTC');

      expect(result).toBe(cachedVolume);
      expect(redisClient.get).toHaveBeenCalledWith('volume:BTC');
      expect(mockBinanceClient.get24hVolume).not.toHaveBeenCalled();
    });

    it('should aggregate volumes from multiple exchanges', async () => {
      (redisClient.get as jest.Mock).mockResolvedValue(null);
      mockBinanceClient.get24hVolume = jest.fn().mockResolvedValue(1000000);
      mockCoinbaseClient.get24hVolume = jest.fn().mockResolvedValue(1100000);
      mockBybitClient.get24hVolume = jest.fn().mockResolvedValue(900000);

      const result = await aggregator.get24hVolume('BTC');

      expect(result).toBe(1000000); // Average of 1000000, 1100000, 900000
      expect(mockBinanceClient.get24hVolume).toHaveBeenCalledWith('BTC');
      expect(mockCoinbaseClient.get24hVolume).toHaveBeenCalledWith('BTC');
      expect(mockBybitClient.get24hVolume).toHaveBeenCalledWith('BTC');
      expect(redisClient.setEx).toHaveBeenCalledWith('volume:BTC', 30, JSON.stringify(1000000));
    });

    it('should handle partial failures in volume fetching', async () => {
      (redisClient.get as jest.Mock).mockResolvedValue(null);
      mockBinanceClient.get24hVolume = jest.fn().mockResolvedValue(1000000);
      mockCoinbaseClient.get24hVolume = jest.fn().mockRejectedValue(new Error('API Error'));
      mockBybitClient.get24hVolume = jest.fn().mockResolvedValue(1000000);

      const result = await aggregator.get24hVolume('BTC');

      expect(result).toBe(1000000); // Average of 1000000 and 1000000
    });

    it('should throw error when all exchanges fail for volume', async () => {
      (redisClient.get as jest.Mock).mockResolvedValue(null);
      mockBinanceClient.get24hVolume = jest.fn().mockRejectedValue(new Error('API Error'));
      mockCoinbaseClient.get24hVolume = jest.fn().mockRejectedValue(new Error('API Error'));
      mockBybitClient.get24hVolume = jest.fn().mockRejectedValue(new Error('API Error'));

      await expect(aggregator.get24hVolume('BTC')).rejects.toThrow(
        'All exchanges unavailable for BTC'
      );
    });
  });

  describe('caching behavior', () => {
    it('should cache data with 30-second TTL', async () => {
      (redisClient.get as jest.Mock).mockResolvedValue(null);
      mockBinanceClient.getCurrentPrice = jest.fn().mockResolvedValue(50000);
      mockCoinbaseClient.getCurrentPrice = jest.fn().mockResolvedValue(50000);
      mockBybitClient.getCurrentPrice = jest.fn().mockResolvedValue(50000);

      await aggregator.getCurrentPrice('BTC');

      expect(redisClient.setEx).toHaveBeenCalledWith('price:BTC', 30, expect.any(String));
    });

    it('should handle Redis setEx errors gracefully', async () => {
      (redisClient.get as jest.Mock).mockResolvedValue(null);
      (redisClient.setEx as jest.Mock).mockRejectedValue(new Error('Redis Error'));
      mockBinanceClient.getCurrentPrice = jest.fn().mockResolvedValue(50000);
      mockCoinbaseClient.getCurrentPrice = jest.fn().mockResolvedValue(50000);
      mockBybitClient.getCurrentPrice = jest.fn().mockResolvedValue(50000);

      const result = await aggregator.getCurrentPrice('BTC');

      expect(result).toBe(50000);
    });
  });
});

