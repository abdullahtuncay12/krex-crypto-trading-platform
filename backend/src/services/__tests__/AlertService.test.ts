/**
 * AlertService Tests
 * 
 * Unit tests for AlertService functionality including price movement monitoring,
 * pump detection, and alert sending with user preference validation.
 * 
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5
 */

import { AlertService } from '../AlertService';
import { ExchangeAggregator } from '../ExchangeAggregator';
import { alertRepository } from '../../models/AlertRepository';
import { alertPreferencesRepository } from '../../models/AlertPreferencesRepository';
import { userRepository } from '../../models/UserRepository';
import { User } from '../../models/User';
import { AlertPreferences } from '../../models/AlertPreferences';

// Mock dependencies
jest.mock('../ExchangeAggregator');
jest.mock('../../models/AlertRepository');
jest.mock('../../models/AlertPreferencesRepository');
jest.mock('../../models/UserRepository');

describe('AlertService', () => {
  let alertService: AlertService;
  let mockExchangeAggregator: jest.Mocked<ExchangeAggregator>;

  const mockPremiumUser: User = {
    id: 'user-1',
    email: 'premium@test.com',
    passwordHash: 'hash',
    name: 'Premium User',
    role: 'premium',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockNormalUser: User = {
    id: 'user-2',
    email: 'normal@test.com',
    passwordHash: 'hash',
    name: 'Normal User',
    role: 'normal',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPreferences: AlertPreferences = {
    id: 'pref-1',
    userId: 'user-1',
    priceMovementThreshold: 5,
    enablePumpAlerts: true,
    cryptocurrencies: ['BTC', 'ETH'],
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    alertService = new AlertService();
    mockExchangeAggregator = (alertService as any).exchangeAggregator;
    alertService.clearCache();
  });

  describe('sendAlert', () => {
    it('should send alert to premium user with valid preferences', async () => {
      (userRepository.findById as jest.Mock).mockResolvedValue(mockPremiumUser);
      (alertPreferencesRepository.findByUserId as jest.Mock).mockResolvedValue(mockPreferences);
      (alertRepository.create as jest.Mock).mockResolvedValue({
        id: 'alert-1',
        userId: 'user-1',
        cryptocurrency: 'BTC',
        alertType: 'price_movement',
        message: 'BTC price increased by 5%',
        read: false,
        createdAt: new Date(),
      });

      await alertService.sendAlert('user-1', {
        cryptocurrency: 'BTC',
        alertType: 'price_movement',
        message: 'BTC price increased by 5%',
      });

      expect(userRepository.findById).toHaveBeenCalledWith('user-1');
      expect(alertPreferencesRepository.findByUserId).toHaveBeenCalledWith('user-1');
      expect(alertRepository.create).toHaveBeenCalledWith({
        userId: 'user-1',
        cryptocurrency: 'BTC',
        alertType: 'price_movement',
        message: 'BTC price increased by 5%',
      });
    });

    it('should not send alert to normal user', async () => {
      (userRepository.findById as jest.Mock).mockResolvedValue(mockNormalUser);

      await alertService.sendAlert('user-2', {
        cryptocurrency: 'BTC',
        alertType: 'price_movement',
        message: 'BTC price increased by 5%',
      });

      expect(alertRepository.create).not.toHaveBeenCalled();
    });

    it('should not send alert if user has no preferences', async () => {
      (userRepository.findById as jest.Mock).mockResolvedValue(mockPremiumUser);
      (alertPreferencesRepository.findByUserId as jest.Mock).mockResolvedValue(null);

      await alertService.sendAlert('user-1', {
        cryptocurrency: 'BTC',
        alertType: 'price_movement',
        message: 'BTC price increased by 5%',
      });

      expect(alertRepository.create).not.toHaveBeenCalled();
    });

    it('should not send alert if cryptocurrency not in user preferences', async () => {
      (userRepository.findById as jest.Mock).mockResolvedValue(mockPremiumUser);
      (alertPreferencesRepository.findByUserId as jest.Mock).mockResolvedValue(mockPreferences);

      await alertService.sendAlert('user-1', {
        cryptocurrency: 'DOGE',
        alertType: 'price_movement',
        message: 'DOGE price increased by 5%',
      });

      expect(alertRepository.create).not.toHaveBeenCalled();
    });

    it('should not send pump alert if pump alerts are disabled', async () => {
      const preferencesNoPump = { ...mockPreferences, enablePumpAlerts: false };
      (userRepository.findById as jest.Mock).mockResolvedValue(mockPremiumUser);
      (alertPreferencesRepository.findByUserId as jest.Mock).mockResolvedValue(preferencesNoPump);

      await alertService.sendAlert('user-1', {
        cryptocurrency: 'BTC',
        alertType: 'pump_detected',
        message: 'BTC pump detected',
      });

      expect(alertRepository.create).not.toHaveBeenCalled();
    });

    it('should send pump alert if pump alerts are enabled', async () => {
      (userRepository.findById as jest.Mock).mockResolvedValue(mockPremiumUser);
      (alertPreferencesRepository.findByUserId as jest.Mock).mockResolvedValue(mockPreferences);
      (alertRepository.create as jest.Mock).mockResolvedValue({
        id: 'alert-1',
        userId: 'user-1',
        cryptocurrency: 'BTC',
        alertType: 'pump_detected',
        message: 'BTC pump detected',
        read: false,
        createdAt: new Date(),
      });

      await alertService.sendAlert('user-1', {
        cryptocurrency: 'BTC',
        alertType: 'pump_detected',
        message: 'BTC pump detected',
      });

      expect(alertRepository.create).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      (userRepository.findById as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(
        alertService.sendAlert('user-1', {
          cryptocurrency: 'BTC',
          alertType: 'price_movement',
          message: 'BTC price increased by 5%',
        })
      ).resolves.not.toThrow();
    });
  });

  describe('checkPriceMovements', () => {
    it('should check price movements for all monitored cryptocurrencies', async () => {
      (userRepository.findByRole as jest.Mock).mockResolvedValue([mockPremiumUser]);
      (alertPreferencesRepository.findByUserId as jest.Mock).mockResolvedValue(mockPreferences);
      (alertPreferencesRepository.findUsersMonitoringCrypto as jest.Mock).mockResolvedValue(['user-1']);
      mockExchangeAggregator.getCurrentPrice = jest.fn()
        .mockResolvedValueOnce(50000) // First call for BTC
        .mockResolvedValueOnce(51000) // Second call for BTC (2% increase)
        .mockResolvedValueOnce(3000)  // First call for ETH
        .mockResolvedValueOnce(3000); // Second call for ETH (no change)

      // First check to populate cache
      await alertService.checkPriceMovements();

      // Second check to trigger alerts
      await alertService.checkPriceMovements();

      expect(mockExchangeAggregator.getCurrentPrice).toHaveBeenCalledWith('BTC');
      expect(mockExchangeAggregator.getCurrentPrice).toHaveBeenCalledWith('ETH');
    });

    it('should send alerts when price change exceeds threshold', async () => {
      (userRepository.findByRole as jest.Mock).mockResolvedValue([mockPremiumUser]);
      (alertPreferencesRepository.findByUserId as jest.Mock).mockResolvedValue(mockPreferences);
      (alertPreferencesRepository.findUsersMonitoringCrypto as jest.Mock).mockResolvedValue(['user-1']);
      (userRepository.findById as jest.Mock).mockResolvedValue(mockPremiumUser);
      mockExchangeAggregator.getCurrentPrice = jest.fn()
        .mockResolvedValueOnce(50000)
        .mockResolvedValueOnce(53000); // 6% increase, exceeds 5% threshold

      // First check to populate cache
      await alertService.checkPriceMovements();

      // Second check to trigger alert
      await alertService.checkPriceMovements();

      expect(alertRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          cryptocurrency: 'BTC',
          alertType: 'price_movement',
        })
      );
    });

    it('should not send alerts when price change is below threshold', async () => {
      (userRepository.findByRole as jest.Mock).mockResolvedValue([mockPremiumUser]);
      (alertPreferencesRepository.findByUserId as jest.Mock).mockResolvedValue(mockPreferences);
      (alertPreferencesRepository.findUsersMonitoringCrypto as jest.Mock).mockResolvedValue(['user-1']);
      mockExchangeAggregator.getCurrentPrice = jest.fn()
        .mockResolvedValueOnce(50000)
        .mockResolvedValueOnce(51000); // 2% increase, below 5% threshold

      // First check to populate cache
      await alertService.checkPriceMovements();

      // Second check - should not trigger alert
      await alertService.checkPriceMovements();

      expect(alertRepository.create).not.toHaveBeenCalled();
    });

    it('should handle exchange errors gracefully', async () => {
      (userRepository.findByRole as jest.Mock).mockResolvedValue([mockPremiumUser]);
      (alertPreferencesRepository.findByUserId as jest.Mock).mockResolvedValue(mockPreferences);
      mockExchangeAggregator.getCurrentPrice = jest.fn().mockRejectedValue(new Error('Exchange error'));

      await expect(alertService.checkPriceMovements()).resolves.not.toThrow();
    });

    it('should send alerts for price decreases exceeding threshold', async () => {
      (userRepository.findByRole as jest.Mock).mockResolvedValue([mockPremiumUser]);
      (alertPreferencesRepository.findByUserId as jest.Mock).mockResolvedValue(mockPreferences);
      (alertPreferencesRepository.findUsersMonitoringCrypto as jest.Mock).mockResolvedValue(['user-1']);
      (userRepository.findById as jest.Mock).mockResolvedValue(mockPremiumUser);
      mockExchangeAggregator.getCurrentPrice = jest.fn()
        .mockResolvedValueOnce(50000)
        .mockResolvedValueOnce(47000); // 6% decrease, exceeds 5% threshold

      // First check to populate cache
      await alertService.checkPriceMovements();

      // Second check to trigger alert
      await alertService.checkPriceMovements();

      expect(alertRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          cryptocurrency: 'BTC',
          alertType: 'price_movement',
          message: expect.stringContaining('decreased'),
        })
      );
    });
  });

  describe('detectPumpSignals', () => {
    it('should detect pump when price increases by 10% or more', async () => {
      (userRepository.findByRole as jest.Mock).mockResolvedValue([mockPremiumUser]);
      (alertPreferencesRepository.findByUserId as jest.Mock).mockResolvedValue(mockPreferences);
      (alertPreferencesRepository.findUsersWithPumpAlertsEnabled as jest.Mock).mockResolvedValue(['user-1']);
      (userRepository.findById as jest.Mock).mockResolvedValue(mockPremiumUser);
      mockExchangeAggregator.getCurrentPrice = jest.fn()
        .mockResolvedValueOnce(50000)
        .mockResolvedValueOnce(55500); // 11% increase

      // First check to populate cache
      await alertService.detectPumpSignals();

      // Second check to trigger pump alert
      await alertService.detectPumpSignals();

      expect(alertRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          cryptocurrency: 'BTC',
          alertType: 'pump_detected',
          message: expect.stringContaining('PUMP DETECTED'),
        })
      );
    });

    it('should not detect pump when price increase is below 10%', async () => {
      (userRepository.findByRole as jest.Mock).mockResolvedValue([mockPremiumUser]);
      (alertPreferencesRepository.findByUserId as jest.Mock).mockResolvedValue(mockPreferences);
      (alertPreferencesRepository.findUsersWithPumpAlertsEnabled as jest.Mock).mockResolvedValue(['user-1']);
      mockExchangeAggregator.getCurrentPrice = jest.fn()
        .mockResolvedValueOnce(50000)
        .mockResolvedValueOnce(54000); // 8% increase, below 10% threshold

      // First check to populate cache
      await alertService.detectPumpSignals();

      // Second check - should not trigger pump alert
      await alertService.detectPumpSignals();

      expect(alertRepository.create).not.toHaveBeenCalled();
    });

    it('should not detect pump on price decreases', async () => {
      (userRepository.findByRole as jest.Mock).mockResolvedValue([mockPremiumUser]);
      (alertPreferencesRepository.findByUserId as jest.Mock).mockResolvedValue(mockPreferences);
      (alertPreferencesRepository.findUsersWithPumpAlertsEnabled as jest.Mock).mockResolvedValue(['user-1']);
      mockExchangeAggregator.getCurrentPrice = jest.fn()
        .mockResolvedValueOnce(50000)
        .mockResolvedValueOnce(44000); // 12% decrease

      // First check to populate cache
      await alertService.detectPumpSignals();

      // Second check - should not trigger pump alert for decrease
      await alertService.detectPumpSignals();

      expect(alertRepository.create).not.toHaveBeenCalled();
    });

    it('should only send pump alerts to users with pump alerts enabled', async () => {
      const preferencesNoPump = { ...mockPreferences, enablePumpAlerts: false };
      (userRepository.findByRole as jest.Mock).mockResolvedValue([mockPremiumUser]);
      (alertPreferencesRepository.findByUserId as jest.Mock).mockResolvedValue(preferencesNoPump);
      (alertPreferencesRepository.findUsersWithPumpAlertsEnabled as jest.Mock).mockResolvedValue([]);
      mockExchangeAggregator.getCurrentPrice = jest.fn()
        .mockResolvedValueOnce(50000)
        .mockResolvedValueOnce(55500); // 11% increase

      // First check to populate cache
      await alertService.detectPumpSignals();

      // Second check - should not send alert
      await alertService.detectPumpSignals();

      expect(alertRepository.create).not.toHaveBeenCalled();
    });

    it('should handle exchange errors gracefully', async () => {
      (userRepository.findByRole as jest.Mock).mockResolvedValue([mockPremiumUser]);
      (alertPreferencesRepository.findByUserId as jest.Mock).mockResolvedValue(mockPreferences);
      mockExchangeAggregator.getCurrentPrice = jest.fn().mockRejectedValue(new Error('Exchange error'));

      await expect(alertService.detectPumpSignals()).resolves.not.toThrow();
    });
  });

  describe('clearCache', () => {
    it('should clear the price cache', async () => {
      (userRepository.findByRole as jest.Mock).mockResolvedValue([mockPremiumUser]);
      (alertPreferencesRepository.findByUserId as jest.Mock).mockResolvedValue(mockPreferences);
      mockExchangeAggregator.getCurrentPrice = jest.fn().mockResolvedValue(50000);

      // Populate cache
      await alertService.checkPriceMovements();

      // Clear cache
      alertService.clearCache();

      // Check again - should not have cached data
      await alertService.checkPriceMovements();

      // Should not send alerts because cache was cleared
      expect(alertRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('integration scenarios', () => {
    it('should handle multiple users with different preferences', async () => {
      const user2Preferences: AlertPreferences = {
        id: 'pref-2',
        userId: 'user-2',
        priceMovementThreshold: 10,
        enablePumpAlerts: false,
        cryptocurrencies: ['BTC'],
        updatedAt: new Date(),
      };

      (userRepository.findByRole as jest.Mock).mockResolvedValue([mockPremiumUser, mockPremiumUser]);
      (alertPreferencesRepository.findByUserId as jest.Mock)
        .mockResolvedValueOnce(mockPreferences)
        .mockResolvedValueOnce(user2Preferences);
      (alertPreferencesRepository.findUsersMonitoringCrypto as jest.Mock).mockResolvedValue(['user-1', 'user-2']);
      (userRepository.findById as jest.Mock).mockResolvedValue(mockPremiumUser);
      mockExchangeAggregator.getCurrentPrice = jest.fn()
        .mockResolvedValueOnce(50000)
        .mockResolvedValueOnce(53000); // 6% increase

      // First check to populate cache
      await alertService.checkPriceMovements();

      // Second check to trigger alerts
      await alertService.checkPriceMovements();

      // User 1 should get alert (threshold 5%)
      // User 2 should not get alert (threshold 10%)
      expect(alertRepository.create).toHaveBeenCalledTimes(1);
      expect(alertRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
        })
      );
    });

    it('should handle empty monitored cryptocurrencies list', async () => {
      (userRepository.findByRole as jest.Mock).mockResolvedValue([]);

      await expect(alertService.checkPriceMovements()).resolves.not.toThrow();
      expect(mockExchangeAggregator.getCurrentPrice).not.toHaveBeenCalled();
    });
  });
});
