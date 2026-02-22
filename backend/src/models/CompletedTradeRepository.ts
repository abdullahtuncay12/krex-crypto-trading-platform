/**
 * CompletedTrade Repository
 * 
 * Data access layer for CompletedTrade model operations.
 * Provides CRUD operations and query methods for completed_trades table.
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4
 */

import { pool } from '../config/database';
import { CompletedTrade, CreateCompletedTradeInput, UpdateCompletedTradeInput } from './CompletedTrade';

export class CompletedTradeRepository {
  /**
   * Create a new completed trade record
   * Requirement 6.1: Display successful premium trades
   * Requirement 6.3: Include profit percentage for each trade
   * Requirement 6.4: Calculate performance based on actual premium recommendations
   */
  async create(input: CreateCompletedTradeInput): Promise<CompletedTrade> {
    const { signalId, cryptocurrency, entryPrice, exitPrice, profitPercent, entryDate, exitDate, signalType = 'premium' } = input;
    
    const result = await pool.query(
      `INSERT INTO completed_trades (signal_id, cryptocurrency, entry_price, exit_price, profit_percent, entry_date, exit_date, signal_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, signal_id as "signalId", cryptocurrency, entry_price as "entryPrice", 
                 exit_price as "exitPrice", profit_percent as "profitPercent", 
                 entry_date as "entryDate", exit_date as "exitDate", signal_type as "signalType"`,
      [signalId, cryptocurrency, entryPrice, exitPrice, profitPercent, entryDate, exitDate, signalType]
    );
    
    return result.rows[0];
  }

  /**
   * Find completed trade by ID
   */
  async findById(id: string): Promise<CompletedTrade | null> {
    const result = await pool.query(
      `SELECT id, signal_id as "signalId", cryptocurrency, entry_price as "entryPrice",
              exit_price as "exitPrice", profit_percent as "profitPercent",
              entry_date as "entryDate", exit_date as "exitDate", signal_type as "signalType"
       FROM completed_trades
       WHERE id = $1`,
      [id]
    );
    
    return result.rows[0] || null;
  }

  /**
   * Find completed trades by cryptocurrency
   * Useful for displaying performance for specific coins
   */
  async findByCryptocurrency(cryptocurrency: string, limit?: number): Promise<CompletedTrade[]> {
    let query = `
      SELECT id, signal_id as "signalId", cryptocurrency, entry_price as "entryPrice",
             exit_price as "exitPrice", profit_percent as "profitPercent",
             entry_date as "entryDate", exit_date as "exitDate", signal_type as "signalType"
      FROM completed_trades
      WHERE cryptocurrency = $1
      ORDER BY exit_date DESC
    `;
    
    const params: any[] = [cryptocurrency];
    
    if (limit) {
      query += ` LIMIT $2`;
      params.push(limit);
    }
    
    const result = await pool.query(query, params);
    
    return result.rows;
  }

  /**
   * Find recent completed trades
   * Requirement 6.1: Display successful premium trades at bottom of page
   * Requirement 6.2: Show profitable trades in green color (filtering handled in UI)
   */
  async findRecent(limit: number = 10): Promise<CompletedTrade[]> {
    const result = await pool.query(
      `SELECT id, signal_id as "signalId", cryptocurrency, entry_price as "entryPrice",
              exit_price as "exitPrice", profit_percent as "profitPercent",
              entry_date as "entryDate", exit_date as "exitDate", signal_type as "signalType"
       FROM completed_trades
       ORDER BY exit_date DESC
       LIMIT $1`,
      [limit]
    );
    
    return result.rows;
  }

  /**
   * Find profitable trades
   * Requirement 6.2: Display profitable trades in green color
   */
  async findProfitable(limit?: number): Promise<CompletedTrade[]> {
    let query = `
      SELECT id, signal_id as "signalId", cryptocurrency, entry_price as "entryPrice",
             exit_price as "exitPrice", profit_percent as "profitPercent",
             entry_date as "entryDate", exit_date as "exitDate", signal_type as "signalType"
      FROM completed_trades
      WHERE profit_percent > 0
      ORDER BY exit_date DESC
    `;
    
    const params: any[] = [];
    
    if (limit) {
      query += ` LIMIT $1`;
      params.push(limit);
    }
    
    const result = await pool.query(query, params);
    
    return result.rows;
  }

