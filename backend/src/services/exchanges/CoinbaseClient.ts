import { BaseExchangeClient, PricePoint } from './BaseExchangeClient';
import { config } from '../../config';

export class CoinbaseClient extends BaseExchangeClient {
  constructor() {
    super('https://api.coinbase.com', 10000);
  }

  async getCurrentPrice(symbol: string): Promise<number> {
    return this.retryWithBackoff(async () => {
      const normalizedSymbol = this.normalizeSymbol(symbol);
      const response = await this.client.get(`/v2/prices/${normalizedSymbol}/spot`);
      return parseFloat(response.data.data.amount);
    });
  }

  async getHistoricalData(symbol: string, days: number): Promise<PricePoint[]> {
    return this.retryWithBackoff(async () => {
      const normalizedSymbol = this.normalizeSymbol(symbol);
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

      // Coinbase API uses product ID format for historical data
      const productId = this.toProductId(symbol);
      
      // Get candles data (granularity: 86400 = 1 day)
      const response = await this.client.get(`/v2/prices/${normalizedSymbol}/historic`, {
        params: {
          period: 'day',
        },
      });

      // Coinbase returns prices array, we need to transform it
      const prices = response.data.data.prices || [];
      
      return prices.slice(0, days).map((item: any) => ({
        timestamp: new Date(item.time),
        price: parseFloat(item.price),
        volume: 0, // Coinbase v2 API doesn't provide volume in historic endpoint
      }));
    });
  }

  async get24hVolume(symbol: string): Promise<number> {
    return this.retryWithBackoff(async () => {
      // Coinbase v2 API doesn't have a direct 24h volume endpoint
      // We'll use the exchange rates endpoint and return 0 as a placeholder
      // In production, you'd want to use Coinbase Pro API for volume data
      const productId = this.toProductId(symbol);
      
      try {
        // Try to get stats from Coinbase Pro API
        const response = await this.client.get(
          `https://api.exchange.coinbase.com/products/${productId}/stats`
        );
        return parseFloat(response.data.volume || '0');
      } catch (error) {
        // Fallback to 0 if stats not available
        return 0;
      }
    });
  }

  /**
   * Normalize symbol to Coinbase format (e.g., BTC -> BTC-USD)
   */
  private normalizeSymbol(symbol: string): string {
    const upperSymbol = symbol.toUpperCase();
    // If already includes USD, return as is
    if (upperSymbol.includes('-USD')) {
      return upperSymbol;
    }
    // Otherwise append -USD
    return `${upperSymbol}-USD`;
  }

  /**
   * Convert symbol to product ID format (e.g., BTC -> BTC-USD)
   */
  private toProductId(symbol: string): string {
    return this.normalizeSymbol(symbol);
  }
}
