/**
 * Signal Jobs
 * 
 * Scheduled jobs for trading signal generation including:
 * - Generating signals for all supported cryptocurrencies every hour
 * - Storing signals in database for caching
 * 
 * Requirements: 3.5
 */

import cron from 'node-cron';
import { SignalGenerator } from '../services/SignalGenerator';

// Supported cryptocurrencies
const SUPPORTED_CRYPTOCURRENCIES = [
  { symbol: 'BTC', name: 'Bitcoin' },
  { symbol: 'ETH', name: 'Ethereum' },
];

const signalGenerator = new SignalGenerator();

/**
 * Schedule job to generate signals for all supported cryptocurrencies
 * Runs every hour at minute 0
 * Requirement 3.5: Update basic signals at least once per hour
 */
export const scheduleSignalGeneration = (): void => {
  // Run every hour at minute 0
  cron.schedule('0 * * * *', async () => {
    console.log('Running signal generation job...');
    try {
      await generateAllSignals();
      console.log('Signal generation completed successfully');
    } catch (error) {
      console.error('Error generating signals:', error);
    }
  });

  console.log('Scheduled signal generation job (every hour)');
};

/**
 * Generate signals for all supported cryptocurrencies
 * Generates both basic and premium signals
 */
async function generateAllSignals(): Promise<void> {
  for (const crypto of SUPPORTED_CRYPTOCURRENCIES) {
    try {
      console.log(`Generating signals for ${crypto.symbol}...`);
      
      // Generate basic signal
      await signalGenerator.generateBasicSignal(crypto.symbol);
      console.log(`Basic signal generated for ${crypto.symbol}`);
      
      // Generate premium signal
      await signalGenerator.generatePremiumSignal(crypto.symbol);
      console.log(`Premium signal generated for ${crypto.symbol}`);
    } catch (error) {
      console.error(`Error generating signals for ${crypto.symbol}:`, error);
      // Continue with next cryptocurrency even if one fails
    }
  }
}

/**
 * Initialize all signal-related scheduled jobs
 */
export const initializeSignalJobs = (): void => {
  scheduleSignalGeneration();
};
