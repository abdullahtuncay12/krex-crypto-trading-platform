/**
 * SubscriptionManager Service Tests
 * 
 * Unit tests for subscription lifecycle management including:
 * - Subscription creation with Stripe integration
 * - Subscription cancellation
 * - Payment success webhook handling
 * - Payment failure webhook handling
 * - Expired subscription processing
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */

import { SubscriptionManager } from '../SubscriptionManager';
import { subscriptionRepository } from '../../models/SubscriptionRepository';
import { userRepository } from '../../models/UserRepository';
import Stripe from 'stripe';

// Mock dependencies
jest.mock('../../models/SubscriptionRepository');
jest.mock('../../models/UserRepository');
jest.mock('stripe');

describe('SubscriptionManager', () => {
  let subscriptionManager: SubscriptionManager;
  let mockStripe: jest.Mocked<Stripe>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create mock Stripe instance
    mockStripe = {
      customers: {
        list: jest.fn(),
        create: jest.fn(),
      },
      paymentMethods: {
        attach: jest.fn(),
      },
      subscriptions: {
        create: jest.fn(),
        update: jest.fn(),
        retrieve: jest.fn(),
      },
    } as any;

    // Mock Stripe constructor
    (Stripe as any).mockImplementation(() => mockStripe);

    subscriptionManager = new SubscriptionManager('test_stripe_key');
  });

  describe('createSubscription', () => {
    it('should create a new subscription and upgrade user to premium', async () => {
      // Arrange
      const userId = 'user-123';
      const planId = 'price_premium_monthly';
      const paymentMethodId = 'pm_test_123';

      const mockUser = {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        role: 'normal' as const,
        passwordHash: 'hash',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockStripeCustomer = {
        id: 'cus_test_123',
        email: 'test@example.com',
      };

      const mockStripeSubscription = {
        id: 'sub_test_123',
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
      };

      const mockSubscription = {
        id: 'sub-db-123',
        userId,
        planId,
        status: 'active' as const,
        currentPeriodStart: new Date(mockStripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(mockStripeSubscription.current_period_end * 1000),
        cancelAtPeriodEnd: false,
        stripeSubscriptionId: mockStripeSubscription.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);
      (subscriptionRepository.findByUserId as jest.Mock).mockResolvedValue(null);
      mockStripe.customers.list.mockResolvedValue({ data: [mockStripeCustomer] } as any);
      mockStripe.paymentMethods.attach.mockResolvedValue({} as any);
      mockStripe.subscriptions.create.mockResolvedValue(mockStripeSubscription as any);
      (subscriptionRepository.create as jest.Mock).mockResolvedValue(mockSubscription);
      (userRepository.updateRole as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const result = await subscriptionManager.createSubscription(userId, planId, paymentMethodId);

      // Assert
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(subscriptionRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(mockStripe.customers.list).toHaveBeenCalledWith({
        email: mockUser.email,
        limit: 1,
      });
      expect(mockStripe.paymentMethods.attach).toHaveBeenCalledWith(paymentMethodId, {
        customer: mockStripeCustomer.id,
      });
      expect(mockStripe.subscriptions.create).toHaveBeenCalledWith({
        customer: mockStripeCustomer.id,
        items: [{ price: planId }],
        default_payment_method: paymentMethodId,
        expand: ['latest_invoice.payment_intent'],
      });
      expect(subscriptionRepository.create).toHaveBeenCalled();
      expect(userRepository.updateRole).toHaveBeenCalledWith(userId, 'premium');
      expect(result).toEqual(mockSubscription);
    });

    it('should create Stripe customer if none exists', async () => {
      // Arrange
      const userId = 'user-123';
      const planId = 'price_premium_monthly';
      const paymentMethodId = 'pm_test_123';

      const mockUser = {
        id: userId,
        email: 'newuser@example.com',
        name: 'New User',
        role: 'normal' as const,
        passwordHash: 'hash',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockNewCustomer = {
        id: 'cus_new_123',
        email: 'newuser@example.com',
      };

      const mockStripeSubscription = {
        id: 'sub_test_123',
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
      };

      (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);
      (subscriptionRepository.findByUserId as jest.Mock).mockResolvedValue(null);
      mockStripe.customers.list.mockResolvedValue({ data: [] } as any);
      mockStripe.customers.create.mockResolvedValue(mockNewCustomer as any);
      mockStripe.paymentMethods.attach.mockResolvedValue({} as any);
      mockStripe.subscriptions.create.mockResolvedValue(mockStripeSubscription as any);
      (subscriptionRepository.create as jest.Mock).mockResolvedValue({} as any);
      (userRepository.updateRole as jest.Mock).mockResolvedValue(mockUser);

      // Act
      await subscriptionManager.createSubscription(userId, planId, paymentMethodId);

      // Assert
      expect(mockStripe.customers.create).toHaveBeenCalledWith({
        email: mockUser.email,
        name: mockUser.name,
        payment_method: paymentMethodId,
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    });

    it('should throw error if user not found', async () => {
      // Arrange
      (userRepository.findById as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(
        subscriptionManager.createSubscription('invalid-user', 'plan-123', 'pm-123')
      ).rejects.toThrow('User not found');
    });

    it('should throw error if user already has active subscription', async () => {
      // Arrange
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'premium' as const,
      };

      const mockActiveSubscription = {
        id: 'sub-123',
        userId: 'user-123',
        status: 'active' as const,
      };

      (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);
      (subscriptionRepository.findByUserId as jest.Mock).mockResolvedValue(mockActiveSubscription);

      // Act & Assert
      await expect(
        subscriptionManager.createSubscription('user-123', 'plan-123', 'pm-123')
      ).rejects.toThrow('User already has an active subscription');
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel subscription at period end and maintain access', async () => {
      // Arrange
      const userId = 'user-123';
      const mockSubscription = {
        id: 'sub-123',
        userId,
        status: 'active' as const,
        stripeSubscriptionId: 'sub_stripe_123',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };

      const mockUpdatedSubscription = {
        ...mockSubscription,
        cancelAtPeriodEnd: true,
      };

      (subscriptionRepository.findByUserId as jest.Mock).mockResolvedValue(mockSubscription);
      mockStripe.subscriptions.update.mockResolvedValue({} as any);
      (subscriptionRepository.cancelAtPeriodEnd as jest.Mock).mockResolvedValue(mockUpdatedSubscription);

      // Act
      const result = await subscriptionManager.cancelSubscription(userId);

      // Assert
      expect(subscriptionRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(mockStripe.subscriptions.update).toHaveBeenCalledWith(
        mockSubscription.stripeSubscriptionId,
        { cancel_at_period_end: true }
      );
      expect(subscriptionRepository.cancelAtPeriodEnd).toHaveBeenCalledWith(mockSubscription.id);
      expect(result.cancelAtPeriodEnd).toBe(true);
    });

    it('should throw error if no subscription found', async () => {
      // Arrange
      (subscriptionRepository.findByUserId as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(
        subscriptionManager.cancelSubscription('user-123')
      ).rejects.toThrow('No subscription found for user');
    });

    it('should throw error if subscription is not active', async () => {
      // Arrange
      const mockSubscription = {
        id: 'sub-123',
        userId: 'user-123',
        status: 'expired' as const,
      };

      (subscriptionRepository.findByUserId as jest.Mock).mockResolvedValue(mockSubscription);

      // Act & Assert
      await expect(
        subscriptionManager.cancelSubscription('user-123')
      ).rejects.toThrow('Subscription is not active');
    });
  });

  describe('handlePaymentSuccess', () => {
    it('should update subscription and ensure premium role on payment success', async () => {
      // Arrange
      const stripeSubscriptionId = 'sub_stripe_123';
      const mockSubscription = {
        id: 'sub-123',
        userId: 'user-123',
        stripeSubscriptionId,
      };

      const mockStripeSubscription = {
        id: stripeSubscriptionId,
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
      };

      (subscriptionRepository.findByStripeSubscriptionId as jest.Mock).mockResolvedValue(mockSubscription);
      mockStripe.subscriptions.retrieve.mockResolvedValue(mockStripeSubscription as any);
      (subscriptionRepository.update as jest.Mock).mockResolvedValue({});
      (userRepository.updateRole as jest.Mock).mockResolvedValue({});

      // Act
      await subscriptionManager.handlePaymentSuccess(stripeSubscriptionId);

      // Assert
      expect(subscriptionRepository.findByStripeSubscriptionId).toHaveBeenCalledWith(stripeSubscriptionId);
      expect(mockStripe.subscriptions.retrieve).toHaveBeenCalledWith(stripeSubscriptionId);
      expect(subscriptionRepository.update).toHaveBeenCalledWith(
        mockSubscription.id,
        expect.objectContaining({
          status: 'active',
          cancelAtPeriodEnd: false,
        })
      );
      expect(userRepository.updateRole).toHaveBeenCalledWith(mockSubscription.userId, 'premium');
    });

    it('should throw error if subscription not found', async () => {
      // Arrange
      (subscriptionRepository.findByStripeSubscriptionId as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(
        subscriptionManager.handlePaymentSuccess('invalid-sub')
      ).rejects.toThrow('Subscription not found');
    });
  });

  describe('handlePaymentFailure', () => {
    it('should mark subscription as expired and downgrade user role', async () => {
      // Arrange
      const stripeSubscriptionId = 'sub_stripe_123';
      const mockSubscription = {
        id: 'sub-123',
        userId: 'user-123',
        stripeSubscriptionId,
      };

      (subscriptionRepository.findByStripeSubscriptionId as jest.Mock).mockResolvedValue(mockSubscription);
      (subscriptionRepository.update as jest.Mock).mockResolvedValue({});
      (userRepository.updateRole as jest.Mock).mockResolvedValue({});

      // Spy on console.log
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      await subscriptionManager.handlePaymentFailure(stripeSubscriptionId);

      // Assert
      expect(subscriptionRepository.findByStripeSubscriptionId).toHaveBeenCalledWith(stripeSubscriptionId);
      expect(subscriptionRepository.update).toHaveBeenCalledWith(mockSubscription.id, {
        status: 'expired',
      });
      expect(userRepository.updateRole).toHaveBeenCalledWith(mockSubscription.userId, 'normal');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Payment failed for subscription')
      );

      consoleSpy.mockRestore();
    });

    it('should throw error if subscription not found', async () => {
      // Arrange
      (subscriptionRepository.findByStripeSubscriptionId as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(
        subscriptionManager.handlePaymentFailure('invalid-sub')
      ).rejects.toThrow('Subscription not found');
    });
  });

  describe('checkExpiredSubscriptions', () => {
    it('should process all expired subscriptions and downgrade user roles', async () => {
      // Arrange
      const mockExpiredSubscriptions = [
        {
          id: 'sub-1',
          userId: 'user-1',
          status: 'active' as const,
          currentPeriodEnd: new Date(Date.now() - 1000),
        },
        {
          id: 'sub-2',
          userId: 'user-2',
          status: 'active' as const,
          currentPeriodEnd: new Date(Date.now() - 2000),
        },
      ];

      (subscriptionRepository.findExpiredSubscriptions as jest.Mock).mockResolvedValue(mockExpiredSubscriptions);
      (subscriptionRepository.update as jest.Mock).mockResolvedValue({});
      (userRepository.updateRole as jest.Mock).mockResolvedValue({});

      // Spy on console.log
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      await subscriptionManager.checkExpiredSubscriptions();

      // Assert
      expect(subscriptionRepository.findExpiredSubscriptions).toHaveBeenCalled();
      expect(subscriptionRepository.update).toHaveBeenCalledTimes(2);
      expect(subscriptionRepository.update).toHaveBeenCalledWith('sub-1', { status: 'expired' });
      expect(subscriptionRepository.update).toHaveBeenCalledWith('sub-2', { status: 'expired' });
      expect(userRepository.updateRole).toHaveBeenCalledTimes(2);
      expect(userRepository.updateRole).toHaveBeenCalledWith('user-1', 'normal');
      expect(userRepository.updateRole).toHaveBeenCalledWith('user-2', 'normal');
      expect(consoleSpy).toHaveBeenCalledTimes(2);

      consoleSpy.mockRestore();
    });

    it('should handle empty expired subscriptions list', async () => {
      // Arrange
      (subscriptionRepository.findExpiredSubscriptions as jest.Mock).mockResolvedValue([]);

      // Act
      await subscriptionManager.checkExpiredSubscriptions();

      // Assert
      expect(subscriptionRepository.findExpiredSubscriptions).toHaveBeenCalled();
      expect(subscriptionRepository.update).not.toHaveBeenCalled();
      expect(userRepository.updateRole).not.toHaveBeenCalled();
    });
  });
});
