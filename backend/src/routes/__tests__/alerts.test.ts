/**
 * Alert Routes Unit Tests
 * 
 * Tests alert endpoints including get alerts, save preferences, and get preferences.
 * All endpoints require authentication and premium role.
 * 
 * Requirements: 10.1, 10.3, 10.4
 */

import request from 'supertest';
import express from 'express';
import alertRoutes from '../alerts';
import { alertRepository } from '../../models/AlertRepository';
import { alertPreferencesRepository } from '../../models/AlertPreferencesRepository';

// Mock dependencies
jest.mock('../../models/AlertRepository');
jest.mock('../../models/AlertPreferencesRepository');

const app = express();
app.use(express.json());
app.use('/api/alerts', alertRoutes);

// Mock premium user for authenticated requests
const mockPremiumUser = {
  id: 'user-123',
  email: 'premium@example.com',
  name: 'Premium User',
  role: 'premium' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock normal user for testing role restrictions
const mockNormalUser = {
  id: 'user-456',
  email: 'normal@example.com',
  name: 'Normal User',
  role: 'normal' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock auth middleware for premium user
const mockPremiumAuthMiddleware = (req: any, _res: any, next: any) => {
  req.user = mockPremiumUser;
  next();
};

// Mock auth middleware for normal user
const mockNormalAuthMiddleware = (req: any, _res: any, next: any) => {
  req.user = mockNormalUser;
  next();
};

describe('Alert Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/alerts', () => {
    it('should return alerts for premium user', async () => {
      const mockAlerts = [
        {
          id: 'alert-1',
          userId: 'user-123',
          cryptocurrency: 'BTC',
          alertType: 'price_movement' as const,
          message: 'BTC price increased by 5%',
          read: false,
          createdAt: new Date(),
        },
        {
          id: 'alert-2',
          userId: 'user-123',
          cryptocurrency: 'ETH',
          alertType: 'trading_opportunity' as const,
          message: 'ETH trading opportunity detected',
          read: true,
          createdAt: new Date(),
        },
      ];

      (alertRepository.findByUserId as jest.Mock).mockResolvedValue(mockAlerts);

      const testApp = express();
      testApp.use(express.json());
      testApp.get('/api/alerts', mockPremiumAuthMiddleware, alertRoutes);

      const response = await request(testApp)
        .get('/api/alerts')
        .set('Authorization', 'Bearer valid_token');

      expect(response.status).toBe(200);
      expect(response.body.alerts).toEqual(mockAlerts);
      expect(alertRepository.findByUserId).toHaveBeenCalledWith('user-123');
    });

    it('should return empty array when user has no alerts', async () => {
      (alertRepository.findByUserId as jest.Mock).mockResolvedValue([]);

      const testApp = express();
      testApp.use(express.json());
      testApp.get('/api/alerts', mockPremiumAuthMiddleware, alertRoutes);

      const response = await request(testApp)
        .get('/api/alerts')
        .set('Authorization', 'Bearer valid_token');

      expect(response.status).toBe(200);
      expect(response.body.alerts).toEqual([]);
    });

    it('should return 500 on database error', async () => {
      (alertRepository.findByUserId as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      const testApp = express();
      testApp.use(express.json());
      testApp.get('/api/alerts', mockPremiumAuthMiddleware, alertRoutes);

      const response = await request(testApp)
        .get('/api/alerts')
        .set('Authorization', 'Bearer valid_token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('ALERTS_RETRIEVAL_FAILED');
    });
  });

  describe('POST /api/alerts/preferences', () => {
    it('should save alert preferences with valid data', async () => {
      const mockPreferences = {
        id: 'pref-123',
        userId: 'user-123',
        priceMovementThreshold: 5,
        enablePumpAlerts: true,
        cryptocurrencies: ['BTC', 'ETH'],
        updatedAt: new Date(),
      };

      (alertPreferencesRepository.upsert as jest.Mock).mockResolvedValue(mockPreferences);

      const testApp = express();
      testApp.use(express.json());
      testApp.post('/api/alerts/preferences', mockPremiumAuthMiddleware, alertRoutes);

      const response = await request(testApp)
        .post('/api/alerts/preferences')
        .set('Authorization', 'Bearer valid_token')
        .send({
          priceMovementThreshold: 5,
          enablePumpAlerts: true,
          cryptocurrencies: ['BTC', 'ETH'],
        });

      expect(response.status).toBe(200);
      expect(response.body.preferences).toEqual(mockPreferences);
      expect(alertPreferencesRepository.upsert).toHaveBeenCalledWith({
        userId: 'user-123',
        priceMovementThreshold: 5,
        enablePumpAlerts: true,
        cryptocurrencies: ['BTC', 'ETH'],
      });
    });

    it('should return 400 for missing priceMovementThreshold', async () => {
      const testApp = express();
      testApp.use(express.json());
      testApp.post('/api/alerts/preferences', mockPremiumAuthMiddleware, alertRoutes);

      const response = await request(testApp)
        .post('/api/alerts/preferences')
        .set('Authorization', 'Bearer valid_token')
        .send({
          enablePumpAlerts: true,
          cryptocurrencies: ['BTC'],
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('MISSING_REQUIRED_FIELDS');
    });

    it('should return 400 for missing enablePumpAlerts', async () => {
      const testApp = express();
      testApp.use(express.json());
      testApp.post('/api/alerts/preferences', mockPremiumAuthMiddleware, alertRoutes);

      const response = await request(testApp)
        .post('/api/alerts/preferences')
        .set('Authorization', 'Bearer valid_token')
        .send({
          priceMovementThreshold: 5,
          cryptocurrencies: ['BTC'],
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('MISSING_REQUIRED_FIELDS');
    });

    it('should return 400 for missing cryptocurrencies', async () => {
      const testApp = express();
      testApp.use(express.json());
      testApp.post('/api/alerts/preferences', mockPremiumAuthMiddleware, alertRoutes);

      const response = await request(testApp)
        .post('/api/alerts/preferences')
        .set('Authorization', 'Bearer valid_token')
        .send({
          priceMovementThreshold: 5,
          enablePumpAlerts: true,
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('MISSING_REQUIRED_FIELDS');
    });

    it('should return 400 for invalid priceMovementThreshold type', async () => {
      const testApp = express();
      testApp.use(express.json());
      testApp.post('/api/alerts/preferences', mockPremiumAuthMiddleware, alertRoutes);

      const response = await request(testApp)
        .post('/api/alerts/preferences')
        .set('Authorization', 'Bearer valid_token')
        .send({
          priceMovementThreshold: 'invalid',
          enablePumpAlerts: true,
          cryptocurrencies: ['BTC'],
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_FIELD_TYPE');
      expect(response.body.error.message).toContain('priceMovementThreshold must be a number');
    });

    it('should return 400 for invalid enablePumpAlerts type', async () => {
      const testApp = express();
      testApp.use(express.json());
      testApp.post('/api/alerts/preferences', mockPremiumAuthMiddleware, alertRoutes);

      const response = await request(testApp)
        .post('/api/alerts/preferences')
        .set('Authorization', 'Bearer valid_token')
        .send({
          priceMovementThreshold: 5,
          enablePumpAlerts: 'invalid',
          cryptocurrencies: ['BTC'],
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_FIELD_TYPE');
      expect(response.body.error.message).toContain('enablePumpAlerts must be a boolean');
    });

    it('should return 400 for invalid cryptocurrencies type', async () => {
      const testApp = express();
      testApp.use(express.json());
      testApp.post('/api/alerts/preferences', mockPremiumAuthMiddleware, alertRoutes);

      const response = await request(testApp)
        .post('/api/alerts/preferences')
        .set('Authorization', 'Bearer valid_token')
        .send({
          priceMovementThreshold: 5,
          enablePumpAlerts: true,
          cryptocurrencies: 'BTC',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_FIELD_TYPE');
      expect(response.body.error.message).toContain('cryptocurrencies must be an array');
    });

    it('should return 400 for threshold below 0', async () => {
      const testApp = express();
      testApp.use(express.json());
      testApp.post('/api/alerts/preferences', mockPremiumAuthMiddleware, alertRoutes);

      const response = await request(testApp)
        .post('/api/alerts/preferences')
        .set('Authorization', 'Bearer valid_token')
        .send({
          priceMovementThreshold: -1,
          enablePumpAlerts: true,
          cryptocurrencies: ['BTC'],
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_THRESHOLD');
      expect(response.body.error.message).toContain('must be between 0 and 100');
    });

    it('should return 400 for threshold above 100', async () => {
      const testApp = express();
      testApp.use(express.json());
      testApp.post('/api/alerts/preferences', mockPremiumAuthMiddleware, alertRoutes);

      const response = await request(testApp)
        .post('/api/alerts/preferences')
        .set('Authorization', 'Bearer valid_token')
        .send({
          priceMovementThreshold: 101,
          enablePumpAlerts: true,
          cryptocurrencies: ['BTC'],
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_THRESHOLD');
    });

    it('should accept threshold of 0', async () => {
      const mockPreferences = {
        id: 'pref-123',
        userId: 'user-123',
        priceMovementThreshold: 0,
        enablePumpAlerts: true,
        cryptocurrencies: ['BTC'],
        updatedAt: new Date(),
      };

      (alertPreferencesRepository.upsert as jest.Mock).mockResolvedValue(mockPreferences);

      const testApp = express();
      testApp.use(express.json());
      testApp.post('/api/alerts/preferences', mockPremiumAuthMiddleware, alertRoutes);

      const response = await request(testApp)
        .post('/api/alerts/preferences')
        .set('Authorization', 'Bearer valid_token')
        .send({
          priceMovementThreshold: 0,
          enablePumpAlerts: true,
          cryptocurrencies: ['BTC'],
        });

      expect(response.status).toBe(200);
      expect(response.body.preferences.priceMovementThreshold).toBe(0);
    });

    it('should accept threshold of 100', async () => {
      const mockPreferences = {
        id: 'pref-123',
        userId: 'user-123',
        priceMovementThreshold: 100,
        enablePumpAlerts: false,
        cryptocurrencies: ['ETH'],
        updatedAt: new Date(),
      };

      (alertPreferencesRepository.upsert as jest.Mock).mockResolvedValue(mockPreferences);

      const testApp = express();
      testApp.use(express.json());
      testApp.post('/api/alerts/preferences', mockPremiumAuthMiddleware, alertRoutes);

      const response = await request(testApp)
        .post('/api/alerts/preferences')
        .set('Authorization', 'Bearer valid_token')
        .send({
          priceMovementThreshold: 100,
          enablePumpAlerts: false,
          cryptocurrencies: ['ETH'],
        });

      expect(response.status).toBe(200);
      expect(response.body.preferences.priceMovementThreshold).toBe(100);
    });

    it('should accept empty cryptocurrencies array', async () => {
      const mockPreferences = {
        id: 'pref-123',
        userId: 'user-123',
        priceMovementThreshold: 10,
        enablePumpAlerts: false,
        cryptocurrencies: [],
        updatedAt: new Date(),
      };

      (alertPreferencesRepository.upsert as jest.Mock).mockResolvedValue(mockPreferences);

      const testApp = express();
      testApp.use(express.json());
      testApp.post('/api/alerts/preferences', mockPremiumAuthMiddleware, alertRoutes);

      const response = await request(testApp)
        .post('/api/alerts/preferences')
        .set('Authorization', 'Bearer valid_token')
        .send({
          priceMovementThreshold: 10,
          enablePumpAlerts: false,
          cryptocurrencies: [],
        });

      expect(response.status).toBe(200);
      expect(response.body.preferences.cryptocurrencies).toEqual([]);
    });

    it('should return 500 on database error', async () => {
      (alertPreferencesRepository.upsert as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      const testApp = express();
      testApp.use(express.json());
      testApp.post('/api/alerts/preferences', mockPremiumAuthMiddleware, alertRoutes);

      const response = await request(testApp)
        .post('/api/alerts/preferences')
        .set('Authorization', 'Bearer valid_token')
        .send({
          priceMovementThreshold: 5,
          enablePumpAlerts: true,
          cryptocurrencies: ['BTC'],
        });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('PREFERENCES_SAVE_FAILED');
    });
  });

  describe('GET /api/alerts/preferences', () => {
    it('should return alert preferences for premium user', async () => {
      const mockPreferences = {
        id: 'pref-123',
        userId: 'user-123',
        priceMovementThreshold: 5,
        enablePumpAlerts: true,
        cryptocurrencies: ['BTC', 'ETH', 'ADA'],
        updatedAt: new Date(),
      };

      (alertPreferencesRepository.findByUserId as jest.Mock).mockResolvedValue(mockPreferences);

      const testApp = express();
      testApp.use(express.json());
      testApp.get('/api/alerts/preferences', mockPremiumAuthMiddleware, alertRoutes);

      const response = await request(testApp)
        .get('/api/alerts/preferences')
        .set('Authorization', 'Bearer valid_token');

      expect(response.status).toBe(200);
      expect(response.body.preferences).toEqual(mockPreferences);
      expect(alertPreferencesRepository.findByUserId).toHaveBeenCalledWith('user-123');
    });

    it('should return null when user has no preferences', async () => {
      (alertPreferencesRepository.findByUserId as jest.Mock).mockResolvedValue(null);

      const testApp = express();
      testApp.use(express.json());
      testApp.get('/api/alerts/preferences', mockPremiumAuthMiddleware, alertRoutes);

      const response = await request(testApp)
        .get('/api/alerts/preferences')
        .set('Authorization', 'Bearer valid_token');

      expect(response.status).toBe(200);
      expect(response.body.preferences).toBeNull();
    });

    it('should return 500 on database error', async () => {
      (alertPreferencesRepository.findByUserId as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      const testApp = express();
      testApp.use(express.json());
      testApp.get('/api/alerts/preferences', mockPremiumAuthMiddleware, alertRoutes);

      const response = await request(testApp)
        .get('/api/alerts/preferences')
        .set('Authorization', 'Bearer valid_token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('PREFERENCES_RETRIEVAL_FAILED');
    });
  });
});
