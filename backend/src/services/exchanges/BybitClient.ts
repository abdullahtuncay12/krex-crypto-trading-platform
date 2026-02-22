import { BaseExchangeClient, PricePoint } from './BaseExchangeClient';
import { config } from '../../config';

export class BybitClient extends BaseExchangeClient {
  constructor() {
    super('https://api.bybit.com', 10000);
  }

  async getCurrentPrice(symbol: string): Promise<number> {
    return this.retryWithBackoff(async () => {
      const normalizedSymbol = this.normalizeSymbol(symbol);
      const response = await this.client.get('/v5/market/tickers', {
        params: {
          category: 'spot',
          symbol: normalizedSymbol,
        },
      });

      const ticker = response.data.result?.list?.[0];
      if (!ticker || !ticker.lastPrice) {
        throw new Error(`No price data available for ${symbol}`);
      }

      return parseFloat(ticker.lastPrice);
    });
  }

  async getHistoricalData(symbol: string, days: number): Promise<PricePoint[]> {
    return this.retryWithBackoff(async () => {
      const normalizedSymbol = this.normalizeSymbol(symbol);
      const endTime = Date.now();
      const startTime = endTime - days * 24 * 60 * 60 * 1000;

      const response = await this.client.get('/v5/market/kline', {
        params: {
          category: 'spot',
          symbol: normalizedSymbol,
          interval: 'D', // Daily interval
          start: startTime,
          end: endTime,
          limit: days,
        },
      });

      const klines = response.data.result?.list || [];

      return klines.map((kline: any[]) => ({
        timestamp: new Date(parseInt(kline[0])),
        price: parseFloat(kline[4]), // Close price
        volume: parseFloat(kline[5]), // Volume
      })).reverse(); // Bybit returns data in descending order
    });
  }

  async get24hVolume(symbol: string): Promise<number> {
    return this.retryWithBackoff(async () => {
      const normalizedSymbol = this.normalizeSymbol(symbol);
      const response = await this.client.get('/v5/market/tickers', {
        params: {
          category: 'spot',
          symbol: normalizedSymbol,
        },
      });

      const ticker = response.data.result?.list?.[0];
      if (!ticker || !ticker.volume24h) {
        throw new Error(`No volume data available for ${symbol}`);
      }

      return parseFloat(ticker.volume24h);
    });
  }

  /**
   * Normalize symbol to Bybit format (e.g., BTC -> BTCUSDT)
   */
  private normalizeSymbol(symbol: string): string {
    const upperSymbol = symbol.toUpperCase();
    // If already includes USDT, return as is
    if (upperSymbol.includes('USDT')) {
      return upperSymbol;
    }
    // Otherwise append USDT
    return `${upperSymbol}USDT`;
  }
}
