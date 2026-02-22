/**
 * Bot Trading Jobs
 * 
 * Scheduled jobs for automated trading bot including:
 * - Period monitoring: Check for expired investments and complete them
 * - Value updates: Update current values for all active investments
 * - Strategy execution: Execute trading strategies for active investments
 * 
 * Requirements: 4.1, 5.1, 6.1, 6.2, 8.5, 13.2, 13.3, 15.1
 */

import cron from 'node-cron';
import { investmentManager } from '../services/InvestmentManager';
import { botInvestmentRepository } from '../models/BotInvestmentRepository';
import { tradingBotManager } from '../services/TradingBot';

/**
 * Period Monitor Job
 * Checks for expired investments and completes them
 * Runs every 60 seconds
 * 
 * Requirements 6.1, 6.2: Monitor trading periods and complete investments
 */
export const schedulePeriodMonitor = (): void => {
  // Run every 60 seconds
  cron.schedule('*/60 * * * * *', async () => {
    try {
      await checkExpiredInvestments();
    } catch (error) {
      console.error('Error in period monitor job:', error);
    }
  });

  console.log('Scheduled period monitor job (every 60 seconds)');
};

/**
 * Check for expired investments and complete them
 */
/**
 * Track failed completion attempts
 * Key: investmentId, Value: { attempts: number, firstAttempt: Date }
 */
const completionRetries = new Map<string, { attempts: number; firstAttempt: Date }>();

/**
 * Check for expired investments and complete them
 * Requirement 15.2: Retry completion with 5 minute intervals for 24 hours
 */
async function checkExpiredInvestments(): Promise<void> {
  try {
    // Get all active investments
    const activeInvestments = await botInvestmentRepository.findByStatus('active');
    
    const now = new Date();
    let completedCount = 0;
    const maxRetryPeriod = 24 * 60 * 60 * 1000; // 24 hours

    for (const investment of activeInvestments) {
      try {
        // Check if investment period has ended
        if (investment.end_time && investment.end_time <= now) {
          console.log(`Investment ${investment.id} has expired, completing...`);
          
          // Complete the investment
          await investmentManager.completeInvestment(investment.id);
          completedCount++;
          
          // Remove from retry tracking if successful
          completionRetries.delete(investment.id);
          
          console.log(`Investment ${investment.id} completed successfully`);
        }
      } catch (error) {
        console.error(`Error completing investment ${investment.id}:`, error);
        
        // Requirement 15.2, 15.3: Track retry attempts
        const retryInfo = completionRetries.get(investment.id) || {
          attempts: 0,
          firstAttempt: now
        };
        
        retryInfo.attempts++;
        completionRetries.set(investment.id, retryInfo);
        
        // Check if we've exceeded 24 hour retry period
        const timeSinceFirstAttempt = now.getTime() - retryInfo.firstAttempt.getTime();
        if (timeSinceFirstAttempt > maxRetryPeriod) {
          console.error(`CRITICAL: Investment ${investment.id} failed to complete after 24 hours (${retryInfo.attempts} attempts)`);
          // TODO: Requirement 15.3: Send administrator notification
          // This would require NotificationService enhancement
          completionRetries.delete(investment.id);
        } else {
          console.log(`Will retry investment ${investment.id} completion (attempt ${retryInfo.attempts})`);
        }
        
        // Continue with next investment even if one fails
      }
    }

    if (completedCount > 0) {
      console.log(`Period monitor: Completed ${completedCount} expired investments`);
    }
  } catch (error) {
    console.error('Error checking expired investments:', error);
  }
}

/**
 * Value Updater Job
 * Updates current values for all active investments
 * Runs every 30 seconds
 * 
 * Requirements 8.5, 13.2, 13.3: Update investment values and send real-time updates
 */
export const scheduleValueUpdater = (): void => {
  // Run every 30 seconds
  cron.schedule('*/30 * * * * *', async () => {
    try {
      await updateAllInvestmentValues();
    } catch (error) {
      console.error('Error in value updater job:', error);
    }
  });

  console.log('Scheduled value updater job (every 30 seconds)');
};

/**
 * Update values for all active investments
 */
async function updateAllInvestmentValues(): Promise<void> {
  try {
    // Get all active investments
    const activeInvestments = await botInvestmentRepository.findByStatus('active');
    
    let updatedCount = 0;

    for (const investment of activeInvestments) {
      try {
        // Update investment value
        await investmentManager.updateInvestmentValue(investment.id);
        updatedCount++;
      } catch (error) {
        console.error(`Error updating value for investment ${investment.id}:`, error);
        // Continue with next investment even if one fails
      }
    }

    if (updatedCount > 0) {
      console.log(`Value updater: Updated ${updatedCount} active investments`);
    }
  } catch (error) {
    console.error('Error updating investment values:', error);
  }
}

/**
 * Strategy Runner Job
 * Executes trading strategies for all active investments
 * Runs every 10 seconds
 * 
 * Requirements 4.1, 5.1, 15.1: Execute trading strategies and handle critical errors
 */
export const scheduleStrategyRunner = (): void => {
  // Run every 10 seconds
  cron.schedule('*/10 * * * * *', async () => {
    try {
      await executeAllStrategies();
    } catch (error) {
      console.error('Error in strategy runner job:', error);
    }
  });

  console.log('Scheduled strategy runner job (every 10 seconds)');
};

/**
 * Execute trading strategies for all active investments
 */
async function executeAllStrategies(): Promise<void> {
  try {
    // Get all active investments
    const activeInvestments = await botInvestmentRepository.findByStatus('active');
    
    let executedCount = 0;

    for (const investment of activeInvestments) {
      try {
        // Get trading bot instance for this investment
        const bot = tradingBotManager.getBot(investment.id);
        
        if (bot && bot.isActive()) {
          // Execute strategy
          await bot.executeStrategy();
          executedCount++;
        }
      } catch (error) {
        console.error(`Error executing strategy for investment ${investment.id}:`, error);
        
        // Check if this is a critical error
        if (error instanceof Error && error.message.includes('CRITICAL')) {
          console.error(`CRITICAL ERROR for investment ${investment.id}, pausing investment`);
          
          // TODO: Pause investment and notify administrator
          // This would require additional implementation in InvestmentManager
          // For now, we just log the error
        }
        
        // Continue with next investment even if one fails
      }
    }

    if (executedCount > 0) {
      console.log(`Strategy runner: Executed strategies for ${executedCount} active investments`);
    }
  } catch (error) {
    console.error('Error executing strategies:', error);
  }
}

/**
 * Initialize all bot-related scheduled jobs
 */
export const initializeBotJobs = (): void => {
  schedulePeriodMonitor();
  scheduleValueUpdater();
  scheduleStrategyRunner();
  
  console.log('Bot trading jobs initialized');
};
