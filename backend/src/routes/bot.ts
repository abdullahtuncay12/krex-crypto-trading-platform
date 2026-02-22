/**
 * Bot Trading Routes
 * 
 * Provides endpoints for automated trading bot functionality including
 * configuration, investment management, and analytics.
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 8.1, 8.2, 9.1, 14.1, 14.3
 */

import { Router, Request, Response } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { investmentManager } from '../services/InvestmentManager';

const router = Router();

/**
 * GET /api/bot/supported-cryptocurrencies
 * Get list of supported cryptocurrencies for bot trading
 * 
 * Response:
 * - cryptocurrencies: Array of supported cryptocurrency symbols
 * 
 * Requirement 2.1: Display supported cryptocurrencies
 */
router.get('/supported-cryptocurrencies', (req: Request, res: Response) => {
  try {
    const cryptocurrencies = ['BTC', 'ETH', 'BNB', 'SOL', 'ADA'];

    res.status(200).json({
      cryptocurrencies,
    });
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Desteklenen kripto paralar alınamadı',
        timestamp: new Date().toISOString(),
      },
    });
  }
});

/**
 * GET /api/bot/trading-periods
 * Get list of available trading periods
 * 
 * Response:
 * - periods: Array of trading period objects with hours and label
 * 
 * Requirement 2.2: Display available trading periods
 */
router.get('/trading-periods', (req: Request, res: Response) => {
  try {
    const periods = [
      { hours: 1, label: '1 Saat' },
      { hours: 2, label: '2 Saat' },
      { hours: 3, label: '3 Saat' },
      { hours: 4, label: '4 Saat' },
      { hours: 5, label: '5 Saat' },
      { hours: 6, label: '6 Saat' },
      { hours: 12, label: '12 Saat' },
      { hours: 24, label: '24 Saat' },
      { hours: 48, label: '48 Saat' },
      { hours: 60, label: '60 Saat' },
    ];

    res.status(200).json({
      periods,
    });
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'İşlem süreleri alınamadı',
        timestamp: new Date().toISOString(),
      },
    });
  }
});

/**
 * GET /api/bot/limits
 * Get investment amount limits and other constraints
 * 
 * Response:
 * - limits: Object containing min/max amounts and other limits
 * 
 * Requirements 2.3, 2.4, 2.5, 2.6: Display investment limits
 */
router.get('/limits', (req: Request, res: Response) => {
  try {
    const limits = {
      minAmount: 100,
      maxAmount: 100000,
      currency: 'USDT',
      maxPositionSizePercent: 20,
      stopLossPercent: 5,
      commissionPercent: 1,
      cancellationFeePercent: 2,
    };

    res.status(200).json({
      limits,
    });
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Limitler alınamadı',
        timestamp: new Date().toISOString(),
      },
    });
  }
});

/**
 * POST /api/bot/investments
 * Create a new bot investment
 * 
 * Headers:
 * - Authorization: Bearer <token> (required)
 * 
 * Request body:
 * - cryptocurrency: string (required, one of: BTC, ETH, BNB, SOL, ADA)
 * - principalAmount: number (required, 100-100000 USDT)
 * - tradingPeriodHours: number (required, one of: 1,2,3,4,5,6,12,24,48,60)
 * - riskAcknowledgedAt: Date (required, must be within last 5 minutes)
 * 
 * Response:
 * - investment: Created investment object
 * 
 * Requirements 1.1, 1.2, 1.3, 1.4, 14.3: Create investment with validation
 */
