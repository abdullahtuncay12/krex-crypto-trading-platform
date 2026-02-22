import axios, { AxiosInstance, AxiosError } from 'axios';

export interface PricePoint {
  timestamp: Date;
  price: number;
  volume: number;
}

export interface ExchangeClientInterface {
  getCurrentPrice(symbol: string): Promise<number>;
  getHistoricalData(symbol: string, days: number): Promise<PricePoint[]>;
  get24hVolume(symbol: string): Promise<number>;
}

export abstract class BaseExchangeClient implements ExchangeClientInterface {
  protected client: AxiosInstance;
  protected maxRetries: number = 5;
  protected baseDelay: number = 1000; // 1 second

  constructor(baseURL: string, timeout: number = 10000) {
    this.client = axios.create({
      baseURL,
      timeout,
    });
  }

  abstract getCurrentPrice(symbol: string): Promise<number>;
  abstract getHistoricalData(symbol: string, days: number): Promise<PricePoint[]>;
  abstract get24hVolume(symbol: string): Promise<number>;

  /**
   * Retry logic with exponential backoff
   * Delays: 1s, 2s, 4s, 8s, 16s (max)
   */
  protected async retryWithBackoff<T>(
    operation: () => Promise<T>,
    retries: number = this.maxRetries
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on client errors (4xx)
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;
          if (axiosError.response && axiosError.response.status >= 400 && axiosError.response.status < 500) {
            throw error;
          }
        }

        // Calculate exponential backoff delay (capped at 16 seconds)
        const delay = Math.min(this.baseDelay * Math.pow(2, attempt), 16000);
        
        // Don't wait after the last attempt
        if (attempt < retries - 1) {
          await this.sleep(delay);
        }
      }
    }

    throw lastError || new Error('Operation failed after retries');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
