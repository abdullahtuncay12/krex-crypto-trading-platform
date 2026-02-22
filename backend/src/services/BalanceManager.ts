/**
 * BalanceManager Service
 * 
 * Manages user balance operations for bot trading investments.
 * Handles balance queries, deductions, credits, and validation.
 * 
 * Requirements: 1.2, 1.6, 11.1, 11.2, 11.3, 11.4, 11.6
 */

import { pool } from '../config/database';
import { userRepository } from '../models/UserRepository';
import { botInvestmentRepository } from '../models/BotInvestmentRepository';

export class BalanceManager {
  /**
   * Get user's total balance
   * Requirement 1.2: Query user balance
   * Requirement 11.6: Display current balance
   */
  async getUserBalance(userId: string): Promise<number> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user.balance;
  }

  /**
   * Get user's available balance (total - locked in active investments)
   * Requirement 11.6: Calculate available balance excluding locked funds
   */
  async getAvailableBalance(userId: string): Promise<number> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get total locked in active investments
    const activeInvestments = await botInvestmentRepository.findByUserId(userId, 'active');
    const lockedAmount = activeInvestments.reduce((sum, inv) => sum + inv.principalAmount, 0);

    return user.balance - lockedAmount;
  }

  /**
   * Validate if user has sufficient balance for an investment
   * Requirement 1.2: Validate sufficient balance before investment
   */
  async validateSufficientBalance(userId: string, amount: number): Promise<boolean> {
    const availableBalance = await this.getAvailableBalance(userId);
    return availableBalance >= amount;
  }

  /**
   * Get locked balance (total amount in active investments)
   */
  async getLockedBalance(userId: string): Promise<number> {
    const activeInvestments = await botInvestmentRepository.findByUserId(userId, 'active');
    return activeInvestments.reduce((sum, inv) => sum + inv.principalAmount, 0);
  }

  /**
   * Get balance breakdown
   */
  async getBalanceBreakdown(userId: string): Promise<{
    totalBalance: number;
    availableBalance: number;
    lockedBalance: number;
  }> {
    const totalBalance = await this.getUserBalance(userId);
    const lockedBalance = await this.getLockedBalance(userId);
    const availableBalance = totalBalance - lockedBalance;

    return {
      totalBalance,
      availableBalance,
      lockedBalance
    };
  }

  /**
   * Deduct balance for investment creation (atomic transaction)
   * Requirement 1.6: Deduct principal amount from user balance
   * Requirement 11.1: Atomic transaction for balance deduction
   * Requirement 11.4: Audit log for balance changes
   */
  async deductForInvestment(userId: string, amount: number, investmentId: string): Promise<void> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Validate sufficient balance
      const hasSufficientBalance = await this.validateSufficientBalance(userId);
      if (!hasSufficientBalance) {
        throw new Error('Insufficient balance');
      }

      // Get current balance
      const user = await userRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const oldBalance = user.balance;
      const newBalance = oldBalance - amount;

      // Update user balance
      await client.query(
        'UPDATE users SET balance = $1 WHERE id = $2',
        [newBalance, userId]
      );

      // Create audit log
      await client.query(
        `INSERT INTO audit_logs (entity_type, entity_id, action, old_state, new_state, user_id, timestamp)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [
          'user_balance',
          userId,
          'deduct_for_investment',
          JSON.stringify({ balance: oldBalance, investmentId }),
          JSON.stringify({ balance: newBalance, investmentId }),
          userId
        ]
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Credit balance from investment completion (atomic transaction)
   * Requirement 6.7: Credit final value to user balance
   * Requirement 11.2: Atomic transaction for balance credit
   * Requirement 11.3: Deduct commission before crediting
   * Requirement 11.4: Audit log for balance changes
   */
  async creditFromInvestment(
    userId: string,
    finalValue: number,
    commission: number,
    investmentId: string
  ): Promise<void> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Get current balance
      const user = await userRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const oldBalance = user.balance;
      const creditAmount = finalValue - commission;
      const newBalance = oldBalance + creditAmount;

      // Update user balance
      await client.query(
        'UPDATE users SET balance = $1 WHERE id = $2',
        [newBalance, userId]
      );

      // Create audit log
      await client.query(
        `INSERT INTO audit_logs (entity_type, entity_id, action, old_state, new_state, user_id, timestamp)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [
          'user_balance',
          userId,
          'credit_from_investment',
          JSON.stringify({ balance: oldBalance, investmentId }),
          JSON.stringify({ balance: newBalance, investmentId, finalValue, commission, creditAmount }),
          userId
        ]
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Rollback balance deduction (for failed investment creation)
   * Requirement 11.1: Transaction rollback on failure
   */
  async rollbackDeduction(userId: string, amount: number, investmentId: string): Promise<void> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Get current balance
      const user = await userRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const oldBalance = user.balance;
      const newBalance = oldBalance + amount;

      // Restore user balance
      await client.query(
        'UPDATE users SET balance = $1 WHERE id = $2',
        [newBalance, userId]
      );

      // Create audit log
      await client.query(
        `INSERT INTO audit_logs (entity_type, entity_id, action, old_state, new_state, user_id, timestamp)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [
          'user_balance',
          userId,
          'rollback_deduction',
          JSON.stringify({ balance: oldBalance, investmentId }),
          JSON.stringify({ balance: newBalance, investmentId, rolledBackAmount: amount }),
          userId
        ]
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

// Export singleton instance
export const balanceManager = new BalanceManager();
