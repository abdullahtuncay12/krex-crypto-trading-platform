/**
 * BotPosition Repository
 * 
 * Data access layer for BotPosition model operations.
 * Provides CRUD operations and query methods for bot_positions table.
 * 
 * Requirements: 4.4, 5.6, 6.3
 */

import { pool } from '../config/database';
import { BotPosition, CreateBotPositionInput, UpdateBotPositionInput, PositionStatus } from './BotPosition';

export class BotPositionRepository {
  /**
   * Create a new bot position
   * Requirement 4.4: Track positions for each investment
   * Requirement 5.6: Set stop-loss at 5% below entry price
   */
  async create(input: CreateBotPositionInput): Promise<BotPosition> {
    const { investmentId, cryptocurrency, quantity, entryPrice, currentPrice, stopLoss, openedAt } = input;
    
    const result = await pool.query(
      `INSERT INTO bot_positions (
        investment_id, cryptocurrency, quantity, entry_price,
        current_price, stop_loss, status, opened_at
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, investment_id as "investmentId", cryptocurrency, quantity,
                 entry_price as "entryPrice", current_price as "currentPrice",
                 stop_loss as "stopLoss", status, opened_at as "openedAt",
                 closed_at as "closedAt", profit_loss as "profitLoss"`,
      [investmentId, cryptocurrency, quantity, entryPrice, currentPrice, stopLoss, 'open', openedAt]
    );
    
    return result.rows[0];
  }

  /**
   * Find position by ID
   */
  async findById(id: string): Promise<BotPosition | null> {
    const result = await pool.query(
      `SELECT id, investment_id as "investmentId", cryptocurrency, quantity,
              entry_price as "entryPrice", current_price as "currentPrice",
              stop_loss as "stopLoss", status, opened_at as "openedAt",
              closed_at as "closedAt", profit_loss as "profitLoss"
       FROM bot_positions
       WHERE id = $1`,
      [id]
    );
    
    return result.rows[0] || null;
  }

  /**
   * Find positions by investment ID
   * Requirement 4.4: Query positions for an investment
   */
  async findByInvestmentId(investmentId: string, status?: PositionStatus): Promise<BotPosition[]> {
    let query = `
      SELECT id, investment_id as "investmentId", cryptocurrency, quantity,
             entry_price as "entryPrice", current_price as "currentPrice",
             stop_loss as "stopLoss", status, opened_at as "openedAt",
             closed_at as "closedAt", profit_loss as "profitLoss"
      FROM bot_positions
      WHERE investment_id = $1
    `;
    
    const params: any[] = [investmentId];
    
    if (status) {
      query += ` AND status = $2`;
      params.push(status);
    }
    
    query += ` ORDER BY opened_at DESC`;
    
    const result = await pool.query(query, params);
    
    return result.rows;
  }

  /**
   * Find open positions by investment ID
   * Requirement 6.3: Close all open positions when investment ends
   */
  async findOpenByInvestmentId(investmentId: string): Promise<BotPosition[]> {
    return this.findByInvestmentId(investmentId, 'open');
  }

  /**
   * Find all open positions across investments
   */
  async findAllOpen(): Promise<BotPosition[]> {
    const result = await pool.query(
      `SELECT id, investment_id as "investmentId", cryptocurrency, quantity,
              entry_price as "entryPrice", current_price as "currentPrice",
              stop_loss as "stopLoss", status, opened_at as "openedAt",
              closed_at as "closedAt", profit_loss as "profitLoss"
       FROM bot_positions
       WHERE status = 'open'
       ORDER BY opened_at DESC`
    );
    
    return result.rows;
  }

  /**
   * Find positions that hit stop-loss
   * Requirement 5.6: Identify positions below stop-loss threshold
   */
  async findStopLossTriggered(): Promise<BotPosition[]> {
    const result = await pool.query(
      `SELECT id, investment_id as "investmentId", cryptocurrency, quantity,
              entry_price as "entryPrice", current_price as "currentPrice",
              stop_loss as "stopLoss", status, opened_at as "openedAt",
              closed_at as "closedAt", profit_loss as "profitLoss"
       FROM bot_positions
       WHERE status = 'open' AND current_price <= stop_loss
       ORDER BY opened_at ASC`
    );
    
    return result.rows;
  }

