/**
 * Cryptocurrency Routes
 * 
 * Provides public endpoints for cryptocurrency data and historical prices.
 * Uses ExchangeAggregator service to fetch data from multiple exchanges.
 * 
 * Requirements: 2.1, 2.2, 2.3, 7.1, 7.2
 */

import { Router, Request, Response } from 'express';
import { ExchangeAggregator } from '../services/ExchangeAggregator';
import { validateCryptoSymbol, validateDateRange } from '../middleware/validation';

const router = Router();
const exchangeAggregator = new ExchangeAggregator();

/**
 * Supported cryptocurrencies
 * Requirement 2.4: System SHALL support at least BTC and ETH
 */
const SUPPORTED_CRYPTOCURRENCIES = [
  { symbol: 'BTC', name: 'Bitcoin' },
  { symbol: 'ETH', name: 'Ethereum' },
  { symbol: 'BNB', name: 'Binance Coin' },
  { symbol: 'SOL', name: 'Solana' },
  { symbol: 'ADA', name: 'Cardano' },
];

/**
 * GET /api/cryptocurrencies
 * List all supported cryptocurrencies
 * 
 * Response:
 * - cryptocurrencies: Array of cryptocurrency objects with symbol and name
 * 
 * Requirement 2.1: Display list of supported cryptocurrencies
 * Requirement 2.5: Show coin symbol and name
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    // Fetch current prices for all supported cryptocurrencies
    const cryptocurrenciesWithPrices = await Promise.all(
      SUPPORTED_CRYPTOCURRENCIES.map(async (crypto) => {
        try {
          const currentPrice = await exchangeAggregator.getCurrentPrice(crypto.symbol);
          const volume24h = await exchangeAggregator.get24hVolume(crypto.symbol);
          
          // Calculate 24h change (simplified - using cached data)
          const historicalData = await exchangeAggregator.getHistoricalData(crypto.symbol, 1);
          const change24h = historicalData.length > 0
            ? ((currentPrice - historicalData[0].price) / historicalData[0].price) * 100
            : 0;

          return {
            symbol: crypto.symbol,
            name: crypto.name,
            currentPrice,
            change24h,
            volume24h,
          };
        } catch (error) {
          // If data fetch fails for a specific crypto, return with null values
          console.warn(`Failed to fetch data for ${crypto.symbol}:`, error);
          return {
            symbol: crypto.symbol,
            name: crypto.name,
            currentPrice: null,
            change24h: null,
            volume24h: null,
          };
        }
      })
    );

    res.status(200).json({
      cryptocurrencies: cryptocurrenciesWithPrices,
    });
  } catch (error) {
    console.error('Error fetching cryptocurrencies:', error);
    res.status(500).json({
      error: {
        code: 'FETCH_FAILED',
        message: 'Failed to fetch cryptocurrency data',
        timestamp: new Date().toISOString(),
      },
    });
  }
});

/**
 * GET /api/cryptocurrencies/:symbol
 * Get specific cryptocurrency data
 * 
 * Parameters:
 * - symbol: Cryptocurrency symbol (e.g., 'BTC', 'ETH')
 * 
 * Response:
 * - cryptocurrency: Object with symbol, name, currentPrice, change24h, volume24h
 * 
 * Requirement 2.3: Display trading signals for selected coin
 * Requirement 2.5: Show coin symbol and name
 */
router.get('/:symbol', validateCryptoSymbol, async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    // Symbol is already validated and normalized by validateCryptoSymbol middleware

    // Find crypto info
    const crypto = SUPPORTED_CRYPTOCURRENCIES.find((c) => c.symbol === symbol);

    // Fetch current data
    const currentPrice = await exchangeAggregator.getCurrentPrice(symbol);
    const volume24h = await exchangeAggregator.get24hVolume(symbol);
    
    // Calculate 24h change
    const historicalData = await exchangeAggregator.getHistoricalData(symbol, 1);
    const change24h = historicalData.length > 0
      ? ((currentPrice - historicalData[0].price) / historicalData[0].price) * 100
      : 0;

    res.status(200).json({
      cryptocurrency: {
        symbol: crypto.symbol,
        name: crypto.name,
        currentPrice,
        change24h,
        volume24h,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      // Handle exchange unavailable error
      if (error.message.includes('All exchanges unavailable')) {
        res.status(503).json({
          error: {
            code: 'SERVICE_UNAVAILABLE',
            message: 'Market data temporarily unavailable, please try again',
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }
    }

    console.error('Error fetching cryptocurrency data:', error);
    res.status(500).json({
      error: {
        code: 'FETCH_FAILED',
        message: 'Failed to fetch cryptocurrency data',
        timestamp: new Date().toISOString(),
      },
    });
  }
});

/**
 * GET /api/cryptocurrencies/:symbol/history
 * Get historical price data for a cryptocurrency
 * 
 * Parameters:
 * - symbol: Cryptocurrency symbol (e.g., 'BTC', 'ETH')
 * 
 * Query parameters:
 * - days: Number of days of historical data (optional, default: 30)
 * 
 * Response:
 * - data: Array of price points with timestamp, price, and volume
 * 
 * Requirement 7.1: Display historical price data
 * Requirement 7.2: Show at least 30 days of price history
 */
router.get('/:symbol/history', validateCryptoSymbol, validateDateRange, async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    // Symbol is already validated and normalized by validateCryptoSymbol middleware
    const days = parseInt(req.query.days as string) || 30;

    // Find crypto info
    const crypto = SUPPORTED_CRYPTOCURRENCIES.find((c) => c.symbol === symbol);

    // Fetch historical data
    const historicalData = await exchangeAggregator.getHistoricalData(symbol, days);

    res.status(200).json({
      data: historicalData,
    });
  } catch (error) {
    if (error instanceof Error) {
      // Handle exchange unavailable error
      if (error.message.includes('All exchanges unavailable')) {
        res.status(503).json({
          error: {
            code: 'SERVICE_UNAVAILABLE',
            message: 'Market data temporarily unavailable, please try again',
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }
    }

    console.error('Error fetching historical data:', error);
    res.status(500).json({
      error: {
        code: 'FETCH_FAILED',
        message: 'Failed to fetch historical data',
        timestamp: new Date().toISOString(),
      },
    });
  }
});

export default router;
