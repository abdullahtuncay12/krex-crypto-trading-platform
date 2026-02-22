/**
 * Subscription Jobs Tests
 * 
 * Unit tests for scheduled subscription jobs including:
 * - Expired subscription check scheduling
 * - Job initialization
 * 
 * Requirements: 1.3, 8.4
 */

import cron from 'node-cron';
import { subscriptionManager } from '../../services/SubscriptionManager';
import { scheduleExpiredSubscriptionCheck, initializeSubscriptionJobs } from '../subscriptionJobs';

// Mock dependencies
jest.mock('node-cron');
jest.mock('../../services/SubscriptionManager');

describe('Subscription Jobs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('scheduleExpiredSubscriptionCheck', () => {
    it('should schedule a cron job to run daily at midnight', () => {
      // Arrange
      const mockSchedule = jest.fn();
      (cron.schedule as jest.Mock) = mockSchedule;

      // Act
      scheduleExpiredSubscriptionCheck();

      // Assert
      expect(mockSchedule).toHaveBeenCalledWith(
        '0 0 * * *',
        expect.any(Function)
      );
    });

    it('should call checkExpiredSubscriptions when cron job executes', async () => {
      // Arrange
      let cronCallback: () => Promise<void>;
      (cron.schedule as jest.Mock).mockImplementation((schedule, callback) => {
        cronCallback = callback;
      });

      const mockCheckExpired = jest.fn().mockResolvedValue(undefined);
      (subscriptionManager.checkExpiredSubscriptions as jest.Mock) = mockCheckExpired;

      // Spy on console.log
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      scheduleExpiredSubscriptionCheck();
      await cronCallback!();

      // Assert
      expect(mockCheckExpired).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('Running expired subscription check job...');
      expect(consoleSpy).toHaveBeenCalledWith('Expired subscription check completed successfully');

      consoleSpy.mockRestore();
    });

    it('should handle errors during expired subscription check', async () => {
      // Arrange
      let cronCallback: () => Promise<void>;
      (cron.schedule as jest.Mock).mockImplementation((schedule, callback) => {
        cronCallback = callback;
      });

      const mockError = new Error('Database connection failed');
      const mockCheckExpired = jest.fn().mockRejectedValue(mockError);
      (subscriptionManager.checkExpiredSubscriptions as jest.Mock) = mockCheckExpired;

      // Spy on console methods
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      scheduleExpiredSubscriptionCheck();
      await cronCallback!();

      // Assert
      expect(mockCheckExpired).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error checking expired subscriptions:',
        mockError
      );

      consoleLogSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('initializeSubscriptionJobs', () => {
    it('should initialize all subscription jobs', () => {
      // Arrange
      const mockSchedule = jest.fn();
      (cron.schedule as jest.Mock) = mockSchedule;

      // Spy on console.log
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      initializeSubscriptionJobs();

      // Assert
      expect(mockSchedule).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Scheduled expired subscription check job (daily at midnight)'
      );

      consoleSpy.mockRestore();
    });
  });
});
