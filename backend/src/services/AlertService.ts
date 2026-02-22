/**
 * AlertService
 * 
 * Service for managing cryptocurrency price alerts and notifications for premium users.
 * Monitors price movements, detects pump signals, and sends in-app notifications.
 * Runs scheduled checks every 60 seconds.
 * 
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5
 */

import { ExchangeAggregator } from './ExchangeAggregator';
import { alertRepository } from '../models/AlertRepository';
import { alertPreferencesRepository } from '../models/AlertPreferencesRepository';
import { userRepository } from '../models/UserRepository';
import { CreateAlertInput } from '../models/Alert';

interface PriceCache {
  [symbol: string]: {
    price: number;
    timestamp: Date;
  };
}

export class AlertService {
  private exchangeAggregator: ExchangeAggregator;
  private priceCache: PriceCache = {};
  private readonly PUMP_THRESHOLD = 10; // 10% price increase in 60 seconds
  private readonly CHECK_INTERVAL = 60000; // 60 seconds

  constructor() {
    this.exchangeAggregator = new ExchangeAggregator();
  }

  /**
   * Check price movements for all monitored cryptocurrencies
   * Runs every 60 seconds to detect significant price changes
   * Requirement 10.1: Alert generation on trading opportunities
   * Requirement 10.2: Pump news detection within 60 seconds
   */
  async checkPriceMovements(): Promise<void> {
    try {
      // Get all unique cryptocurrencies being monitored
      const monitoredCryptos = await this.getMonitoredCryptocurrencies();

      // Check each cryptocurrency for price movements
      for (const crypto of monitoredCryptos) {
        await this.checkCryptoPriceMovement(crypto);
      }
    } catch (error) {
      console.error('Error checking price movements:', error);
    }
  }

  /**
   * Detect pump signals across monitored cryptocurrencies
   * A pump is detected when price increases by PUMP_THRESHOLD% or more in 60 seconds
   * Requirement 10.2: Pump news detection within 60 seconds
   */
  async detectPumpSignals(): Promise<void> {
    try {
      // Get all unique cryptocurrencies being monitored
      const monitoredCryptos = await this.getMonitoredCryptocurrencies();

      // Check each cryptocurrency for pump signals
      for (const crypto of monitoredCryptos) {
        await this.checkForPump(crypto);
      }
    } catch (error) {
      console.error('Error detecting pump signals:', error);
    }
  }

  /**
   * Send alert to a specific user
   * Queries user alert preferences before sending
   * Stores alert in database for in-app notifications
   * Requirement 10.3: Query user alert preferences before sending
   * Requirement 10.4: Alert content completeness
   * Requirement 10.5: Deliver alerts through in-app notifications
   */
  async sendAlert(userId: string, alertInput: Omit<CreateAlertInput, 'userId'>): Promise<void> {
    try {
      // Verify user is premium
      const user = await userRepository.findById(userId);
      if (!user || user.role !== 'premium') {
        console.warn(`Attempted to send alert to non-premium user: ${userId}`);
        return;
      }

      // Get user alert preferences
      const preferences = await alertPreferencesRepository.findByUserId(userId);
      if (!preferences) {
        console.warn(`No alert preferences found for user: ${userId}`);
        return;
      }

      // Check if user is monitoring this cryptocurrency
      if (!preferences.cryptocurrencies.includes(alertInput.cryptocurrency)) {
        return;
      }

      // Check if pump alerts are enabled for pump_detected type
      if (alertInput.alertType === 'pump_detected' && !preferences.enablePumpAlerts) {
        return;
      }

      // Create alert in database
      await alertRepository.create({
        userId,
        ...alertInput,
      });

      console.log(`Alert sent to user ${userId}: ${alertInput.message}`);
    } catch (error) {
      console.error(`Error sending alert to user ${userId}:`, error);
    }
  }

