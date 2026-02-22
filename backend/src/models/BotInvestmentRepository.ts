/**
 * BotInvestment Repository
 * 
 * Data access layer for BotInvestment model operations.
 * Provides CRUD operations and query methods for bot_investments table.
 * 
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6
 */

import { pool } from '../config/database';
import { BotInvestment, CreateBotInvestmentInput, UpdateBotInvestmentInput, InvestmentStatus } from './BotInvestment';

export class BotInvestmentRepository {
  /**
   * Create a new bot investment
   * Requirement 10.1: Create investment with principal amount (100-100,000 USDT)
   * Requirement 10.2: Set trading period (1,2,3,4,5,6,12,24,48,60 hours)
   * Requirement 10.3: Record risk acknowledgment timestamp
   */
  async create(input: CreateBotInvestmentInput): Promise<BotInvestment> {
    const { userId, cryptocurrency, principalAmount, tradingPeriodHours, startTime, riskAcknowledgedAt } = input;
    
    // Calculate end time based on trading period
    const endTime = new Date(startTime.getTime() + tradingPeriodHours * 60 * 60 * 1000);
    
    const result = await pool.query(
      `INSERT INTO bot_investments (
        user_id, cryptocurrency, principal_amount, trading_period_hours,
        start_time, end_time, status, current_value, risk_acknowledged_at
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, user_id as "userId", cryptocurrency, principal_amount as "principalAmount",
                 trading_period_hours as "tradingPeriodHours", start_time as "startTime",
                 end_time as "endTime", status, current_value as "currentValue",
                 final_value as "finalValue", profit, commission,
                 risk_acknowledged_at as "riskAcknowledgedAt",
                 cancellation_reason as "cancellationReason", cancelled_at as "cancelledAt",
                 created_at as "createdAt", updated_at as "updatedAt"`,
      [userId, cryptocurrency, principalAmount, tradingPeriodHours, startTime, endTime, 'active', principalAmount, riskAcknowledgedAt]
    );
    
    return result.rows[0];
  }

  /**
   * Find investment by ID
   */
  async findById(id: string): Promise<BotInvestment | null> {
    const result = await pool.query(
      `SELECT id, user_id as "userId", cryptocurrency, principal_amount as "principalAmount",
              trading_period_hours as "tradingPeriodHours", start_time as "startTime",
              end_time as "endTime", status, current_value as "currentValue",
              final_value as "finalValue", profit, commission,
              risk_acknowledged_at as "riskAcknowledgedAt",
              cancellation_reason as "cancellationReason", cancelled_at as "cancelledAt",
              created_at as "createdAt", updated_at as "updatedAt"
       FROM bot_investments
       WHERE id = $1`,
      [id]
    );
    
    return result.rows[0] || null;
  }

  /**
   * Find investments by user ID
   * Requirement 10.6: Query user's investments with optional status filter
   */
  async findByUserId(userId: string, status?: InvestmentStatus): Promise<BotInvestment[]> {
    let query = `
      SELECT id, user_id as "userId", cryptocurrency, principal_amount as "principalAmount",
             trading_period_hours as "tradingPeriodHours", start_time as "startTime",
             end_time as "endTime", status, current_value as "currentValue",
             final_value as "finalValue", profit, commission,
             risk_acknowledged_at as "riskAcknowledgedAt",
             cancellation_reason as "cancellationReason", cancelled_at as "cancelledAt",
             created_at as "createdAt", updated_at as "updatedAt"
      FROM bot_investments
      WHERE user_id = $1
    `;
    
    const params: any[] = [userId];
    
    if (status) {
      query += ` AND status = $2`;
      params.push(status);
    }
    
    query += ` ORDER BY created_at DESC`;
    
    const result = await pool.query(query, params);
    
    return result.rows;
  }

  /**
   * Find investments by status
   * Requirement 10.7: Query active investments for monitoring
   */
  async findByStatus(status: InvestmentStatus): Promise<BotInvestment[]> {
    const result = await pool.query(
      `SELECT id, user_id as "userId", cryptocurrency, principal_amount as "principalAmount",
              trading_period_hours as "tradingPeriodHours", start_time as "startTime",
              end_time as "endTime", status, current_value as "currentValue",
              final_value as "finalValue", profit, commission,
              risk_acknowledged_at as "riskAcknowledgedAt",
              cancellation_reason as "cancellationReason", cancelled_at as "cancelledAt",
              created_at as "createdAt", updated_at as "updatedAt"
       FROM bot_investments
       WHERE status = $1
       ORDER BY created_at DESC`,
      [status]
    );
    
    return result.rows;
  }

  /**
   * Find investments ending soon
   * Requirement 6.1: Monitor investment periods for completion
   */
  async findEndingSoon(minutesThreshold: number = 5): Promise<BotInvestment[]> {
    const result = await pool.query(
      `SELECT id, user_id as "userId", cryptocurrency, principal_amount as "principalAmount",
              trading_period_hours as "tradingPeriodHours", start_time as "startTime",
              end_time as "endTime", status, current_value as "currentValue",
              final_value as "finalValue", profit, commission,
              risk_acknowledged_at as "riskAcknowledgedAt",
              cancellation_reason as "cancellationReason", cancelled_at as "cancelledAt",
              created_at as "createdAt", updated_at as "updatedAt"
       FROM bot_investments
       WHERE status = 'active'
         AND end_time <= NOW() + INTERVAL '${minutesThreshold} minutes'
         AND end_time > NOW()
       ORDER BY end_time ASC`,
      []
    );
    
    return result.rows;
  }

