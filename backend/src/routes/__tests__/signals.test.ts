/**
 * Trading Signal Routes Unit Tests
 * 
 * Tests trading signal endpoints with role-based access control.
 * 
 * Requirements: 3.1, 4.1, 6.1
 */

import request from 'supertest';
import express from 'express';
import signalRoutes from '../signals';
import { SignalGenerator } from '../../services/SignalGenerator';
import { completedTradeRepository } from '../../models/CompletedTradeRepository';

// Mock dependencies
jest.mock('../../services/SignalGenerator');
jest.mock('../../models/CompletedTradeRepository');

const app = express();
app.use(express.json());
app.use('/api/signals', signalRoutes);

describe('Trading Signal Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/signals/:symbol', () => {
    const mockBasicSignal = {
      recommendation: 'buy' as const,
      confidence: 75,
      timestamp: new Date(),
      basicAnalysis: 'Technical analysis indicates a BUY signal.',
    };

    const mockPremiumSignal = {
      recommendation: 'buy' as const,
      confidence: 85,
      timestamp: new Date(),
      basicAnalysis: 'Technical analysis indicates a BUY signal.',
      stopLoss: 45000,
      limitOrder: 52000,
      riskLevel: 'medium' as const,
      detailedAnalysis: 'Advanced Technical Analysis: Current Price: 50000...',
    };

    // Create mock auth middleware
    const createMockAuthMiddleware = (role: 'normal' | 'premium') => {
      return (req: any, res: any, next: any) => {
        req.user = {
          id: role === 'premium' ? '2' : '1',
          email: `${role}@example.com`,
          name: `${role.charAt(0).toUpperCase() + role.slice(1)} User`,
          role,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        next();
      };
    };

    it('should return basic signal for normal user', async () => {
      const testApp = express();
      testApp.use(express.json());
      testApp.use('/api/signals', createMockAuthMiddleware('normal'), signalRoutes);

      (SignalGenerator.prototype.generateBasicSignal as jest.Mock).mockResolvedValue(mockBasicSignal);

      const response = await request(testApp)
        .get('/api/signals/BTC')
        .set('Authorization', 'Bearer valid_token');

      expect(response.status).toBe(200);
      expect(response.body.signal).toEqual(mockBasicSignal);
      expect(response.body.signal.stopLoss).toBeUndefined();
      expect(response.body.signal.limitOrder).toBeUndefined();
    });

    it('should return premium signal for premium user', async () => {
      const testApp = express();
      testApp.use(express.json());
      testApp.use('/api/signals', createMockAuthMiddleware('premium'), signalRoutes);

      (SignalGenerator.prototype.generatePremiumSignal as jest.Mock).mockResolvedValue(mockPremiumSignal);

      const response = await request(testApp)
        .get('/api/signals/BTC')
        .set('Authorization', 'Bearer valid_token');

      expect(response.status).toBe(200);
      expect(response.body.signal).toEqual(mockPremiumSignal);
      expect(response.body.signal.stopLoss).toBeDefined();
      expect(response.body.signal.limitOrder).toBeDefined();
      expect(response.body.signal.riskLevel).toBeDefined();
      expect(response.body.signal.detailedAnalysis).toBeDefined();
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/signals/BTC');

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('AUTHENTICATION_REQUIRED');
    });

    it('should return 400 for empty symbol', async () => {
      const testApp = express();
      testApp.use(express.json());
      testApp.use('/api/signals', createMockAuthMiddleware('normal'), signalRoutes);

      const response = await request(testApp)
        .get('/api/signals/   ')
        .set('Authorization', 'Bearer valid_token');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_SYMBOL');
    });

    it('should return 400 for unsupported cryptocurrency', async () => {
      const testApp = express();
      testApp.use(express.json());
      testApp.use('/api/signals', createMockAuthMiddleware('normal'), signalRoutes);

      (SignalGenerator.prototype.generateBasicSignal as jest.Mock).mockRejectedValue(
        new Error('Cryptocurrency not supported')
      );

      const response = await request(testApp)
        .get('/api/signals/INVALID')
        .set('Authorization', 'Bearer valid_token');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('UNSUPPORTED_CRYPTOCURRENCY');
    });

    it('should return 503 when exchange APIs are unavailable', async () => {
      const testApp = express();
      testApp.use(express.json());
      testApp.use('/api/signals', createMockAuthMiddleware('normal'), signalRoutes);

      (SignalGenerator.prototype.generateBasicSignal as jest.Mock).mockRejectedValue(
        new Error('Exchange API unavailable')
      );

      const response = await request(testApp)
        .get('/api/signals/BTC')
        .set('Authorization', 'Bearer valid_token');

      expect(response.status).toBe(503);
      expect(response.body.error.code).toBe('SERVICE_UNAVAILABLE');
    });

    it('should convert symbol to uppercase', async () => {
      const testApp = express();
      testApp.use(express.json());
      testApp.use('/api/signals', createMockAuthMiddleware('normal'), signalRoutes);

      (SignalGenerator.prototype.generateBasicSignal as jest.Mock).mockResolvedValue(mockBasicSignal);

      await request(testApp)
        .get('/api/signals/btc')
        .set('Authorization', 'Bearer valid_token');

      expect(SignalGenerator.prototype.generateBasicSignal).toHaveBeenCalledWith('BTC');
    });
  });

  describe('GET /api/signals/performance', () => {
    const mockTrades = [
      {
        id: '1',
        signalId: 'signal-1',
        cryptocurrency: 'BTC',
        entryPrice: 45000,
        exitPrice: 48000,
        profitPercent: 6.67,
        entryDate: new Date('2024-01-01'),
        exitDate: new Date('2024-01-05'),
        signalType: 'premium' as const,
      },
      {
        id: '2',
        signalId: 'signal-2',
        cryptocurrency: 'ETH',
        entryPrice: 3000,
        exitPrice: 3200,
        profitPercent: 6.67,
        entryDate: new Date('2024-01-02'),
        exitDate: new Date('2024-01-06'),
        signalType: 'premium' as const,
      },
    ];

    it('should return performance data without authentication', async () => {
      (completedTradeRepository.findRecent as jest.Mock).mockResolvedValue(mockTrades);

      const response = await request(app)
        .get('/api/signals/performance');

      expect(response.status).toBe(200);
      expect(response.body.trades).toEqual(mockTrades);
      expect(completedTradeRepository.findRecent).toHaveBeenCalledWith(10);
    });

    it('should respect limit parameter', async () => {
      (completedTradeRepository.findRecent as jest.Mock).mockResolvedValue(mockTrades.slice(0, 5));

      const response = await request(app)
        .get('/api/signals/performance?limit=5');

      expect(response.status).toBe(200);
      expect(completedTradeRepository.findRecent).toHaveBeenCalledWith(5);
    });

    it('should cap limit at 50', async () => {
      (completedTradeRepository.findRecent as jest.Mock).mockResolvedValue(mockTrades);

      const response = await request(app)
        .get('/api/signals/performance?limit=100');

      expect(response.status).toBe(200);
      expect(completedTradeRepository.findRecent).toHaveBeenCalledWith(50);
    });

    it('should return 400 for invalid limit', async () => {
      const response = await request(app)
        .get('/api/signals/performance?limit=invalid');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_LIMIT');
    });

    it('should return 400 for negative limit', async () => {
      const response = await request(app)
        .get('/api/signals/performance?limit=-5');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_LIMIT');
    });

    it('should return 400 for zero limit', async () => {
      const response = await request(app)
        .get('/api/signals/performance?limit=0');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_LIMIT');
    });

    it('should return empty array when no trades exist', async () => {
      (completedTradeRepository.findRecent as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/signals/performance');

      expect(response.status).toBe(200);
      expect(response.body.trades).toEqual([]);
    });

    it('should handle database errors gracefully', async () => {
      (completedTradeRepository.findRecent as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      const response = await request(app)
        .get('/api/signals/performance');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('PERFORMANCE_FETCH_FAILED');
    });
  });
});
