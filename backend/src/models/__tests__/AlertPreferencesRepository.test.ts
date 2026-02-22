/**
 * AlertPreferencesRepository Unit Tests
 * 
 * Tests for AlertPreferences model CRUD operations and query methods.
 * Requirements: 10.3
 */

import { AlertPreferencesRepository } from '../AlertPreferencesRepository';
import { UserRepository } from '../UserRepository';
import { pool } from '../../config/database';

describe('AlertPreferencesRepository', () => {
  let alertPreferencesRepository: AlertPreferencesRepository;
  let userRepository: UserRepository;
  let testUserId1: string;
  let testUserId2: string;

  beforeAll(async () => {
    alertPreferencesRepository = new AlertPreferencesRepository();
    userRepository = new UserRepository();
    
    // Create test users for foreign key constraints
    const user1 = await userRepository.create({
      email: 'alertpref1@example.com',
      passwordHash: 'hashedpassword',
      name: 'Alert Pref User 1',
      role: 'premium',
    });
    testUserId1 = user1.id;

    const user2 = await userRepository.create({
      email: 'alertpref2@example.com',
      passwordHash: 'hashedpassword',
      name: 'Alert Pref User 2',
      role: 'premium',
    });
    testUserId2 = user2.id;
  });

  beforeEach(async () => {
    // Clean up test preferences before each test
    await pool.query('DELETE FROM alert_preferences WHERE user_id IN ($1, $2)', [testUserId1, testUserId2]);
  });

  afterAll(async () => {
    // Clean up test data
    await pool.query('DELETE FROM alert_preferences WHERE user_id IN ($1, $2)', [testUserId1, testUserId2]);
    await pool.query('DELETE FROM users WHERE id IN ($1, $2)', [testUserId1, testUserId2]);
    await pool.end();
  });

  describe('create', () => {
    it('should create alert preferences with all fields', async () => {
      // Requirement 10.3: Alert preferences persistence
      const input = {
        userId: testUserId1,
        priceMovementThreshold: 5.0,
        enablePumpAlerts: true,
        cryptocurrencies: ['BTC', 'ETH'],
      };

      const preferences = await alertPreferencesRepository.create(input);

      expect(preferences).toBeDefined();
      expect(preferences.id).toBeDefined();
      expect(preferences.userId).toBe(testUserId1);
      expect(preferences.priceMovementThreshold).toBe(5.0);
      expect(preferences.enablePumpAlerts).toBe(true);
      expect(preferences.cryptocurrencies).toEqual(['BTC', 'ETH']);
      expect(preferences.updatedAt).toBeInstanceOf(Date);
    });

    it('should create preferences with empty cryptocurrency list', async () => {
      const input = {
        userId: testUserId1,
        priceMovementThreshold: 10.0,
        enablePumpAlerts: false,
        cryptocurrencies: [],
      };

      const preferences = await alertPreferencesRepository.create(input);

      expect(preferences.cryptocurrencies).toEqual([]);
    });

    it('should fail when creating duplicate preferences for same user', async () => {
      const input = {
        userId: testUserId1,
        priceMovementThreshold: 5.0,
        enablePumpAlerts: true,
        cryptocurrencies: ['BTC'],
      };

      await alertPreferencesRepository.create(input);

      // Attempt to create another preference for same user
      await expect(alertPreferencesRepository.create(input)).rejects.toThrow();
    });
  });

  describe('findById', () => {
    it('should find preferences by ID', async () => {
      const created = await alertPreferencesRepository.create({
        userId: testUserId1,
        priceMovementThreshold: 5.0,
        enablePumpAlerts: true,
        cryptocurrencies: ['BTC'],
      });

      const found = await alertPreferencesRepository.findById(created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.userId).toBe(testUserId1);
    });

    it('should return null for non-existent ID', async () => {
      const found = await alertPreferencesRepository.findById('00000000-0000-0000-0000-000000000000');

      expect(found).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should find preferences by user ID', async () => {
      const created = await alertPreferencesRepository.create({
        userId: testUserId1,
        priceMovementThreshold: 5.0,
        enablePumpAlerts: true,
        cryptocurrencies: ['BTC', 'ETH'],
      });

      const found = await alertPreferencesRepository.findByUserId(testUserId1);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.userId).toBe(testUserId1);
    });

    it('should return null when user has no preferences', async () => {
      const found = await alertPreferencesRepository.findByUserId(testUserId1);

      expect(found).toBeNull();
    });
  });

  describe('update', () => {
    it('should update price movement threshold', async () => {
      const created = await alertPreferencesRepository.create({
        userId: testUserId1,
        priceMovementThreshold: 5.0,
        enablePumpAlerts: true,
        cryptocurrencies: ['BTC'],
      });

      const updated = await alertPreferencesRepository.update(created.id, {
        priceMovementThreshold: 10.0,
      });

      expect(updated).toBeDefined();
      expect(updated?.priceMovementThreshold).toBe(10.0);
      expect(updated?.enablePumpAlerts).toBe(true); // Unchanged
    });

    it('should update pump alerts flag', async () => {
      const created = await alertPreferencesRepository.create({
        userId: testUserId1,
        priceMovementThreshold: 5.0,
        enablePumpAlerts: true,
        cryptocurrencies: ['BTC'],
      });

      const updated = await alertPreferencesRepository.update(created.id, {
        enablePumpAlerts: false,
      });

      expect(updated?.enablePumpAlerts).toBe(false);
    });

    it('should update cryptocurrencies list', async () => {
      const created = await alertPreferencesRepository.create({
        userId: testUserId1,
        priceMovementThreshold: 5.0,
        enablePumpAlerts: true,
        cryptocurrencies: ['BTC'],
      });

      const updated = await alertPreferencesRepository.update(created.id, {
        cryptocurrencies: ['BTC', 'ETH', 'ADA'],
      });

      expect(updated?.cryptocurrencies).toEqual(['BTC', 'ETH', 'ADA']);
    });

    it('should update multiple fields at once', async () => {
      const created = await alertPreferencesRepository.create({
        userId: testUserId1,
        priceMovementThreshold: 5.0,
        enablePumpAlerts: true,
        cryptocurrencies: ['BTC'],
      });

      const updated = await alertPreferencesRepository.update(created.id, {
        priceMovementThreshold: 7.5,
        enablePumpAlerts: false,
        cryptocurrencies: ['ETH'],
      });

      expect(updated?.priceMovementThreshold).toBe(7.5);
      expect(updated?.enablePumpAlerts).toBe(false);
      expect(updated?.cryptocurrencies).toEqual(['ETH']);
    });
  });

  describe('updateByUserId', () => {
    it('should update preferences by user ID', async () => {
      await alertPreferencesRepository.create({
        userId: testUserId1,
        priceMovementThreshold: 5.0,
        enablePumpAlerts: true,
        cryptocurrencies: ['BTC'],
      });

      const updated = await alertPreferencesRepository.updateByUserId(testUserId1, {
        priceMovementThreshold: 8.0,
      });

      expect(updated?.priceMovementThreshold).toBe(8.0);
    });

    it('should return null when user has no preferences', async () => {
      const updated = await alertPreferencesRepository.updateByUserId(testUserId1, {
        priceMovementThreshold: 8.0,
      });

      expect(updated).toBeNull();
    });
  });

  describe('upsert', () => {
    it('should create preferences when they do not exist', async () => {
      const input = {
        userId: testUserId1,
        priceMovementThreshold: 5.0,
        enablePumpAlerts: true,
        cryptocurrencies: ['BTC'],
      };

      const preferences = await alertPreferencesRepository.upsert(input);

      expect(preferences).toBeDefined();
      expect(preferences.userId).toBe(testUserId1);
      expect(preferences.priceMovementThreshold).toBe(5.0);
    });

    it('should update preferences when they already exist', async () => {
      // Create initial preferences
      await alertPreferencesRepository.create({
        userId: testUserId1,
        priceMovementThreshold: 5.0,
        enablePumpAlerts: true,
        cryptocurrencies: ['BTC'],
      });

      // Upsert with new values
      const input = {
        userId: testUserId1,
        priceMovementThreshold: 10.0,
        enablePumpAlerts: false,
        cryptocurrencies: ['ETH'],
      };

      const preferences = await alertPreferencesRepository.upsert(input);

      expect(preferences.priceMovementThreshold).toBe(10.0);
      expect(preferences.enablePumpAlerts).toBe(false);
      expect(preferences.cryptocurrencies).toEqual(['ETH']);

      // Verify only one record exists
      const allPrefs = await pool.query(
        'SELECT * FROM alert_preferences WHERE user_id = $1',
        [testUserId1]
      );
      expect(allPrefs.rows.length).toBe(1);
    });
  });

  describe('delete', () => {
    it('should delete preferences by ID', async () => {
      const created = await alertPreferencesRepository.create({
        userId: testUserId1,
        priceMovementThreshold: 5.0,
        enablePumpAlerts: true,
        cryptocurrencies: ['BTC'],
      });

      const deleted = await alertPreferencesRepository.delete(created.id);

      expect(deleted).toBe(true);

      const found = await alertPreferencesRepository.findById(created.id);
      expect(found).toBeNull();
    });

    it('should return false when deleting non-existent preferences', async () => {
      const deleted = await alertPreferencesRepository.delete('00000000-0000-0000-0000-000000000000');

      expect(deleted).toBe(false);
    });
  });

  describe('deleteByUserId', () => {
    it('should delete preferences by user ID', async () => {
      await alertPreferencesRepository.create({
        userId: testUserId1,
        priceMovementThreshold: 5.0,
        enablePumpAlerts: true,
        cryptocurrencies: ['BTC'],
      });

      const deleted = await alertPreferencesRepository.deleteByUserId(testUserId1);

      expect(deleted).toBe(true);

      const found = await alertPreferencesRepository.findByUserId(testUserId1);
      expect(found).toBeNull();
    });
  });

  describe('findUsersMonitoringCrypto', () => {
    it('should find all users monitoring a specific cryptocurrency', async () => {
      await alertPreferencesRepository.create({
        userId: testUserId1,
        priceMovementThreshold: 5.0,
        enablePumpAlerts: true,
        cryptocurrencies: ['BTC', 'ETH'],
      });

      await alertPreferencesRepository.create({
        userId: testUserId2,
        priceMovementThreshold: 5.0,
        enablePumpAlerts: true,
        cryptocurrencies: ['BTC', 'ADA'],
      });

      const btcUsers = await alertPreferencesRepository.findUsersMonitoringCrypto('BTC');

      expect(btcUsers.length).toBe(2);
      expect(btcUsers).toContain(testUserId1);
      expect(btcUsers).toContain(testUserId2);
    });

    it('should return empty array when no users monitor the cryptocurrency', async () => {
      await alertPreferencesRepository.create({
        userId: testUserId1,
        priceMovementThreshold: 5.0,
        enablePumpAlerts: true,
        cryptocurrencies: ['BTC'],
      });

      const users = await alertPreferencesRepository.findUsersMonitoringCrypto('XRP');

      expect(users.length).toBe(0);
    });
  });

  describe('findUsersWithPumpAlertsEnabled', () => {
    it('should find all users with pump alerts enabled', async () => {
      await alertPreferencesRepository.create({
        userId: testUserId1,
        priceMovementThreshold: 5.0,
        enablePumpAlerts: true,
        cryptocurrencies: ['BTC'],
      });

      await alertPreferencesRepository.create({
        userId: testUserId2,
        priceMovementThreshold: 5.0,
        enablePumpAlerts: false,
        cryptocurrencies: ['ETH'],
      });

      const users = await alertPreferencesRepository.findUsersWithPumpAlertsEnabled();

      expect(users.length).toBe(1);
      expect(users).toContain(testUserId1);
      expect(users).not.toContain(testUserId2);
    });

    it('should return empty array when no users have pump alerts enabled', async () => {
      await alertPreferencesRepository.create({
        userId: testUserId1,
        priceMovementThreshold: 5.0,
        enablePumpAlerts: false,
        cryptocurrencies: ['BTC'],
      });

      const users = await alertPreferencesRepository.findUsersWithPumpAlertsEnabled();

      expect(users.length).toBe(0);
    });
  });
});