  /**
   * Find expired investments that need completion
   */
  async findExpired(): Promise<BotInvestment[]> {
    const result = await pool.query(
      `SELECT id, user_id as "userId", cryptocurrency, principal_amount as "principalAmount",
              trading_period_hours as "tradingPeriodHours", start_time as "startTime",
              end_time as "endTime", status, current_value as "currentValue",
              final_value as "finalValue", profit, commission,
              risk_acknowledged_at as "riskAcknowledgedAt",
              cancellation_reason as "cancellationReason", cancelled_at as "cancelledAt",
              created_at as "createdAt", updated_at as "updatedAt"
       FROM bot_investments
       WHERE status = 'active'
         AND end_time <= NOW()
       ORDER BY end_time ASC`,
      []
    );
    
    return result.rows;
  }

  /**
   * Update investment fields
   */
  async update(id: string, input: UpdateBotInvestmentInput): Promise<BotInvestment | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (input.currentValue !== undefined) {
      fields.push(`current_value = $${paramCount++}`);
      values.push(input.currentValue);
    }
    if (input.finalValue !== undefined) {
      fields.push(`final_value = $${paramCount++}`);
      values.push(input.finalValue);
    }
    if (input.profit !== undefined) {
      fields.push(`profit = $${paramCount++}`);
      values.push(input.profit);
    }
    if (input.commission !== undefined) {
      fields.push(`commission = $${paramCount++}`);
      values.push(input.commission);
    }
    if (input.status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(input.status);
    }
    if (input.cancellationReason !== undefined) {
      fields.push(`cancellation_reason = $${paramCount++}`);
      values.push(input.cancellationReason);
    }
    if (input.cancelledAt !== undefined) {
      fields.push(`cancelled_at = $${paramCount++}`);
      values.push(input.cancelledAt);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    // Always update updated_at
    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query(
      `UPDATE bot_investments
       SET ${fields.join(', ')}
       WHERE id = $${paramCount}
       RETURNING id, user_id as "userId", cryptocurrency, principal_amount as "principalAmount",
                 trading_period_hours as "tradingPeriodHours", start_time as "startTime",
                 end_time as "endTime", status, current_value as "currentValue",
                 final_value as "finalValue", profit, commission,
                 risk_acknowledged_at as "riskAcknowledgedAt",
                 cancellation_reason as "cancellationReason", cancelled_at as "cancelledAt",
                 created_at as "createdAt", updated_at as "updatedAt"`,
      values
    );
    
    return result.rows[0] || null;
  }

  /**
   * Update current value of investment
   * Requirement 11.1: Update investment value every 30 seconds
   */
  async updateValue(id: string, currentValue: number): Promise<void> {
    await pool.query(
      `UPDATE bot_investments
       SET current_value = $1, updated_at = NOW()
       WHERE id = $2`,
      [currentValue, id]
    );
  }

  /**
   * Update investment status
   * Requirement 10.4: Mark investment as completed
   * Requirement 10.5: Allow cancellation with reason
   */
  async updateStatus(id: string, status: InvestmentStatus, cancellationReason?: string): Promise<void> {
    const params: any[] = [status];
    let query = `UPDATE bot_investments SET status = $1, updated_at = NOW()`;
    
    if (status === 'cancelled' && cancellationReason) {
      query += `, cancellation_reason = $2, cancelled_at = NOW()`;
      params.push(cancellationReason);
    }
    
    params.push(id);
    query += ` WHERE id = $${params.length}`;
    
    await pool.query(query, params);
  }

  /**
   * Complete investment with final calculations
   * Requirement 10.4: Calculate final value, profit, and commission
   * Requirement 13.1: Apply 1% commission on positive profit
   */
  async complete(id: string, finalValue: number): Promise<BotInvestment | null> {
    const investment = await this.findById(id);
    if (!investment) return null;

    const profit = finalValue - investment.principalAmount;
    const commission = profit > 0 ? profit * 0.01 : 0;

    return this.update(id, {
      status: 'completed',
      finalValue,
      profit,
      commission
    });
  }

  /**
   * Cancel investment
   * Requirement 10.5: Cancel investment with reason
   */
  async cancel(id: string, reason: string): Promise<BotInvestment | null> {
    return this.update(id, {
      status: 'cancelled',
      cancellationReason: reason,
      cancelledAt: new Date()
    });
  }

  /**
   * Get user's investment statistics
   * Requirement 17.4: Track performance metrics
   */
  async getUserStats(userId: string): Promise<{
    totalInvestments: number;
    activeInvestments: number;
    completedInvestments: number;
    totalProfit: number;
    totalCommission: number;
  }> {
    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_investments,
        COUNT(*) FILTER (WHERE status = 'active') as active_investments,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_investments,
        COALESCE(SUM(profit) FILTER (WHERE status = 'completed'), 0) as total_profit,
        COALESCE(SUM(commission) FILTER (WHERE status = 'completed'), 0) as total_commission
       FROM bot_investments
       WHERE user_id = $1`,
      [userId]
    );
    
    const row = result.rows[0];
    return {
      totalInvestments: parseInt(row.total_investments, 10),
      activeInvestments: parseInt(row.active_investments, 10),
      completedInvestments: parseInt(row.completed_investments, 10),
      totalProfit: parseFloat(row.total_profit) || 0,
      totalCommission: parseFloat(row.total_commission) || 0
    };
  }

  /**
   * Delete investment by ID
   */
  async delete(id: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM bot_investments WHERE id = $1',
      [id]
    );
    
    return (result.rowCount ?? 0) > 0;
  }
}

// Export singleton instance
export const botInvestmentRepository = new BotInvestmentRepository();