  /**
   * Get all unique cryptocurrencies being monitored by premium users
   */
  private async getMonitoredCryptocurrencies(): Promise<string[]> {
    const premiumUsers = await userRepository.findByRole('premium');
    const cryptoSet = new Set<string>();

    for (const user of premiumUsers) {
      const preferences = await alertPreferencesRepository.findByUserId(user.id);
      if (preferences) {
        preferences.cryptocurrencies.forEach((crypto) => cryptoSet.add(crypto));
      }
    }

    return Array.from(cryptoSet);
  }

  /**
   * Check price movement for a specific cryptocurrency
   * Sends alerts to users if price change exceeds their threshold
   */
  private async checkCryptoPriceMovement(cryptocurrency: string): Promise<void> {
    try {
      // Get current price
      const currentPrice = await this.exchangeAggregator.getCurrentPrice(cryptocurrency);

      // Get cached price from previous check
      const cachedData = this.priceCache[cryptocurrency];

      if (cachedData) {
        // Calculate price change percentage
        const priceChange = ((currentPrice - cachedData.price) / cachedData.price) * 100;
        const absChange = Math.abs(priceChange);

        // Get users monitoring this cryptocurrency
        const userIds = await alertPreferencesRepository.findUsersMonitoringCrypto(cryptocurrency);

        // Send alerts to users whose threshold is exceeded
        for (const userId of userIds) {
          const preferences = await alertPreferencesRepository.findByUserId(userId);
          if (preferences && absChange >= preferences.priceMovementThreshold) {
            const direction = priceChange > 0 ? 'increased' : 'decreased';
            const message = `${cryptocurrency} price ${direction} by ${absChange.toFixed(2)}% to $${currentPrice.toFixed(2)}`;

            await this.sendAlert(userId, {
              cryptocurrency,
              alertType: 'price_movement',
              message,
            });
          }
        }
      }

      // Update price cache
      this.priceCache[cryptocurrency] = {
        price: currentPrice,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error(`Error checking price movement for ${cryptocurrency}:`, error);
    }
  }

  /**
   * Check for pump signal on a specific cryptocurrency
   * Sends alerts to users with pump alerts enabled
   */
  private async checkForPump(cryptocurrency: string): Promise<void> {
    try {
      // Get current price
      const currentPrice = await this.exchangeAggregator.getCurrentPrice(cryptocurrency);

      // Get cached price from previous check
      const cachedData = this.priceCache[cryptocurrency];

      if (cachedData) {
        // Calculate price change percentage
        const priceChange = ((currentPrice - cachedData.price) / cachedData.price) * 100;

        // Check if pump threshold is exceeded (only positive movements)
        if (priceChange >= this.PUMP_THRESHOLD) {
          // Get users with pump alerts enabled
          const userIds = await alertPreferencesRepository.findUsersWithPumpAlertsEnabled();

          // Send pump alerts to users monitoring this cryptocurrency
          for (const userId of userIds) {
            const preferences = await alertPreferencesRepository.findByUserId(userId);
            if (preferences && preferences.cryptocurrencies.includes(cryptocurrency)) {
              const message = `PUMP DETECTED: ${cryptocurrency} surged ${priceChange.toFixed(2)}% to $${currentPrice.toFixed(2)} in the last 60 seconds!`;

              await this.sendAlert(userId, {
                cryptocurrency,
                alertType: 'pump_detected',
                message,
              });
            }
          }
        }
      }

      // Update price cache
      this.priceCache[cryptocurrency] = {
        price: currentPrice,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error(`Error checking pump signal for ${cryptocurrency}:`, error);
    }
  }

  /**
   * Start the alert monitoring service
   * Runs checkPriceMovements and detectPumpSignals every 60 seconds
   */
  startMonitoring(): void {
    console.log('AlertService monitoring started');

    // Run immediately on start
    this.checkPriceMovements();
    this.detectPumpSignals();

    // Schedule periodic checks
    setInterval(() => {
      this.checkPriceMovements();
      this.detectPumpSignals();
    }, this.CHECK_INTERVAL);
  }

  /**
   * Clear price cache (useful for testing)
   */
  clearCache(): void {
    this.priceCache = {};
  }
}

// Export singleton instance
export const alertService = new AlertService();