  /**
   * Find completed trade by signal ID
   * Requirement 6.4: Reference valid trading signal ID
   */
  async findBySignalId(signalId: string): Promise<CompletedTrade | null> {
    const result = await pool.query(
      `SELECT id, signal_id as "signalId", cryptocurrency, entry_price as "entryPrice",
              exit_price as "exitPrice", profit_percent as "profitPercent",
              entry_date as "entryDate", exit_date as "exitDate", signal_type as "signalType"
       FROM completed_trades
       WHERE signal_id = $1`,
      [signalId]
    );
    
    return result.rows[0] || null;
  }

  /**
   * Get performance statistics for a cryptocurrency
   * Useful for analytics and performance display
   */
  async getPerformanceStats(cryptocurrency: string): Promise<{
    totalTrades: number;
    profitableTrades: number;
    averageProfit: number;
    totalProfit: number;
  }> {
    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_trades,
        COUNT(*) FILTER (WHERE profit_percent > 0) as profitable_trades,
        AVG(profit_percent) as average_profit,
        SUM(profit_percent) as total_profit
       FROM completed_trades
       WHERE cryptocurrency = $1`,
      [cryptocurrency]
    );
    
    const row = result.rows[0];
    return {
      totalTrades: parseInt(row.total_trades, 10),
      profitableTrades: parseInt(row.profitable_trades, 10),
      averageProfit: parseFloat(row.average_profit) || 0,
      totalProfit: parseFloat(row.total_profit) || 0
    };
  }

  /**
   * Update completed trade fields
   */
  async update(id: string, input: UpdateCompletedTradeInput): Promise<CompletedTrade | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (input.signalId !== undefined) {
      fields.push(`signal_id = $${paramCount++}`);
      values.push(input.signalId);
    }
    if (input.cryptocurrency !== undefined) {
      fields.push(`cryptocurrency = $${paramCount++}`);
      values.push(input.cryptocurrency);
    }
    if (input.entryPrice !== undefined) {
      fields.push(`entry_price = $${paramCount++}`);
      values.push(input.entryPrice);
    }
    if (input.exitPrice !== undefined) {
      fields.push(`exit_price = $${paramCount++}`);
      values.push(input.exitPrice);
    }
    if (input.profitPercent !== undefined) {
      fields.push(`profit_percent = $${paramCount++}`);
      values.push(input.profitPercent);
    }
    if (input.entryDate !== undefined) {
      fields.push(`entry_date = $${paramCount++}`);
      values.push(input.entryDate);
    }
    if (input.exitDate !== undefined) {
      fields.push(`exit_date = $${paramCount++}`);
      values.push(input.exitDate);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE completed_trades
       SET ${fields.join(', ')}
       WHERE id = $${paramCount}
       RETURNING id, signal_id as "signalId", cryptocurrency, entry_price as "entryPrice",
                 exit_price as "exitPrice", profit_percent as "profitPercent",
                 entry_date as "entryDate", exit_date as "exitDate", signal_type as "signalType"`,
      values
    );
    
    return result.rows[0] || null;
  }

  /**
   * Delete completed trade by ID
   */
  async delete(id: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM completed_trades WHERE id = $1',
      [id]
    );
    
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Delete old completed trades
   * Useful for cleanup jobs to remove outdated records
   */
  async deleteOlderThan(days: number): Promise<number> {
    const result = await pool.query(
      `DELETE FROM completed_trades 
       WHERE exit_date < NOW() - INTERVAL '${days} days'`
    );
    
    return result.rowCount ?? 0;
  }

  /**
   * Count trades by cryptocurrency
   * Useful for analytics
   */
  async countByCryptocurrency(cryptocurrency: string): Promise<number> {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM completed_trades WHERE cryptocurrency = $1',
      [cryptocurrency]
    );
    
    return parseInt(result.rows[0].count, 10);
  }
}

// Export singleton instance
export const completedTradeRepository = new CompletedTradeRepository();
