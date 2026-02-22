/**
 * Alert Jobs Tests
 * 
 * Unit tests for scheduled alert checking jobs including:
 * - Alert checking scheduling
 * - Job initialization
 * 
 * Requirements: 10.1, 10.2
 */

import cron from 'node-cron';
import { alertService } from '../../services/AlertService';
import { scheduleAlertChecking, initializeAlertJobs } from '../alertJobs';

// Mock dependencies
jest.mock('node-cron');
jest.mock('../../services/AlertService', () => ({
  alertService: {
    checkPriceMovements: jest.fn(),
    detectPumpSignals: jest.fn(),
  },
}));

describe('Alert Jobs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('scheduleAlertChecking', () => {
    it('should schedule a cron job to run every 60 seconds', () => {
      // Arrange
      const mockSchedule = jest.fn();
      (cron.schedule as jest.Mock) = mockSchedule;

      // Act
      scheduleAlertChecking();

      // Assert
      expect(mockSchedule).toHaveBeenCalledWith(
        '* * * * *',
        expect.any(Function)
      );
    });

    it('should check price movements and detect pump signals when cron job executes', async () => {
      // Arrange
      let cronCallback: () => Promise<void>;
      (cron.schedule as jest.Mock).mockImplementation((schedule, callback) => {
        cronCallback = callback;
      });

      const mockCheckPriceMovements = alertService.checkPriceMovements as jest.Mock;
      const mockDetectPumpSignals = alertService.detectPumpSignals as jest.Mock;

      mockCheckPriceMovements.mockResolvedValue(undefined);
      mockDetectPumpSignals.mockResolvedValue(undefined);

      // Act
      scheduleAlertChecking();
      await cronCallback!();

      // Assert
      expect(mockCheckPriceMovements).toHaveBeenCalled();
      expect(mockDetectPumpSignals).toHaveBeenCalled();
    });

    it('should handle errors during alert checking', async () => {
      // Arrange
      let cronCallback: () => Promise<void>;
      (cron.schedule as jest.Mock).mockImplementation((schedule, callback) => {
        cronCallback = callback;
      });

      const mockError = new Error('Exchange API failed');
      const mockCheckPriceMovements = alertService.checkPriceMovements as jest.Mock;
      const mockDetectPumpSignals = alertService.detectPumpSignals as jest.Mock;

      mockCheckPriceMovements.mockRejectedValue(mockError);
      mockDetectPumpSignals.mockResolvedValue(undefined);

      // Spy on console.error
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      scheduleAlertChecking();
      await cronCallback!();

      // Assert
      expect(mockCheckPriceMovements).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error in alert checking job:',
        mockError
      );

      consoleErrorSpy.mockRestore();
    });

    it('should continue checking even if price movement check fails', async () => {
      // Arrange
      let cronCallback: () => Promise<void>;
      (cron.schedule as jest.Mock).mockImplementation((schedule, callback) => {
        cronCallback = callback;
      });

      const mockError = new Error('Price check failed');
      const mockCheckPriceMovements = alertService.checkPriceMovements as jest.Mock;
      const mockDetectPumpSignals = alertService.detectPumpSignals as jest.Mock;

      mockCheckPriceMovements.mockRejectedValue(mockError);
      mockDetectPumpSignals.mockResolvedValue(undefined);

      // Spy on console.error
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      scheduleAlertChecking();
      await cronCallback!();

      // Assert
      expect(mockCheckPriceMovements).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error in alert checking job:',
        mockError
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle errors during pump signal detection', async () => {
      // Arrange
      let cronCallback: () => Promise<void>;
      (cron.schedule as jest.Mock).mockImplementation((schedule, callback) => {
        cronCallback = callback;
      });

      const mockError = new Error('Pump detection failed');
      const mockCheckPriceMovements = alertService.checkPriceMovements as jest.Mock;
      const mockDetectPumpSignals = alertService.detectPumpSignals as jest.Mock;

      mockCheckPriceMovements.mockResolvedValue(undefined);
      mockDetectPumpSignals.mockRejectedValue(mockError);

      // Spy on console.error
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      scheduleAlertChecking();
      await cronCallback!();

      // Assert
      expect(mockCheckPriceMovements).toHaveBeenCalled();
      expect(mockDetectPumpSignals).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error in alert checking job:',
        mockError
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('initializeAlertJobs', () => {
    it('should initialize all alert jobs', () => {
      // Arrange
      const mockSchedule = jest.fn();
      (cron.schedule as jest.Mock) = mockSchedule;

      // Spy on console.log
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      initializeAlertJobs();

      // Assert
      expect(mockSchedule).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Scheduled alert checking job (every 60 seconds)'
      );

      consoleSpy.mockRestore();
    });
  });
});
