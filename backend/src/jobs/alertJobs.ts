/**
 * Alert Jobs
 * 
 * Scheduled jobs for alert monitoring including:
 * - Checking price movements every 60 seconds
 * - Detecting pump signals
 * - Sending alerts to premium users
 * 
 * Requirements: 10.1, 10.2
 */

import cron from 'node-cron';
import { alertService } from '../services/AlertService';

/**
 * Schedule job to check price movements and send alerts
 * Runs every 60 seconds
 * Requirement 10.1: Alert generation on trading opportunities
 * Requirement 10.2: Pump news detection within 60 seconds
 */
export const scheduleAlertChecking = (): void => {
  // Run every 60 seconds (every minute)
  cron.schedule('* * * * *', async () => {
    try {
      // Check price movements for all monitored cryptocurrencies
      await alertService.checkPriceMovements();
      
      // Detect pump signals
      await alertService.detectPumpSignals();
    } catch (error) {
      console.error('Error in alert checking job:', error);
    }
  });

  console.log('Scheduled alert checking job (every 60 seconds)');
};

/**
 * Initialize all alert-related scheduled jobs
 */
export const initializeAlertJobs = (): void => {
  scheduleAlertChecking();
};