  /**
   * Update position fields
   */
  async update(id: string, input: UpdateBotPositionInput): Promise<BotPosition | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (input.currentPrice !== undefined) {
      fields.push(`current_price = $${paramCount++}`);
      values.push(input.currentPrice);
    }
    if (input.status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(input.status);
    }
    if (input.closedAt !== undefined) {
      fields.push(`closed_at = $${paramCount++}`);
      values.push(input.closedAt);
    }
    if (input.profitLoss !== undefined) {
      fields.push(`profit_loss = $${paramCount++}`);
      values.push(input.profitLoss);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE bot_positions
       SET ${fields.join(', ')}
       WHERE id = $${paramCount}
       RETURNING id, investment_id as "investmentId", cryptocurrency, quantity,
                 entry_price as "entryPrice", current_price as "currentPrice",
                 stop_loss as "stopLoss", status, opened_at as "openedAt",
                 closed_at as "closedAt", profit_loss as "profitLoss"`,
      values
    );
    
    return result.rows[0] || null;
  }

  /**
   * Update current price for a position
   */
  async updatePrice(id: string, currentPrice: number): Promise<void> {
    await pool.query(
      `UPDATE bot_positions
       SET current_price = $1
       WHERE id = $2`,
      [currentPrice, id]
    );
  }

  /**
   * Close position with profit/loss calculation
   * Requirement 6.3: Close position and calculate profit/loss
   */
  async close(id: string, closingPrice: number): Promise<BotPosition | null> {
    const position = await this.findById(id);
    if (!position) return null;

    const profitLoss = (closingPrice - position.entryPrice) * position.quantity;

    return this.update(id, {
      currentPrice: closingPrice,
      status: 'closed',
      closedAt: new Date(),
      profitLoss
    });
  }

  /**
   * Close all open positions for an investment
   * Requirement 6.3: Close all open positions when investment ends
   */
  async closeAllForInvestment(investmentId: string, closingPrice: number): Promise<number> {
    const openPositions = await this.findOpenByInvestmentId(investmentId);
    
    for (const position of openPositions) {
      await this.close(position.id, closingPrice);
    }
    
    return openPositions.length;
  }

  /**
   * Get position statistics for an investment
   */
  async getInvestmentPositionStats(investmentId: string): Promise<{
    totalPositions: number;
    openPositions: number;
    closedPositions: number;
    totalProfitLoss: number;
    averageProfitLoss: number;
  }> {
    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_positions,
        COUNT(*) FILTER (WHERE status = 'open') as open_positions,
        COUNT(*) FILTER (WHERE status = 'closed') as closed_positions,
        COALESCE(SUM(profit_loss) FILTER (WHERE status = 'closed'), 0) as total_profit_loss,
        COALESCE(AVG(profit_loss) FILTER (WHERE status = 'closed'), 0) as average_profit_loss
       FROM bot_positions
       WHERE investment_id = $1`,
      [investmentId]
    );
    
    const row = result.rows[0];
    return {
      totalPositions: parseInt(row.total_positions, 10),
      openPositions: parseInt(row.open_positions, 10),
      closedPositions: parseInt(row.closed_positions, 10),
      totalProfitLoss: parseFloat(row.total_profit_loss) || 0,
      averageProfitLoss: parseFloat(row.average_profit_loss) || 0
    };
  }

  /**
   * Count open positions for an investment
   */
  async countOpenByInvestmentId(investmentId: string): Promise<number> {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM bot_positions WHERE investment_id = $1 AND status = $2',
      [investmentId, 'open']
    );
    
    return parseInt(result.rows[0].count, 10);
  }

  /**
   * Delete position by ID
   */
  async delete(id: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM bot_positions WHERE id = $1',
      [id]
    );
    
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Delete all positions for an investment
   */
  async deleteByInvestmentId(investmentId: string): Promise<number> {
    const result = await pool.query(
      'DELETE FROM bot_positions WHERE investment_id = $1',
      [investmentId]
    );
    
    return result.rowCount ?? 0;
  }
}

// Export singleton instance
export const botPositionRepository = new BotPositionRepository();
