/**
 * SubscriptionRepository Unit Tests
 * 
 * Tests for Subscription data access layer operations.
 * 
 * Requirements: 8.2, 8.4, 8.5
 */

import { SubscriptionRepository } from '../SubscriptionRepository';
import { pool } from '../../config/database';

// Mock the database pool
jest.mock('../../config/database', () => ({
  pool: {
    query: jest.fn()
  }
}));

describe('SubscriptionRepository', () => {
  let repository: SubscriptionRepository;
  const mockPool = pool as jest.Mocked<typeof pool>;

  beforeEach(() => {
    repository = new SubscriptionRepository();
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new subscription with default cancelAtPeriodEnd', async () => {
      const mockSubscription = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: '123e4567-e89b-12d3-a456-426614174001',
        planId: 'premium_monthly',
        status: 'active',
        currentPeriodStart: new Date('2024-01-01'),
        currentPeriodEnd: new Date('2024-02-01'),
        cancelAtPeriodEnd: false,
        stripeSubscriptionId: 'sub_123456',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPool.query.mockResolvedValueOnce({
        rows: [mockSubscription],
        command: 'INSERT',
        rowCount: 1,
        oid: 0,
        fields: []
      });

      const result = await repository.create({
        userId: '123e4567-e89b-12d3-a456-426614174001',
        planId: 'premium_monthly',
        status: 'active',
        currentPeriodStart: new Date('2024-01-01'),
        currentPeriodEnd: new Date('2024-02-01'),
        stripeSubscriptionId: 'sub_123456'
      });

      expect(result).toEqual(mockSubscription);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO subscriptions'),
        expect.arrayContaining([
          '123e4567-e89b-12d3-a456-426614174001',
          'premium_monthly',
          'active',
          expect.any(Date),
          expect.any(Date),
          false,
          'sub_123456'
        ])
      );
    });

    it('should create a subscription with custom cancelAtPeriodEnd value', async () => {
      const mockSubscription = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: '123e4567-e89b-12d3-a456-426614174001',
        planId: 'premium_monthly',
        status: 'active',
        currentPeriodStart: new Date('2024-01-01'),
        currentPeriodEnd: new Date('2024-02-01'),
        cancelAtPeriodEnd: true,
        stripeSubscriptionId: 'sub_123456',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPool.query.mockResolvedValueOnce({
        rows: [mockSubscription],
        command: 'INSERT',
        rowCount: 1,
        oid: 0,
        fields: []
      });

      const result = await repository.create({
        userId: '123e4567-e89b-12d3-a456-426614174001',
        planId: 'premium_monthly',
        status: 'active',
        currentPeriodStart: new Date('2024-01-01'),
        currentPeriodEnd: new Date('2024-02-01'),
        cancelAtPeriodEnd: true,
        stripeSubscriptionId: 'sub_123456'
      });

      expect(result.cancelAtPeriodEnd).toBe(true);
    });
  });

  describe('findById', () => {
    it('should find subscription by ID', async () => {
      const mockSubscription = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: '123e4567-e89b-12d3-a456-426614174001',
        planId: 'premium_monthly',
        status: 'active',
        currentPeriodStart: new Date('2024-01-01'),
        currentPeriodEnd: new Date('2024-02-01'),
        cancelAtPeriodEnd: false,
        stripeSubscriptionId: 'sub_123456',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPool.query.mockResolvedValueOnce({
        rows: [mockSubscription],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: []
      });

      const result = await repository.findById('123e4567-e89b-12d3-a456-426614174000');

      expect(result).toEqual(mockSubscription);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        ['123e4567-e89b-12d3-a456-426614174000']
      );
    });

    it('should return null if subscription not found', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [],
        command: 'SELECT',
        rowCount: 0,
        oid: 0,
        fields: []
      });

      const result = await repository.findById('nonexistent-id');

      expect(result).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should find most recent subscription for user', async () => {
      const mockSubscription = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: '123e4567-e89b-12d3-a456-426614174001',
        planId: 'premium_monthly',
        status: 'active',
        currentPeriodStart: new Date('2024-01-01'),
        currentPeriodEnd: new Date('2024-02-01'),
        cancelAtPeriodEnd: false,
        stripeSubscriptionId: 'sub_123456',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPool.query.mockResolvedValueOnce({
        rows: [mockSubscription],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: []
      });

      const result = await repository.findByUserId('123e4567-e89b-12d3-a456-426614174001');

      expect(result).toEqual(mockSubscription);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY created_at DESC'),
        ['123e4567-e89b-12d3-a456-426614174001']
      );
    });
  });

  describe('findByStripeSubscriptionId', () => {
    it('should find subscription by Stripe subscription ID', async () => {
      const mockSubscription = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: '123e4567-e89b-12d3-a456-426614174001',
        planId: 'premium_monthly',
        status: 'active',
        currentPeriodStart: new Date('2024-01-01'),
        currentPeriodEnd: new Date('2024-02-01'),
        cancelAtPeriodEnd: false,
        stripeSubscriptionId: 'sub_123456',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPool.query.mockResolvedValueOnce({
        rows: [mockSubscription],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: []
      });

      const result = await repository.findByStripeSubscriptionId('sub_123456');

      expect(result).toEqual(mockSubscription);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE stripe_subscription_id'),
        ['sub_123456']
      );
    });
  });

  describe('update', () => {
    it('should update subscription status', async () => {
      const mockSubscription = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: '123e4567-e89b-12d3-a456-426614174001',
        planId: 'premium_monthly',
        status: 'cancelled',
        currentPeriodStart: new Date('2024-01-01'),
        currentPeriodEnd: new Date('2024-02-01'),
        cancelAtPeriodEnd: false,
        stripeSubscriptionId: 'sub_123456',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPool.query.mockResolvedValueOnce({
        rows: [mockSubscription],
        command: 'UPDATE',
        rowCount: 1,
        oid: 0,
        fields: []
      });

      const result = await repository.update('123e4567-e89b-12d3-a456-426614174000', {
        status: 'cancelled'
      });

      expect(result?.status).toBe('cancelled');
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE subscriptions'),
        expect.arrayContaining(['cancelled', '123e4567-e89b-12d3-a456-426614174000'])
      );
    });

    it('should update multiple fields', async () => {
      const mockSubscription = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: '123e4567-e89b-12d3-a456-426614174001',
        planId: 'premium_monthly',
        status: 'active',
        currentPeriodStart: new Date('2024-01-01'),
        currentPeriodEnd: new Date('2024-03-01'),
        cancelAtPeriodEnd: true,
        stripeSubscriptionId: 'sub_123456',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPool.query.mockResolvedValueOnce({
        rows: [mockSubscription],
        command: 'UPDATE',
        rowCount: 1,
        oid: 0,
        fields: []
      });

      const result = await repository.update('123e4567-e89b-12d3-a456-426614174000', {
        currentPeriodEnd: new Date('2024-03-01'),
        cancelAtPeriodEnd: true
      });

      expect(result?.cancelAtPeriodEnd).toBe(true);
    });
  });

  describe('cancelAtPeriodEnd', () => {
    it('should set cancelAtPeriodEnd flag to true (Requirement 8.4)', async () => {
      const mockSubscription = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: '123e4567-e89b-12d3-a456-426614174001',
        planId: 'premium_monthly',
        status: 'active',
        currentPeriodStart: new Date('2024-01-01'),
        currentPeriodEnd: new Date('2024-02-01'),
        cancelAtPeriodEnd: true,
        stripeSubscriptionId: 'sub_123456',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPool.query.mockResolvedValueOnce({
        rows: [mockSubscription],
        command: 'UPDATE',
        rowCount: 1,
        oid: 0,
        fields: []
      });

      const result = await repository.cancelAtPeriodEnd('123e4567-e89b-12d3-a456-426614174000');

      expect(result?.cancelAtPeriodEnd).toBe(true);
      expect(result?.status).toBe('active'); // Status remains active until period end
    });
  });

  describe('findExpiredSubscriptions', () => {
    it('should find all active subscriptions past their end date', async () => {
      const mockSubscriptions = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          userId: '123e4567-e89b-12d3-a456-426614174001',
          planId: 'premium_monthly',
          status: 'active',
          currentPeriodStart: new Date('2023-12-01'),
          currentPeriodEnd: new Date('2024-01-01'),
          cancelAtPeriodEnd: false,
          stripeSubscriptionId: 'sub_123456',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockPool.query.mockResolvedValueOnce({
        rows: mockSubscriptions,
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: []
      });

      const result = await repository.findExpiredSubscriptions();

      expect(result).toHaveLength(1);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining("WHERE status = 'active'"),
        []
      );
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('current_period_end < CURRENT_TIMESTAMP'),
        []
      );
    });
  });

  describe('findByStatus', () => {
    it('should find all subscriptions with given status', async () => {
      const mockSubscriptions = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          userId: '123e4567-e89b-12d3-a456-426614174001',
          planId: 'premium_monthly',
          status: 'active',
          currentPeriodStart: new Date('2024-01-01'),
          currentPeriodEnd: new Date('2024-02-01'),
          cancelAtPeriodEnd: false,
          stripeSubscriptionId: 'sub_123456',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockPool.query.mockResolvedValueOnce({
        rows: mockSubscriptions,
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: []
      });

      const result = await repository.findByStatus('active');

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('active');
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE status'),
        ['active']
      );
    });
  });

  describe('delete', () => {
    it('should delete subscription by ID', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [],
        command: 'DELETE',
        rowCount: 1,
        oid: 0,
        fields: []
      });

      const result = await repository.delete('123e4567-e89b-12d3-a456-426614174000');

      expect(result).toBe(true);
      expect(mockPool.query).toHaveBeenCalledWith(
        'DELETE FROM subscriptions WHERE id = $1',
        ['123e4567-e89b-12d3-a456-426614174000']
      );
    });

    it('should return false if subscription not found', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [],
        command: 'DELETE',
        rowCount: 0,
        oid: 0,
        fields: []
      });

      const result = await repository.delete('nonexistent-id');

      expect(result).toBe(false);
    });
  });
});
