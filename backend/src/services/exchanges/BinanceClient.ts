import { BaseExchangeClient, PricePoint } from './BaseExchangeClient';
import { config } from '../../config';

export class BinanceClient extends BaseExchangeClient {
  constructor() {
    super('https://api.binance.com', 10000);
  }

  async getCurrentPrice(symbol: string): Promise<number> {
    return this.retryWithBackoff(async () => {
      const normalizedSymbol = this.normalizeSymbol(symbol);
      const response = await this.client.get('/api/v3/ticker/price', {
        params: { symbol: normalizedSymbol },
      });
      return parseFloat(response.data.price);
    });
  }

  async getHistoricalData(symbol: string, days: number): Promise<PricePoint[]> {
    return this.retryWithBackoff(async () => {
      const normalizedSymbol = this.normalizeSymbol(symbol);
      const interval = '1d';
      const endTime = Date.now();
      const startTime = endTime - days * 24 * 60 * 60 * 1000;

      const response = await this.client.get('/api/v3/klines', {
        params: {
          symbol: normalizedSymbol,
          interval,
          startTime,
          endTime,
          limit: days,
        },
      });

      return response.data.map((kline: any[]) => ({
        timestamp: new Date(kline[0]),
        price: parseFloat(kline[4]), // Close price
        volume: parseFloat(kline[5]), // Volume
      }));
    });
  }

  async get24hVolume(symbol: string): Promise<number> {
    return this.retryWithBackoff(async () => {
      const normalizedSymbol = this.normalizeSymbol(symbol);
      const response = await this.client.get('/api/v3/ticker/24hr', {
        params: { symbol: normalizedSymbol },
      });
      return parseFloat(response.data.volume);
    });
  }

  /**
   * Normalize symbol to Binance format (e.g., BTC -> BTCUSDT)
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
