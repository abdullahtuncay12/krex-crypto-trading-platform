/**
 * InvestmentManager Service
 * 
 * Manages bot trading investment lifecycle including creation, queries, and validation.
 * Orchestrates BalanceManager, TradingBot, and NotificationService.
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 3.6, 3.7, 8.1, 8.2, 8.6, 8.7, 14.2, 14.3, 19.1
 */

import { pool } from '../config/database';
import { botInvestmentRepository } from '../models/BotInvestmentRepository';
import { BotInvestment, CreateBotInvestmentInput } from '../models/BotInvestment';
import { balanceManager } from './BalanceManager';
import { tradingBotManager } from './TradingBot';
import { notificationService } from './NotificationService';
import { userRepository } from '../models/UserRepository';

export interface CreateInvestmentInput {
  userId: string;
  cryptocurrency: string;
  principalAmount: number;
  tradingPeriodHours: number;
  riskAcknowledgedAt: Date;
}

export interface PortfolioSummary {
  totalInvestments: number;
  activeInvestments: number;
  completedInvestments: number;
  totalPortfolioValue: number;
  lifetimeProfit: number;
  lifetimeCommission: number;
}

export class InvestmentManager {
  // Supported cryptocurrencies
  private readonly SUPPORTED_CRYPTOCURRENCIES = ['BTC', 'ETH', 'BNB', 'SOL', 'ADA'];
  
  // Valid trading periods (in hours)
  private readonly VALID_TRADING_PERIODS = [1, 2, 3, 4, 5, 6, 12, 24, 48, 60];
  
  // Amount limits (in USDT)
  private readonly MIN_AMOUNT = 100;
  private readonly MAX_AMOUNT = 100000;

  /**
   * Validate investment amount
   * Requirement 1.1: Amount must be between 100-100,000 USDT
   * @param amount - Investment amount in USDT
   */
  validateAmount(amount: number): void {
    if (amount < this.MIN_AMOUNT) {
      throw new Error(`Minimum yatırım tutarı ${this.MIN_AMOUNT} USDT'dir`);
    }
    if (amount > this.MAX_AMOUNT) {
      throw new Error(`Maksimum yatırım tutarı ${this.MAX_AMOUNT} USDT'dir`);
    }
  }

  /**
   * Validate trading period
   * Requirement 1.3: Trading period must be one of the valid options
   * @param hours - Trading period in hours
   */
  validateTradingPeriod(hours: number): void {
    if (!this.VALID_TRADING_PERIODS.includes(hours)) {
      throw new Error(`Geçersiz işlem süresi. Geçerli değerler: ${this.VALID_TRADING_PERIODS.join(', ')} saat`);
    }
  }

  /**
   * Validate cryptocurrency
   * Requirement 1.4: Cryptocurrency must be supported
   * @param cryptocurrency - Cryptocurrency symbol
   */
  validateCryptocurrency(cryptocurrency: string): void {
    if (!this.SUPPORTED_CRYPTOCURRENCIES.includes(cryptocurrency.toUpperCase())) {
      throw new Error(`Desteklenmeyen kripto para. Desteklenen: ${this.SUPPORTED_CRYPTOCURRENCIES.join(', ')}`);
    }
  }

