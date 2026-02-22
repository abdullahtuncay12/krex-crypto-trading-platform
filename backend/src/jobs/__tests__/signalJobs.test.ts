/**
 * Signal Jobs Tests
 * 
 * Unit tests for scheduled signal generation jobs including:
 * - Signal generation scheduling
 * - Job initialization
 * 
 * Requirements: 3.5
 */

import cron from 'node-cron';
import { SignalGenerator } from '../../services/SignalGenerator';
import { scheduleSignalGeneration, initializeSignalJobs } from '../signalJobs';

// Mock dependencies
jest.mock('node-cron');
jest.mock('../../services/SignalGenerator');

describe('Signal Jobs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('scheduleSignalGeneration', () => {
    it('should schedule a cron job to run every hour', () => {
      // Arrange
      const mockSchedule = jest.fn();
      (cron.schedule as jest.Mock) = mockSchedule;

      // Act
      scheduleSignalGeneration();

      // Assert
      expect(mockSchedule).toHaveBeenCalledWith(
        '0 * * * *',
        expect.any(Function)
      );
    });

    it('should generate signals for all supported cryptocurrencies when cron job executes', async () => {
      // Arrange
      let cronCallback: () => Promise<void>;
      (cron.schedule as jest.Mock).mockImplementation((schedule, callback) => {
        cronCallback = callback;
      });

      const mockGenerateBasic = jest.fn().mockResolvedValue({
        recommendation: 'buy',
        confidence: 75,
        timestamp: new Date(),
        basicAnalysis: 'Test analysis',
      });

      const mockGeneratePremium = jest.fn().mockResolvedValue({
        recommendation: 'buy',
        confidence: 75,
        timestamp: new Date(),
        basicAnalysis: 'Test analysis',
        stopLoss: 50000,
        limitOrder: 60000,
        riskLevel: 'medium',
        detailedAnalysis: 'Detailed test analysis',
      });

      (SignalGenerator as jest.Mock).mockImplementation(() => ({
        generateBasicSignal: mockGenerateBasic,
        generatePremiumSignal: mockGeneratePremium,
      }));

      // Spy on console.log
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      scheduleSignalGeneration();
      await cronCallback!();

      // Assert
      expect(mockGenerateBasic).toHaveBeenCalledWith('BTC');
      expect(mockGenerateBasic).toHaveBeenCalledWith('ETH');
      expect(mockGeneratePremium).toHaveBeenCalledWith('BTC');
      expect(mockGeneratePremium).toHaveBeenCalledWith('ETH');
      expect(consoleSpy).toHaveBeenCalledWith('Running signal generation job...');
      expect(consoleSpy).toHaveBeenCalledWith('Signal generation completed successfully');

      consoleSpy.mockRestore();
    });

    it('should handle errors during signal generation and continue with other cryptocurrencies', async () => {
      // Arrange
      let cronCallback: () => Promise<void>;
      (cron.schedule as jest.Mock).mockImplementation((schedule, callback) => {
        cronCallback = callback;
      });

      const mockError = new Error('Exchange API failed');
      const mockGenerateBasic = jest.fn()
        .mockRejectedValueOnce(mockError) // Fail for BTC
        .mockResolvedValueOnce({ recommendation: 'hold' }); // Succeed for ETH

      const mockGeneratePremium = jest.fn()
        .mockRejectedValueOnce(mockError) // Fail for BTC
        .mockResolvedValueOnce({ recommendation: 'hold' }); // Succeed for ETH

      (SignalGenerator as jest.Mock).mockImplementation(() => ({
        generateBasicSignal: mockGenerateBasic,
        generatePremiumSignal: mockGeneratePremium,
      }));

      // Spy on console methods
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      scheduleSignalGeneration();
      await cronCallback!();

      // Assert
      expect(mockGenerateBasic).toHaveBeenCalledTimes(2);
      expect(mockGeneratePremium).toHaveBeenCalledTimes(2);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error generating signals for BTC:',
        mockError
      );
      expect(consoleLogSpy).toHaveBeenCalledWith('Signal generation completed successfully');

      consoleLogSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('should handle complete job failure', async () => {
      // Arrange
      let cronCallback: () => Promise<void>;
      (cron.schedule as jest.Mock).mockImplementation((schedule, callback) => {
        cronCallback = callback;
      });

      const mockError = new Error('Critical failure');
      (SignalGenerator as jest.Mock).mockImplementation(() => {
        throw mockError;
      });

      // Spy on console methods
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      scheduleSignalGeneration();
      await cronCallback!();

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error generating signals:',
        mockError
      );

      consoleLogSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('initializeSignalJobs', () => {
    it('should initialize all signal jobs', () => {
      // Arrange
      const mockSchedule = jest.fn();
      (cron.schedule as jest.Mock) = mockSchedule;

      // Spy on console.log
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      initializeSignalJobs();

      // Assert
      expect(mockSchedule).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Scheduled signal generation job (every hour)'
      );

      consoleSpy.mockRestore();
    });
  });
});
