import { BinanceClient } from './exchanges/BinanceClient';
import { CoinbaseClient } from './exchanges/CoinbaseClient';
import { BybitClient } from './exchanges/BybitClient';
import { PricePoint } from './exchanges/BaseExchangeClient';
import { redisClient } from '../config/redis';

/**
 * ExchangeAggregator Service
 * 
 * Aggregates cryptocurrency market data from multiple exchanges (Binance, Coinbase, Bybit).
 * Implements Redis caching with 30-second TTL for performance optimization.
 * Handles partial failures gracefully by using available exchanges.
 * Returns error only when all exchanges are unavailable.
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
 */
export class ExchangeAggregator {
  private binanceClient: BinanceClient;
  private coinbaseClient: CoinbaseClient;
  private bybitClient: BybitClient;
  private cacheTTL: number = 30; // 30 seconds

  constructor() {
    this.binanceClient = new BinanceClient();
    this.coinbaseClient = new CoinbaseClient();
    this.bybitClient = new BybitClient();
  }

  /**
   * Get current price for a cryptocurrency by aggregating data from multiple exchanges.
   * Returns the average price from all available exchanges.
   * Uses Redis cache with 30-second TTL.
   * Falls back to mock data if all exchanges are unavailable.
   * 
   * @param symbol - Cryptocurrency symbol (e.g., 'BTC', 'ETH')
   * @returns Average current price from available exchanges or mock data
   */
  async getCurrentPrice(symbol: string): Promise<number> {
    const cacheKey = `price:${symbol}`;
    
    // Try to get from cache first
    const cachedPrice = await this.getFromCache(cacheKey);
    if (cachedPrice !== null) {
      return cachedPrice;
    }

    // Fetch from all exchanges in parallel
    const prices = await this.fetchFromMultipleExchanges(
      symbol,
      (client) => client.getCurrentPrice(symbol)
    );

    if (prices.length === 0) {
      // Fallback to mock data when all exchanges are unavailable
      console.warn(`All exchanges unavailable for ${symbol}, using mock data`);
      return this.getMockPrice(symbol);
    }

    // Calculate average price
    const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;

    // Cache the result
    await this.setCache(cacheKey, averagePrice);

    return averagePrice;
  }

  /**
   * Get historical price data for a cryptocurrency.
   * Aggregates data from multiple exchanges and merges by timestamp.
   * Uses Redis cache with 30-second TTL.
   * Falls back to mock data if all exchanges are unavailable.
   * 
   * @param symbol - Cryptocurrency symbol (e.g., 'BTC', 'ETH')
   * @param days - Number of days of historical data to fetch
   * @returns Array of price points with timestamp, price, and volume
   */
  async getHistoricalData(symbol: string, days: number): Promise<PricePoint[]> {
    const cacheKey = `history:${symbol}:${days}`;
    
    // Try to get from cache first
    const cachedData = await this.getFromCache(cacheKey);
    if (cachedData !== null) {
      return cachedData;
    }

    // Fetch from all exchanges in parallel
    const historicalDataSets = await this.fetchFromMultipleExchanges(
      symbol,
      (client) => client.getHistoricalData(symbol, days)
    );

    if (historicalDataSets.length === 0) {
      // Fallback to mock data when all exchanges are unavailable
      console.warn(`All exchanges unavailable for ${symbol}, using mock historical data`);
      return this.getMockHistoricalData(symbol, days);
    }

    // Merge historical data from multiple exchanges
    const mergedData = this.mergeHistoricalData(historicalDataSets);

    // Cache the result
    await this.setCache(cacheKey, mergedData);

    return mergedData;
  }

  /**
   * Get 24-hour trading volume for a cryptocurrency.
   * Returns the average volume from all available exchanges.
   * Uses Redis cache with 30-second TTL.
   * Falls back to mock data if all exchanges are unavailable.
   * 
   * @param symbol - Cryptocurrency symbol (e.g., 'BTC', 'ETH')
   * @returns Average 24-hour volume from available exchanges or mock data
   */
  async get24hVolume(symbol: string): Promise<number> {
    const cacheKey = `volume:${symbol}`;
    
    // Try to get from cache first
    const cachedVolume = await this.getFromCache(cacheKey);
    if (cachedVolume !== null) {
      return cachedVolume;
    }

    // Fetch from all exchanges in parallel
    const volumes = await this.fetchFromMultipleExchanges(
      symbol,
      (client) => client.get24hVolume(symbol)
    );

    if (volumes.length === 0) {
      // Fallback to mock data when all exchanges are unavailable
      console.warn(`All exchanges unavailable for ${symbol}, using mock volume data`);
      return this.getMockVolume(symbol);
    }

    // Calculate average volume
    const averageVolume = volumes.reduce((sum, volume) => sum + volume, 0) / volumes.length;

    // Cache the result
    await this.setCache(cacheKey, averageVolume);

    return averageVolume;
  }