  /**
   * Validate risk acknowledgment
   * Requirement 3.6: User must acknowledge risks
   * @param riskAcknowledgedAt - Risk acknowledgment timestamp
   */
  validateRiskAcknowledgment(riskAcknowledgedAt: Date): void {
    if (!riskAcknowledgedAt) {
      throw new Error('Risk bildirimi onaylanmalıdır');
    }
    
    // Check if acknowledgment is recent (within last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (riskAcknowledgedAt < fiveMinutesAgo) {
      throw new Error('Risk bildirimi süresi dolmuş. Lütfen tekrar onaylayın');
    }
  }

  /**
   * Get supported cryptocurrencies
   */
  getSupportedCryptocurrencies(): string[] {
    return [...this.SUPPORTED_CRYPTOCURRENCIES];
  }

  /**
   * Get valid trading periods
   */
  getValidTradingPeriods(): number[] {
    return [...this.VALID_TRADING_PERIODS];
  }

  /**
   * Get amount limits
   */
  getAmountLimits(): { min: number; max: number } {
    return {
      min: this.MIN_AMOUNT,
      max: this.MAX_AMOUNT
    };
  }

  /**
   * Create a new bot investment
   * Requirement 1.1: Validate amount (100-100,000 USDT)
   * Requirement 1.2: Validate sufficient balance
   * Requirement 1.3: Validate trading period
   * Requirement 1.4: Validate cryptocurrency
   * Requirement 1.5: Create investment record with 'active' status
   * Requirement 1.6: Deduct principal from user balance
   * Requirement 1.7: Record timestamp with millisecond precision
   * Requirement 3.7: Require premium subscription
   * Requirement 14.3: Require authentication
   * Requirement 19.1: Create audit log
   * @param input - Investment creation input
   */
  async createInvestment(input: CreateInvestmentInput): Promise<BotInvestment> {
    const { userId, cryptocurrency, principalAmount, tradingPeriodHours, riskAcknowledgedAt } = input;

    // Validate user exists and has premium subscription
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('Kullanıcı bulunamadı');
    }

    // Requirement 3.7: Premium subscription required
    if (user.role !== 'premium') {
      throw new Error('Bot trading özelliği premium üyelere özeldir');
    }

    // Validate inputs
    this.validateAmount(principalAmount);
    this.validateTradingPeriod(tradingPeriodHours);
    this.validateCryptocurrency(cryptocurrency);
    this.validateRiskAcknowledgment(riskAcknowledgedAt);

    // Requirement 1.2: Validate sufficient balance
    const hasSufficientBalance = await balanceManager.validateSufficientBalance(userId, principalAmount);
    if (!hasSufficientBalance) {
      const availableBalance = await balanceManager.getAvailableBalance(userId);
      throw new Error(`Yetersiz bakiye. Mevcut bakiye: ${availableBalance.toFixed(2)} USDT`);
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Requirement 1.7: Millisecond precision timestamp
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + tradingPeriodHours * 60 * 60 * 1000);

      // Requirement 1.5: Create investment with 'active' status
      const investmentInput: CreateBotInvestmentInput = {
        userId,
        cryptocurrency: cryptocurrency.toUpperCase(),
        principalAmount,
        tradingPeriodHours,
        startTime,
        riskAcknowledgedAt
      };

      const investment = await botInvestmentRepository.create(investmentInput);

      // Requirement 1.6: Deduct balance
      await balanceManager.deductForInvestment(userId, principalAmount, investment.id);

      // Start trading bot
      await tradingBotManager.createBot({
        investmentId: investment.id,
        cryptocurrency: investment.cryptocurrency,
        principalAmount: investment.principalAmount
      });

      // Send notification
      await notificationService.sendInvestmentCreated(investment);

      // Requirement 19.1: Audit log (already created in BalanceManager.deductForInvestment)

      await client.query('COMMIT');

      return investment;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Investment creation failed:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get investments for a user
   * Requirement 8.1: Query user's investments
   * Requirement 8.2: Filter by status
   * Requirement 14.2: Authorization - user can only access own investments
   * @param userId - User ID
   * @param status - Optional status filter
   */
  async getInvestments(userId: string, status?: 'active' | 'completed' | 'cancelled'): Promise<BotInvestment[]> {
    return botInvestmentRepository.findByUserId(userId, status);
  }

  /**
   * Get investment by ID
   * Requirement 8.1: Query investment details
   * Requirement 14.2: Authorization - user can only access own investments
   * @param investmentId - Investment ID
   * @param userId - User ID (for authorization)
   */
  async getInvestmentById(investmentId: string, userId: string): Promise<BotInvestment> {
    const investment = await botInvestmentRepository.findById(investmentId);
    
    if (!investment) {
      throw new Error('Yatırım bulunamadı');
    }

    // Authorization check
    if (investment.userId !== userId) {
      throw new Error('Bu yatırıma erişim yetkiniz yok');
    }

    return investment;
  }

  /**
   * Get portfolio summary for a user
   * Requirement 8.6: Display total portfolio value
   * Requirement 8.7: Display lifetime profit/loss
   * @param userId - User ID
   */
  async getPortfolioSummary(userId: string): Promise<PortfolioSummary> {
    const stats = await botInvestmentRepository.getUserStats(userId);
    
    // Calculate total portfolio value (sum of current values of active investments)
    const activeInvestments = await botInvestmentRepository.findByUserId(userId, 'active');
    const totalPortfolioValue = activeInvestments.reduce((sum, inv) => sum + inv.currentValue, 0);

    return {
      totalInvestments: stats.totalInvestments,
      activeInvestments: stats.activeInvestments,
      completedInvestments: stats.completedInvestments,
      totalPortfolioValue,
      lifetimeProfit: stats.totalProfit,
      lifetimeCommission: stats.totalCommission
    };
  }

  /**
   * Complete an investment
   * Requirement 6.2: Trigger completion when trading period ends
   * Requirement 6.3: Close all open positions
   * Requirement 6.4: Calculate profit (final_value - principal_amount)
   * Requirement 6.5: Calculate commission (1% of positive profit)
   * Requirement 6.6: Zero commission for non-profit
   * Requirement 6.7: Credit final value to user balance
   * Requirement 6.8: Update status to 'completed'
   * Requirement 7.1: Calculate payout
   * Requirement 7.2: Accumulate platform revenue
   * Requirement 7.3: Record commission in investment
   * Requirement 7.4: Credit payout to user
   * Requirement 19.1: Create audit log
   * @param investmentId - Investment ID
   */
  async completeInvestment(investmentId: string): Promise<BotInvestment> {
    const investment = await botInvestmentRepository.findById(investmentId);
    
    if (!investment) {
      throw new Error('Yatırım bulunamadı');
    }

    if (investment.status !== 'active') {
      throw new Error('Sadece aktif yatırımlar tamamlanabilir');
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Requirement 6.3: Close all open positions
      const bot = tradingBotManager.getBot(investment.id);
      const finalValue = bot ? await bot.closeAllPositions(investment.id, investment.cryptocurrency) : investment.currentValue;

      // Stop trading bot
      await tradingBotManager.removeBot(investment.id);

      // Requirement 6.4: Calculate profit
      const profit = finalValue - investment.principalAmount;

      // Requirement 6.5 & 6.6: Calculate commission (1% of positive profit, 0 otherwise)
      const commission = profit > 0 ? profit * 0.01 : 0;

      // Requirement 7.1: Calculate payout (principal + profit - commission)
      const payout = investment.principalAmount + profit - commission;

      // Requirement 6.7 & 7.4: Credit payout to user balance
      await balanceManager.creditFromInvestment(
        investment.userId,
        payout,
        commission,
        investment.id
      );

      // Requirement 6.8 & 7.3: Update investment status and record commission
      const completedInvestment = await botInvestmentRepository.complete(investment.id, finalValue);

      if (!completedInvestment) {
        throw new Error('Yatırım güncellenemedi');
      }

      // Requirement 7.2: Platform revenue accumulation (commission is recorded in investment)
      // Platform can query total commissions from completed investments

      // Send notification
      await notificationService.sendInvestmentCompleted(completedInvestment);

      // Requirement 19.1: Audit log (already created in BalanceManager.creditFromInvestment)

      await client.query('COMMIT');

      return completedInvestment;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Investment completion failed:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Cancel an investment
   * Requirement 9.1: Allow cancellation of active investments
   * Requirement 9.2: Verify user authorization
   * Requirement 9.3: Close all open positions
   * Requirement 9.4: Calculate current value
   * Requirement 9.5: Apply 2% cancellation fee
   * Requirement 9.6: Calculate refund (current_value - cancellation_fee)
   * Requirement 9.7: Update status to 'cancelled' with reason and timestamp
   * Requirement 19.1: Create audit log
   * @param investmentId - Investment ID
   * @param userId - User ID (for authorization)
   * @param reason - Cancellation reason
   */
  async cancelInvestment(investmentId: string, userId: string, reason: string): Promise<BotInvestment> {
    const investment = await botInvestmentRepository.findById(investmentId);
    
    if (!investment) {
      throw new Error('Yatırım bulunamadı');
    }

    // Requirement 9.2: Authorization check
    if (investment.userId !== userId) {
      throw new Error('Bu yatırımı iptal etme yetkiniz yok');
    }

    // Requirement 9.1: Only active investments can be cancelled
    if (investment.status !== 'active') {
      throw new Error('Sadece aktif yatırımlar iptal edilebilir');
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Requirement 9.3: Close all open positions
      const bot = tradingBotManager.getBot(investment.id);
      const currentValue = bot ? await bot.closeAllPositions(investment.id, investment.cryptocurrency) : investment.currentValue;

      // Stop trading bot
      await tradingBotManager.removeBot(investment.id);

      // Requirement 9.5: Calculate cancellation fee (2% of principal)
      const cancellationFee = investment.principalAmount * 0.02;

      // Requirement 9.6: Calculate refund
      const refund = currentValue - cancellationFee;

      // Credit refund to user balance
      await balanceManager.creditFromInvestment(
        investment.userId,
        refund,
        cancellationFee,
        investment.id
      );

      // Requirement 9.7: Update investment status to 'cancelled'
      const cancelledInvestment = await botInvestmentRepository.cancel(investment.id, reason);

      if (!cancelledInvestment) {
        throw new Error('Yatırım güncellenemedi');
      }

      // Send notification
      await notificationService.sendInvestmentCancelled(cancelledInvestment);

      // Requirement 19.1: Audit log (already created in BalanceManager.creditFromInvestment)

      await client.query('COMMIT');

      return cancelledInvestment;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Investment cancellation failed:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Update investment value
   * Requirement 13.2: Update current value
   * Requirement 13.5: Record value history for charting
   * @param investmentId - Investment ID
   */
  async updateInvestmentValue(investmentId: string): Promise<void> {
    const investment = await botInvestmentRepository.findById(investmentId);
    
    if (!investment) {
      throw new Error('Yatırım bulunamadı');
    }

    if (investment.status !== 'active') {
      return; // Only update active investments
    }

    try {
      // Get current value from trading bot
      const bot = tradingBotManager.getBot(investment.id);
      const currentValue = bot ? await bot.getCurrentValue(investment.id, investment.cryptocurrency) : investment.currentValue;

      // Update investment current value
      await botInvestmentRepository.updateValue(investment.id, currentValue);

      // Record value history for charting
      const { investmentValueHistoryRepository } = await import('../models/InvestmentValueHistoryRepository');
      await investmentValueHistoryRepository.create({
        investmentId: investment.id,
        value: currentValue,
        timestamp: new Date()
      });

      // Check for profit/loss milestones
      await this.checkValueMilestones(investment, currentValue);
    } catch (error) {
      console.error(`Failed to update investment value for ${investmentId}:`, error);
      // Don't throw - value updates should not break the system
    }
  }

  /**
   * Check value milestones and send notifications
   * Requirement 13.3: Detect value changes > 1%
   * Requirement 13.4: Calculate profit/loss percentage
   * Requirement 18.3: Notify on profit > 10%
   * Requirement 18.4: Notify on loss > 5%
   * @param investment - Bot investment
   * @param currentValue - Current investment value
   */
  private async checkValueMilestones(investment: BotInvestment, currentValue: number): Promise<void> {
    const profitLoss = currentValue - investment.principalAmount;
    const profitLossPercent = (profitLoss / investment.principalAmount) * 100;

    // Check for profit milestone (>10%)
    if (profitLossPercent > 10) {
      // Check if we already sent this notification (to avoid spam)
      // In a real implementation, we'd track notification history
      await notificationService.sendProfitMilestone(investment, currentValue);
    }

    // Check for loss warning (>5%)
    if (profitLossPercent < -5) {
      // Check if we already sent this notification
      await notificationService.sendLossWarning(investment, currentValue);
    }

    // Requirement 13.3: Value change detection (>1% threshold)
    const previousValue = investment.currentValue;
    if (previousValue > 0) {
      const changePercent = Math.abs((currentValue - previousValue) / previousValue) * 100;
      if (changePercent > 1) {
        console.log(`Significant value change detected for ${investment.id}: ${changePercent.toFixed(2)}%`);
        // Could send notification here if needed
      }
    }
  }
}

// Export singleton instance
export const investmentManager = new InvestmentManager();