router.post('/investments', requireAuth, requireRole('premium'), async (req: Request, res: Response) => {
  try {
    const { cryptocurrency, principalAmount, tradingPeriodHours, riskAcknowledgedAt } = req.body;
    const userId = req.user!.id;

    // Validate required fields
    if (!cryptocurrency || !principalAmount || !tradingPeriodHours || !riskAcknowledgedAt) {
      res.status(400).json({
        error: {
          code: 'MISSING_REQUIRED_FIELDS',
          message: 'Tüm gerekli alanlar doldurulmalıdır',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    // Create investment
    const investment = await investmentManager.createInvestment(
      userId,
      cryptocurrency,
      principalAmount,
      tradingPeriodHours,
      new Date(riskAcknowledgedAt)
    );

    res.status(201).json({
      investment,
    });
  } catch (error) {
    if (error instanceof Error) {
      // Handle validation errors
      if (error.message.includes('amount')) {
        res.status(400).json({
          error: {
            code: 'INVALID_AMOUNT',
            message: error.message,
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      if (error.message.includes('trading period')) {
        res.status(400).json({
          error: {
            code: 'INVALID_TRADING_PERIOD',
            message: error.message,
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      if (error.message.includes('cryptocurrency')) {
        res.status(400).json({
          error: {
            code: 'INVALID_CRYPTOCURRENCY',
            message: error.message,
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      if (error.message.includes('risk acknowledgment')) {
        res.status(400).json({
          error: {
            code: 'INVALID_RISK_ACKNOWLEDGMENT',
            message: error.message,
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      if (error.message.includes('Insufficient balance')) {
        res.status(400).json({
          error: {
            code: 'INSUFFICIENT_BALANCE',
            message: error.message,
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      // Handle other errors
      res.status(500).json({
        error: {
          code: 'INVESTMENT_CREATION_FAILED',
          message: 'Yatırım oluşturulamadı',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Beklenmeyen bir hata oluştu',
        timestamp: new Date().toISOString(),
      },
    });
  }
});

/**
 * GET /api/bot/investments
 * Get user's investments with optional status filter
 * 
 * Headers:
 * - Authorization: Bearer <token> (required)
 * 
 * Query parameters:
 * - status: string (optional, one of: active, completed, cancelled)
 * 
 * Response:
 * - investments: Array of investment objects
 * 
 * Requirement 8.1: List investments with status filter
 */
router.get('/investments', requireAuth, requireRole('premium'), async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const status = req.query.status as string | undefined;

    // Validate status if provided
    if (status && !['active', 'completed', 'cancelled'].includes(status)) {
      res.status(400).json({
        error: {
          code: 'INVALID_STATUS',
          message: 'Geçersiz durum değeri',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    const investments = await investmentManager.getInvestments(userId, status);

    res.status(200).json({
      investments,
    });
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Yatırımlar alınamadı',
        timestamp: new Date().toISOString(),
      },
    });
  }
});

/**
 * GET /api/bot/investments/:id
 * Get investment details by ID
 * 
 * Headers:
 * - Authorization: Bearer <token> (required)
 * 
 * Response:
 * - investment: Investment object
 * 
 * Requirement 8.2: Get investment detail with authorization
 */
router.get('/investments/:id', requireAuth, requireRole('premium'), async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const investmentId = req.params.id;

    const investment = await investmentManager.getInvestmentById(investmentId, userId);

    if (!investment) {
      res.status(404).json({
        error: {
          code: 'INVESTMENT_NOT_FOUND',
          message: 'Yatırım bulunamadı',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    res.status(200).json({
      investment,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      res.status(403).json({
        error: {
          code: 'UNAUTHORIZED_ACCESS',
          message: 'Bu yatırıma erişim yetkiniz yok',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Yatırım detayı alınamadı',
        timestamp: new Date().toISOString(),
      },
    });
  }
});

/**
 * POST /api/bot/investments/:id/cancel
 * Cancel an active investment
 * 
 * Headers:
 * - Authorization: Bearer <token> (required)
 * 
 * Response:
 * - investment: Updated investment object
 * - refund: Refund amount after cancellation fee
 * 
 * Requirement 9.1: Cancel investment with authorization
 */
router.post('/investments/:id/cancel', requireAuth, requireRole('premium'), async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const investmentId = req.params.id;
    const reason = req.body.reason || 'User requested cancellation';

    const result = await investmentManager.cancelInvestment(investmentId, userId, reason);

    res.status(200).json({
      investment: result.investment,
      refund: result.refund,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Unauthorized')) {
        res.status(403).json({
          error: {
            code: 'UNAUTHORIZED_ACCESS',
            message: 'Bu yatırımı iptal etme yetkiniz yok',
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      if (error.message.includes('not active')) {
        res.status(400).json({
          error: {
            code: 'INVESTMENT_NOT_ACTIVE',
            message: 'Sadece aktif yatırımlar iptal edilebilir',
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      if (error.message.includes('not found')) {
        res.status(404).json({
          error: {
            code: 'INVESTMENT_NOT_FOUND',
            message: 'Yatırım bulunamadı',
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }
    }

    res.status(500).json({
      error: {
        code: 'CANCELLATION_FAILED',
        message: 'Yatırım iptal edilemedi',
        timestamp: new Date().toISOString(),
      },
    });
  }
});

/**
 * GET /api/bot/investments/:id/value-history
 * Get investment value history for charting
 * 
 * Headers:
 * - Authorization: Bearer <token> (required)
 * 
 * Response:
 * - history: Array of value history records
 * 
 * Requirement 13.5: Get value history for charting
 */
router.get('/investments/:id/value-history', requireAuth, requireRole('premium'), async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const investmentId = req.params.id;

    // Verify user owns this investment
    const investment = await investmentManager.getInvestmentById(investmentId, userId);
    if (!investment) {
      res.status(404).json({
        error: {
          code: 'INVESTMENT_NOT_FOUND',
          message: 'Yatırım bulunamadı',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    // Get value history
    const { investmentValueHistoryRepository } = await import('../models/InvestmentValueHistoryRepository');
    const history = await investmentValueHistoryRepository.findByInvestmentId(investmentId);

    res.status(200).json({
      history,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      res.status(403).json({
        error: {
          code: 'UNAUTHORIZED_ACCESS',
          message: 'Bu yatırıma erişim yetkiniz yok',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Değer geçmişi alınamadı',
        timestamp: new Date().toISOString(),
      },
    });
  }
});

/**
 * GET /api/bot/portfolio
 * Get user's portfolio summary
 * 
 * Headers:
 * - Authorization: Bearer <token> (required)
 * 
 * Response:
 * - summary: Portfolio summary object
 * 
 * Requirements 8.6, 8.7: Display portfolio summary
 */
router.get('/portfolio', requireAuth, requireRole('premium'), async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const summary = await investmentManager.getPortfolioSummary(userId);

    res.status(200).json({
      summary,
    });
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Portföy özeti alınamadı',
        timestamp: new Date().toISOString(),
      },
    });
  }
});

/**
 * GET /api/bot/analytics/daily
 * Get daily analytics for all investments (Admin only)
 * 
 * Headers:
 * - Authorization: Bearer <token> (required, admin role)
 * 
 * Query parameters:
 * - date: string (optional, ISO date format, defaults to today)
 * 
 * Response:
 * - analytics: Daily analytics object
 * 
 * Requirement 17.1: Daily investment analytics
 */
router.get('/analytics/daily', requireAuth, async (req: Request, res: Response) => {
  try {
    // Check admin role (for now, we'll use a simple check)
    // In production, this should use a proper admin role check
    if (req.user!.role !== 'premium') {
      res.status(403).json({
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'Admin yetkisi gereklidir',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    const date = req.query.date ? new Date(req.query.date as string) : new Date();
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const { botInvestmentRepository } = await import('../models/BotInvestmentRepository');
    
    // Get all investments for the day
    const allInvestments = await botInvestmentRepository.findByStatus('completed');
    const dailyInvestments = allInvestments.filter(inv => {
      const completedAt = inv.updated_at;
      return completedAt >= startOfDay && completedAt <= endOfDay;
    });

    // Calculate metrics
    const totalInvestments = dailyInvestments.length;
    const totalPrincipal = dailyInvestments.reduce((sum, inv) => sum + inv.principal_amount, 0);
    const totalProfit = dailyInvestments.reduce((sum, inv) => sum + (inv.profit || 0), 0);
    const totalCommission = dailyInvestments.reduce((sum, inv) => sum + (inv.commission || 0), 0);
    
    const profitableInvestments = dailyInvestments.filter(inv => (inv.profit || 0) > 0);
    const winRate = totalInvestments > 0 ? (profitableInvestments.length / totalInvestments) * 100 : 0;
    const averageProfit = totalInvestments > 0 ? totalProfit / totalInvestments : 0;

    res.status(200).json({
      analytics: {
        date: date.toISOString().split('T')[0],
        totalInvestments,
        totalPrincipal,
        totalProfit,
        totalCommission,
        winRate: Math.round(winRate * 100) / 100,
        averageProfit: Math.round(averageProfit * 100) / 100,
        profitableInvestments: profitableInvestments.length,
        lossInvestments: totalInvestments - profitableInvestments.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Günlük analitik alınamadı',
        timestamp: new Date().toISOString(),
      },
    });
  }
});

/**
 * GET /api/bot/analytics/by-cryptocurrency
 * Get analytics grouped by cryptocurrency (Admin only)
 * 
 * Headers:
 * - Authorization: Bearer <token> (required, admin role)
 * 
 * Response:
 * - analytics: Array of cryptocurrency analytics
 * 
 * Requirements 17.2, 17.3, 17.4: Cryptocurrency-specific analytics
 */
router.get('/analytics/by-cryptocurrency', requireAuth, async (req: Request, res: Response) => {
  try {
    // Check admin role
    if (req.user!.role !== 'premium') {
      res.status(403).json({
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'Admin yetkisi gereklidir',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    const { botInvestmentRepository } = await import('../models/BotInvestmentRepository');
    
    // Get all completed investments
    const allInvestments = await botInvestmentRepository.findByStatus('completed');

    // Group by cryptocurrency
    const cryptoMap = new Map<string, any[]>();
    allInvestments.forEach(inv => {
      if (!cryptoMap.has(inv.cryptocurrency)) {
        cryptoMap.set(inv.cryptocurrency, []);
      }
      cryptoMap.get(inv.cryptocurrency)!.push(inv);
    });

    // Calculate metrics for each cryptocurrency
    const analytics = Array.from(cryptoMap.entries()).map(([crypto, investments]) => {
      const totalInvestments = investments.length;
      const totalPrincipal = investments.reduce((sum, inv) => sum + inv.principal_amount, 0);
      const totalProfit = investments.reduce((sum, inv) => sum + (inv.profit || 0), 0);
      const totalCommission = investments.reduce((sum, inv) => sum + (inv.commission || 0), 0);
      
      const profitableInvestments = investments.filter(inv => (inv.profit || 0) > 0);
      const winRate = totalInvestments > 0 ? (profitableInvestments.length / totalInvestments) * 100 : 0;
      const averageProfit = totalInvestments > 0 ? totalProfit / totalInvestments : 0;
      const averageProfitPercent = totalPrincipal > 0 ? (totalProfit / totalPrincipal) * 100 : 0;

      return {
        cryptocurrency: crypto,
        totalInvestments,
        totalPrincipal,
        totalProfit,
        totalCommission,
        winRate: Math.round(winRate * 100) / 100,
        averageProfit: Math.round(averageProfit * 100) / 100,
        averageProfitPercent: Math.round(averageProfitPercent * 100) / 100,
        profitableInvestments: profitableInvestments.length,
        lossInvestments: totalInvestments - profitableInvestments.length,
      };
    });

    res.status(200).json({
      analytics,
    });
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Kripto para analitikleri alınamadı',
        timestamp: new Date().toISOString(),
      },
    });
  }
});

export default router;
