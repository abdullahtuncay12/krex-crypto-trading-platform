/**
 * Trading Signal Routes
 * 
 * Provides endpoints for retrieving trading signals and performance data.
 * Implements role-based access control to return basic or premium signals.
 * 
 * Requirements: 3.1, 4.1, 6.1
 */

import { Router, Request, Response } from 'express';
import { SignalGenerator } from '../services/SignalGenerator';
import { completedTradeRepository } from '../models/CompletedTradeRepository';
import { requireAuth } from '../middleware/auth';
import { validateCryptoSymbol } from '../middleware/validation';

const router = Router();
const signalGenerator = new SignalGenerator();

/**
 * GET /api/signals/performance
 * Get public performance data for premium signals
 * 
 * Query parameters:
 * - limit: number (optional, default 10, max 50)
 * 
 * Response:
 * - trades: Array of CompletedTrade objects
 * 
 * Requirement 6.1: Display successful premium trades at bottom of page
 * 
 * Note: This is a public endpoint (no authentication required)
 * IMPORTANT: This route must be defined BEFORE the /:symbol route to avoid conflicts
 */
router.get('/performance', async (req: Request, res: Response) => {
  try {
    // Parse limit parameter
    const limitParam = req.query.limit as string;
    let limit = 10; // Default limit

    if (limitParam) {
      const parsedLimit = parseInt(limitParam, 10);
      if (isNaN(parsedLimit) || parsedLimit < 1) {
        res.status(400).json({
          error: {
            code: 'INVALID_LIMIT',
            message: 'Limit must be a positive number',
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }
      // Cap at 50 to prevent excessive data retrieval
      limit = Math.min(parsedLimit, 50);
    }

    // Fetch recent completed trades
    const trades = await completedTradeRepository.findRecent(limit);

    res.status(200).json({
      trades,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        error: {
          code: 'PERFORMANCE_FETCH_FAILED',
          message: 'Failed to fetch performance data',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
      },
    });
  }
});

/**
 * GET /api/signals/:symbol
 * Get trading signal for a cryptocurrency
 * 
 * Path parameters:
 * - symbol: string (cryptocurrency symbol, e.g., 'BTC', 'ETH')
 * 
 * Headers:
 * - Authorization: Bearer <token> (required)
 * 
 * Response:
 * - signal: TradingSignal object (basic or premium based on user role)
 * 
 * Requirements:
 * - 3.1: Display buy, sell, or hold recommendation for normal users
 * - 4.1: Display advanced trading signals for premium users
 */
router.get('/:symbol', requireAuth, validateCryptoSymbol, async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const userRole = req.user?.role;

    // Symbol is already validated and normalized by validateCryptoSymbol middleware

    // Generate signal based on user role
    let signal;
    if (userRole === 'premium') {
      signal = await signalGenerator.generatePremiumSignal(symbol);
    } else {
      signal = await signalGenerator.generateBasicSignal(symbol);
    }

    res.status(200).json({
      signal,
    });
  } catch (error) {
    if (error instanceof Error) {
      // Handle specific errors
      if (error.message.includes('not supported') || error.message.includes('Invalid')) {
        res.status(400).json({
          error: {
            code: 'UNSUPPORTED_CRYPTOCURRENCY',
            message: `Unsupported cryptocurrency: ${req.params.symbol}`,
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      // Handle exchange API errors
      if (error.message.includes('unavailable') || error.message.includes('API')) {
        res.status(503).json({
          error: {
            code: 'SERVICE_UNAVAILABLE',
            message: 'Market data temporarily unavailable, please try again',
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      // Handle other errors
      res.status(500).json({
        error: {
          code: 'SIGNAL_GENERATION_FAILED',
          message: 'Failed to generate trading signal',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
      },
    });
  }
});

export default router;
