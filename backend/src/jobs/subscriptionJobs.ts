/**
 * Subscription Jobs
 * 
 * Scheduled jobs for subscription management including:
 * - Checking and processing expired subscriptions
 * - Reverting user roles when subscriptions expire
 * 
 * Requirements: 1.3, 8.4
 */

import cron from 'node-cron';
import { subscriptionManager } from '../services/SubscriptionManager';

/**
 * Schedule job to check expired subscriptions
 * Runs daily at 00:00 (midnight)
 * Requirement 1.3: Role downgrade on subscription expiration
 */
export const scheduleExpiredSubscriptionCheck = (): void => {
  // Run daily at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('Running expired subscription check job...');
    try {
      await subscriptionManager.checkExpiredSubscriptions();
      console.log('Expired subscription check completed successfully');
    } catch (error) {
      console.error('Error checking expired subscriptions:', error);
    }
  });

  console.log('Scheduled expired subscription check job (daily at midnight)');
};

/**
 * Initialize all subscription-related scheduled jobs
 */
export const initializeSubscriptionJobs = (): void => {
  scheduleExpiredSubscriptionCheck();
};
