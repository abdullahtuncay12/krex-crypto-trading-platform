/**
 * Subscription Routes Unit Tests
 * 
 * Tests subscription endpoints including upgrade, cancel, status, and webhooks.
 * 
 * Requirements: 8.1, 8.2, 8.4
 */

import request from 'supertest';
import express from 'express';
import subscriptionRoutes from '../subscriptions';
import { subscriptionManager } from '../../services/SubscriptionManager';
import { subscriptionRepository } from '../../models/SubscriptionRepository';

// Mock dependencies
jest.mock('../../services/SubscriptionManager');
jest.mock('../../models/SubscriptionRepository');

const app = express();
app.use(express.json());
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/webhooks', subscriptionRoutes);

// Mock user for authenticated requests
const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  role: 'normal' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock auth middleware
const mockAuthMiddleware = (req: any, res: any, next: any) => {
  req.user = mockUser;
  next();
};

describe('Subscription Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/subscriptions/upgrade', () => {
    it('should upgrade user to premium with valid data', async () => {
      const mockSubscription = {
        id: 'sub-123',
        userId: 'user-123',
        planId: 'price_premium',
        status: 'active' as const,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: false,
        stripeSubscriptionId: 'sub_stripe_123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (subscriptionManager.createSubscription as jest.Mock).mockResolvedValue(mockSubscription);

      // Create test app with mocked auth
      const testApp = express();
      testApp.use(express.json());
      testApp.post('/api/subscriptions/upgrade', mockAuthMiddleware, subscriptionRoutes);

      const response = await request(testApp)
        .post('/api/subscriptions/upgrade')
        .set('Authorization', 'Bearer valid_token')
        .send({
          planId: 'price_premium',
          paymentMethodId: 'pm_card_visa',
        });

      expect(response.status).toBe(201);
      expect(response.body.subscription).toEqual(mockSubscription);
      expect(subscriptionManager.createSubscription).toHaveBeenCalledWith(
        'user-123',
        'price_premium',
        'pm_card_visa'
      );
    });

    it('should return 400 for missing planId', async () => {
      const testApp = express();
      testApp.use(express.json());
      testApp.post('/api/subscriptions/upgrade', mockAuthMiddleware, subscriptionRoutes);

      const response = await request(testApp)
        .post('/api/subscriptions/upgrade')
        .set('Authorization', 'Bearer valid_token')
        .send({
          paymentMethodId: 'pm_card_visa',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('MISSING_REQUIRED_FIELDS');
    });

    it('should return 400 for missing paymentMethodId', async () => {
      const testApp = express();
      testApp.use(express.json());
      testApp.post('/api/subscriptions/upgrade', mockAuthMiddleware, subscriptionRoutes);

      const response = await request(testApp)
        .post('/api/subscriptions/upgrade')
        .set('Authorization', 'Bearer valid_token')
        .send({
          planId: 'price_premium',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('MISSING_REQUIRED_FIELDS');
    });

    it('should return 409 for user with active subscription', async () => {
      (subscriptionManager.createSubscription as jest.Mock).mockRejectedValue(
        new Error('User already has an active subscription')
      );

      const testApp = express();
      testApp.use(express.json());
      testApp.post('/api/subscriptions/upgrade', mockAuthMiddleware, subscriptionRoutes);

      const response = await request(testApp)
        .post('/api/subscriptions/upgrade')
        .set('Authorization', 'Bearer valid_token')
        .send({
          planId: 'price_premium',
          paymentMethodId: 'pm_card_visa',
        });

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe('SUBSCRIPTION_ALREADY_ACTIVE');
    });

    it('should return 404 for non-existent user', async () => {
      (subscriptionManager.createSubscription as jest.Mock).mockRejectedValue(
        new Error('User not found')
      );

      const testApp = express();
      testApp.use(express.json());
      testApp.post('/api/subscriptions/upgrade', mockAuthMiddleware, subscriptionRoutes);

      const response = await request(testApp)
        .post('/api/subscriptions/upgrade')
        .set('Authorization', 'Bearer valid_token')
        .send({
          planId: 'price_premium',
          paymentMethodId: 'pm_card_visa',
        });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('USER_NOT_FOUND');
    });
  });

  describe('POST /api/subscriptions/cancel', () => {
    it('should cancel active subscription', async () => {
      const mockSubscription = {
        id: 'sub-123',
        userId: 'user-123',
        planId: 'price_premium',
        status: 'active' as const,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: true,
        stripeSubscriptionId: 'sub_stripe_123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (subscriptionManager.cancelSubscription as jest.Mock).mockResolvedValue(mockSubscription);

      const testApp = express();
      testApp.use(express.json());
      testApp.post('/api/subscriptions/cancel', mockAuthMiddleware, subscriptionRoutes);

      const response = await request(testApp)
        .post('/api/subscriptions/cancel')
        .set('Authorization', 'Bearer valid_token');

      expect(response.status).toBe(200);
      expect(response.body.subscription).toEqual(mockSubscription);
      expect(response.body.subscription.cancelAtPeriodEnd).toBe(true);
      expect(subscriptionManager.cancelSubscription).toHaveBeenCalledWith('user-123');
    });

    it('should return 404 for user without subscription', async () => {
      (subscriptionManager.cancelSubscription as jest.Mock).mockRejectedValue(
        new Error('No subscription found for user')
      );

      const testApp = express();
      testApp.use(express.json());
      testApp.post('/api/subscriptions/cancel', mockAuthMiddleware, subscriptionRoutes);

      const response = await request(testApp)
        .post('/api/subscriptions/cancel')
        .set('Authorization', 'Bearer valid_token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('SUBSCRIPTION_NOT_FOUND');
    });

    it('should return 400 for inactive subscription', async () => {
      (subscriptionManager.cancelSubscription as jest.Mock).mockRejectedValue(
        new Error('Subscription is not active')
      );

      const testApp = express();
      testApp.use(express.json());
      testApp.post('/api/subscriptions/cancel', mockAuthMiddleware, subscriptionRoutes);

      const response = await request(testApp)
        .post('/api/subscriptions/cancel')
        .set('Authorization', 'Bearer valid_token');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('SUBSCRIPTION_NOT_ACTIVE');
    });
  });

  describe('GET /api/subscriptions/status', () => {
    it('should return subscription status for user with active subscription', async () => {
      const mockSubscription = {
        id: 'sub-123',
        userId: 'user-123',
        planId: 'price_premium',
        status: 'active' as const,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: false,
        stripeSubscriptionId: 'sub_stripe_123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (subscriptionRepository.findByUserId as jest.Mock).mockResolvedValue(mockSubscription);

      const testApp = express();
      testApp.use(express.json());
      testApp.get('/api/subscriptions/status', mockAuthMiddleware, subscriptionRoutes);

      const response = await request(testApp)
        .get('/api/subscriptions/status')
        .set('Authorization', 'Bearer valid_token');

      expect(response.status).toBe(200);
      expect(response.body.subscription).toEqual(mockSubscription);
      expect(response.body.status).toBe('active');
    });

    it('should return none status for user without subscription', async () => {
      (subscriptionRepository.findByUserId as jest.Mock).mockResolvedValue(null);

      const testApp = express();
      testApp.use(express.json());
      testApp.get('/api/subscriptions/status', mockAuthMiddleware, subscriptionRoutes);

      const response = await request(testApp)
        .get('/api/subscriptions/status')
        .set('Authorization', 'Bearer valid_token');

      expect(response.status).toBe(200);
      expect(response.body.subscription).toBeNull();
      expect(response.body.status).toBe('none');
    });

    it('should return cancelled status for cancelled subscription', async () => {
      const mockSubscription = {
        id: 'sub-123',
        userId: 'user-123',
        planId: 'price_premium',
        status: 'cancelled' as const,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: true,
        stripeSubscriptionId: 'sub_stripe_123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (subscriptionRepository.findByUserId as jest.Mock).mockResolvedValue(mockSubscription);

      const testApp = express();
      testApp.use(express.json());
      testApp.get('/api/subscriptions/status', mockAuthMiddleware, subscriptionRoutes);

      const response = await request(testApp)
        .get('/api/subscriptions/status')
        .set('Authorization', 'Bearer valid_token');

      expect(response.status).toBe(200);
      expect(response.body.subscription).toEqual(mockSubscription);
      expect(response.body.status).toBe('cancelled');
    });
  });

  describe('POST /api/webhooks/stripe', () => {
    it('should handle invoice.payment_succeeded event', async () => {
      const mockEvent = {
        type: 'invoice.payment_succeeded',
        data: {
          object: {
            subscription: 'sub_stripe_123',
          },
        },
      };

      (subscriptionManager.handlePaymentSuccess as jest.Mock).mockResolvedValue(undefined);

      // Mock Stripe webhook verification
      const Stripe = require('stripe');
      Stripe.prototype.webhooks = {
        constructEvent: jest.fn().mockReturnValue(mockEvent),
      };

      const response = await request(app)
        .post('/api/webhooks/stripe')
        .set('stripe-signature', 'valid_signature')
        .send(mockEvent);

      expect(response.status).toBe(200);
      expect(response.body.received).toBe(true);
    });

    it('should handle invoice.payment_failed event', async () => {
      const mockEvent = {
        type: 'invoice.payment_failed',
        data: {
          object: {
            subscription: 'sub_stripe_123',
          },
        },
      };

      (subscriptionManager.handlePaymentFailure as jest.Mock).mockResolvedValue(undefined);

      // Mock Stripe webhook verification
      const Stripe = require('stripe');
      Stripe.prototype.webhooks = {
        constructEvent: jest.fn().mockReturnValue(mockEvent),
      };

      const response = await request(app)
        .post('/api/webhooks/stripe')
        .set('stripe-signature', 'valid_signature')
        .send(mockEvent);

      expect(response.status).toBe(200);
      expect(response.body.received).toBe(true);
    });

    it('should return 400 for missing signature', async () => {
      const response = await request(app)
        .post('/api/webhooks/stripe')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('MISSING_SIGNATURE');
    });

    it('should handle customer.subscription.deleted event', async () => {
      const mockEvent = {
        type: 'customer.subscription.deleted',
        data: {
          object: {
            id: 'sub_stripe_123',
          },
        },
      };

      (subscriptionManager.handlePaymentFailure as jest.Mock).mockResolvedValue(undefined);

      // Mock Stripe webhook verification
      const Stripe = require('stripe');
      Stripe.prototype.webhooks = {
        constructEvent: jest.fn().mockReturnValue(mockEvent),
      };

      const response = await request(app)
        .post('/api/webhooks/stripe')
        .set('stripe-signature', 'valid_signature')
        .send(mockEvent);

      expect(response.status).toBe(200);
      expect(response.body.received).toBe(true);
    });
  });
});
