/**
 * AlertRepository Unit Tests
 * 
 * Tests for Alert model CRUD operations and query methods.
 * Requirements: 10.1, 10.4
 */

import { AlertRepository } from '../AlertRepository';
import { UserRepository } from '../UserRepository';
import { pool } from '../../config/database';

describe('AlertRepository', () => {
  let alertRepository: AlertRepository;
  let userRepository: UserRepository;
  let testUserId: string;

  beforeAll(async () => {
    alertRepository = new AlertRepository();
    userRepository = new UserRepository();
    
    // Create a test user for foreign key constraints
    const user = await userRepository.create({
      email: 'alerttest@example.com',
      passwordHash: 'hashedpassword',
      name: 'Alert Test User',
      role: 'premium',
    });
    testUserId = user.id;
  });

  beforeEach(async () => {
    // Clean up test alerts before each test
    await pool.query('DELETE FROM alerts WHERE user_id = $1', [testUserId]);
  });

  afterAll(async () => {
    // Clean up test data
    await pool.query('DELETE FROM alerts WHERE user_id = $1', [testUserId]);
    await pool.query('DELETE FROM users WHERE id = $1', [testUserId]);
    await pool.end();
  });

  describe('create', () => {
    it('should create a new alert with all required fields', async () => {
      // Requirement 10.1: Alert generation on trading opportunities
      // Requirement 10.4: Alert content completeness
      const input = {
        userId: testUserId,
        cryptocurrency: 'BTC',
        alertType: 'price_movement' as const,
        message: 'BTC price increased by 5%',
      };

      const alert = await alertRepository.create(input);

      expect(alert).toBeDefined();
      expect(alert.id).toBeDefined();
      expect(alert.userId).toBe(testUserId);
      expect(alert.cryptocurrency).toBe('BTC');
      expect(alert.alertType).toBe('price_movement');
      expect(alert.message).toBe('BTC price increased by 5%');
      expect(alert.read).toBe(false);
      expect(alert.createdAt).toBeInstanceOf(Date);
    });

    it('should create alert with pump_detected type', async () => {
      const input = {
        userId: testUserId,
        cryptocurrency: 'ETH',
        alertType: 'pump_detected' as const,
        message: 'ETH pump detected - volume spike',
      };

      const alert = await alertRepository.create(input);

      expect(alert.alertType).toBe('pump_detected');
      expect(alert.cryptocurrency).toBe('ETH');
    });

    it('should create alert with trading_opportunity type', async () => {
      const input = {
        userId: testUserId,
        cryptocurrency: 'BTC',
        alertType: 'trading_opportunity' as const,
        message: 'Strong buy signal for BTC',
      };

      const alert = await alertRepository.create(input);

      expect(alert.alertType).toBe('trading_opportunity');
    });
  });

  describe('findById', () => {
    it('should find alert by ID', async () => {
      const created = await alertRepository.create({
        userId: testUserId,
        cryptocurrency: 'BTC',
        alertType: 'price_movement',
        message: 'Test alert',
      });

      const found = await alertRepository.findById(created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.userId).toBe(testUserId);
    });

    it('should return null for non-existent ID', async () => {
      const found = await alertRepository.findById('00000000-0000-0000-0000-000000000000');

      expect(found).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should find all alerts for a user', async () => {
      await alertRepository.create({
        userId: testUserId,
        cryptocurrency: 'BTC',
        alertType: 'price_movement',
        message: 'Alert 1',
      });

      await alertRepository.create({
        userId: testUserId,
        cryptocurrency: 'ETH',
        alertType: 'pump_detected',
        message: 'Alert 2',
      });

      const alerts = await alertRepository.findByUserId(testUserId);

      expect(alerts.length).toBe(2);
      expect(alerts.every(a => a.userId === testUserId)).toBe(true);
    });

    it('should return alerts in descending order by creation date', async () => {
      const alert1 = await alertRepository.create({
        userId: testUserId,
        cryptocurrency: 'BTC',
        alertType: 'price_movement',
        message: 'First alert',
      });

      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));

      const alert2 = await alertRepository.create({
        userId: testUserId,
        cryptocurrency: 'ETH',
        alertType: 'pump_detected',
        message: 'Second alert',
      });

      const alerts = await alertRepository.findByUserId(testUserId);

      expect(alerts[0].id).toBe(alert2.id); // Most recent first
      expect(alerts[1].id).toBe(alert1.id);
    });
  });

  describe('findUnreadByUserId', () => {
    it('should find only unread alerts for a user', async () => {
      const alert1 = await alertRepository.create({
        userId: testUserId,
        cryptocurrency: 'BTC',
        alertType: 'price_movement',
        message: 'Unread alert',
      });

      const alert2 = await alertRepository.create({
        userId: testUserId,
        cryptocurrency: 'ETH',
        alertType: 'pump_detected',
        message: 'Read alert',
        read: true,
      });

      const unreadAlerts = await alertRepository.findUnreadByUserId(testUserId);

      expect(unreadAlerts.length).toBe(1);
      expect(unreadAlerts[0].id).toBe(alert1.id);
      expect(unreadAlerts[0].read).toBe(false);
    });
  });

  describe('update', () => {
    it('should mark alert as read', async () => {
      const created = await alertRepository.create({
        userId: testUserId,
        cryptocurrency: 'BTC',
        alertType: 'price_movement',
        message: 'Test alert',
      });

      expect(created.read).toBe(false);

      const updated = await alertRepository.update(created.id, { read: true });

      expect(updated).toBeDefined();
      expect(updated?.read).toBe(true);
    });
  });

  describe('markAsRead', () => {
    it('should mark alert as read using convenience method', async () => {
      const created = await alertRepository.create({
        userId: testUserId,
        cryptocurrency: 'BTC',
        alertType: 'price_movement',
        message: 'Test alert',
      });

      const updated = await alertRepository.markAsRead(created.id);

      expect(updated?.read).toBe(true);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all unread alerts as read for a user', async () => {
      await alertRepository.create({
        userId: testUserId,
        cryptocurrency: 'BTC',
        alertType: 'price_movement',
        message: 'Alert 1',
      });

      await alertRepository.create({
        userId: testUserId,
        cryptocurrency: 'ETH',
        alertType: 'pump_detected',
        message: 'Alert 2',
      });

      const count = await alertRepository.markAllAsRead(testUserId);

      expect(count).toBe(2);

      const unreadAlerts = await alertRepository.findUnreadByUserId(testUserId);
      expect(unreadAlerts.length).toBe(0);
    });
  });

  describe('delete', () => {
    it('should delete alert by ID', async () => {
      const created = await alertRepository.create({
        userId: testUserId,
        cryptocurrency: 'BTC',
        alertType: 'price_movement',
        message: 'Test alert',
      });

      const deleted = await alertRepository.delete(created.id);

      expect(deleted).toBe(true);

      const found = await alertRepository.findById(created.id);
      expect(found).toBeNull();
    });

    it('should return false when deleting non-existent alert', async () => {
      const deleted = await alertRepository.delete('00000000-0000-0000-0000-000000000000');

      expect(deleted).toBe(false);
    });
  });

  describe('deleteByUserId', () => {
    it('should delete all alerts for a user', async () => {
      await alertRepository.create({
        userId: testUserId,
        cryptocurrency: 'BTC',
        alertType: 'price_movement',
        message: 'Alert 1',
      });

      await alertRepository.create({
        userId: testUserId,
        cryptocurrency: 'ETH',
        alertType: 'pump_detected',
        message: 'Alert 2',
      });

      const count = await alertRepository.deleteByUserId(testUserId);

      expect(count).toBe(2);

      const alerts = await alertRepository.findByUserId(testUserId);
      expect(alerts.length).toBe(0);
    });
  });

  describe('findByCryptocurrency', () => {
    it('should find all alerts for a specific cryptocurrency', async () => {
      await alertRepository.create({
        userId: testUserId,
        cryptocurrency: 'BTC',
        alertType: 'price_movement',
        message: 'BTC alert 1',
      });

      await alertRepository.create({
        userId: testUserId,
        cryptocurrency: 'BTC',
        alertType: 'pump_detected',
        message: 'BTC alert 2',
      });

      await alertRepository.create({
        userId: testUserId,
        cryptocurrency: 'ETH',
        alertType: 'price_movement',
        message: 'ETH alert',
      });

      const btcAlerts = await alertRepository.findByCryptocurrency('BTC');

      expect(btcAlerts.length).toBe(2);
      expect(btcAlerts.every(a => a.cryptocurrency === 'BTC')).toBe(true);
    });
  });

  describe('countUnread', () => {
    it('should count unread alerts for a user', async () => {
      await alertRepository.create({
        userId: testUserId,
        cryptocurrency: 'BTC',
        alertType: 'price_movement',
        message: 'Unread 1',
      });

      await alertRepository.create({
        userId: testUserId,
        cryptocurrency: 'ETH',
        alertType: 'pump_detected',
        message: 'Unread 2',
      });

      await alertRepository.create({
        userId: testUserId,
        cryptocurrency: 'BTC',
        alertType: 'trading_opportunity',
        message: 'Read alert',
        read: true,
      });

      const count = await alertRepository.countUnread(testUserId);

      expect(count).toBe(2);
    });
  });
});