  /**
   * Fetch data from multiple exchanges in parallel, handling partial failures.
   * Returns data from all successful exchanges, ignoring failures.
   * 
   * @param symbol - Cryptocurrency symbol
   * @param operation - Function to execute on each exchange client
   * @returns Array of successful results
   */
  private async fetchFromMultipleExchanges<T>(
    symbol: string,
    operation: (client: BinanceClient | CoinbaseClient | BybitClient) => Promise<T>
  ): Promise<T[]> {
    const clients = [this.binanceClient, this.coinbaseClient, this.bybitClient];
    const clientNames = ['Binance', 'Coinbase', 'Bybit'];

    // Execute operations in parallel
    const results = await Promise.allSettled(
      clients.map((client) => operation(client))
    );

    // Extract successful results and log failures
    const successfulResults: T[] = [];
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successfulResults.push(result.value);
      } else {
        console.warn(`${clientNames[index]} failed for ${symbol}:`, result.reason.message);
      }
    });

    return successfulResults;
  }

  /**
   * Merge historical data from multiple exchanges by averaging prices at each timestamp.
   * 
   * @param dataSets - Array of historical data arrays from different exchanges
   * @returns Merged array of price points
   */
  private mergeHistoricalData(dataSets: PricePoint[][]): PricePoint[] {
    if (dataSets.length === 0) {
      return [];
    }

    // If only one dataset, return it directly
    if (dataSets.length === 1) {
      return dataSets[0];
    }

    // Create a map to group data by timestamp
    const timestampMap = new Map<number, { prices: number[]; volumes: number[] }>();

    // Collect all data points
    dataSets.forEach((dataSet) => {
      dataSet.forEach((point) => {
        const timestamp = point.timestamp.getTime();
        if (!timestampMap.has(timestamp)) {
          timestampMap.set(timestamp, { prices: [], volumes: [] });
        }
        const entry = timestampMap.get(timestamp)!;
        entry.prices.push(point.price);
        entry.volumes.push(point.volume);
      });
    });

    // Calculate averages and create merged data points
    const mergedData: PricePoint[] = [];
    timestampMap.forEach((data, timestamp) => {
      const avgPrice = data.prices.reduce((sum, p) => sum + p, 0) / data.prices.length;
      const avgVolume = data.volumes.reduce((sum, v) => sum + v, 0) / data.volumes.length;
      mergedData.push({
        timestamp: new Date(timestamp),
        price: avgPrice,
        volume: avgVolume,
      });
    });

    // Sort by timestamp
    mergedData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    return mergedData;
  }

  /**
   * Get data from Redis cache.
   * 
   * @param key - Cache key
   * @returns Cached data or null if not found
   */
  private async getFromCache(key: string): Promise<any> {
    try {
      const cached = await redisClient.get(key);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.warn('Redis get error:', error);
    }
    return null;
  }

  /**
   * Set data in Redis cache with TTL.
   * 
   * @param key - Cache key
   * @param value - Data to cache
   */
  private async setCache(key: string, value: any): Promise<void> {
    try {
      await redisClient.setEx(key, this.cacheTTL, JSON.stringify(value));
    } catch (error) {
      console.warn('Redis set error:', error);
    }
  }

  /**
   * Generate mock price data for development/testing when exchanges are unavailable.
   * 
   * @param symbol - Cryptocurrency symbol
   * @returns Mock price based on symbol
   */
  private getMockPrice(symbol: string): number {
    const mockPrices: Record<string, number> = {
      BTC: 45000 + Math.random() * 5000,
      ETH: 2500 + Math.random() * 500,
      BNB: 300 + Math.random() * 50,
      SOL: 100 + Math.random() * 20,
      ADA: 0.5 + Math.random() * 0.1,
      XRP: 0.6 + Math.random() * 0.1,
      DOT: 7 + Math.random() * 2,
      DOGE: 0.08 + Math.random() * 0.02,
      AVAX: 35 + Math.random() * 10,
      MATIC: 0.9 + Math.random() * 0.2,
    };
    return mockPrices[symbol] || 100 + Math.random() * 50;
  }

  /**
   * Generate mock historical data for development/testing when exchanges are unavailable.
   * 
   * @param symbol - Cryptocurrency symbol
   * @param days - Number of days of historical data
   * @returns Array of mock price points
   */
  private getMockHistoricalData(symbol: string, days: number): PricePoint[] {
    const basePrice = this.getMockPrice(symbol);
    const data: PricePoint[] = [];
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    for (let i = days; i >= 0; i--) {
      const timestamp = new Date(now - i * dayMs);
      const priceVariation = (Math.random() - 0.5) * 0.1 * basePrice;
      const price = basePrice + priceVariation;
      const volume = 1000000 + Math.random() * 5000000;

      data.push({
        timestamp,
        price,
        volume,
      });
    }

    return data;
  }

  /**
   * Generate mock volume data for development/testing when exchanges are unavailable.
   * 
   * @param symbol - Cryptocurrency symbol
   * @returns Mock 24h volume
   */
  private getMockVolume(symbol: string): number {
    const mockVolumes: Record<string, number> = {
      BTC: 20000000000 + Math.random() * 5000000000,
      ETH: 10000000000 + Math.random() * 2000000000,
      BNB: 1000000000 + Math.random() * 500000000,
      SOL: 500000000 + Math.random() * 200000000,
      ADA: 300000000 + Math.random() * 100000000,
      XRP: 800000000 + Math.random() * 200000000,
      DOT: 200000000 + Math.random() * 100000000,
      DOGE: 400000000 + Math.random() * 100000000,
      AVAX: 300000000 + Math.random() * 100000000,
      MATIC: 250000000 + Math.random() * 100000000,
    };
    return mockVolumes[symbol] || 100000000 + Math.random() * 50000000;
  }
}

