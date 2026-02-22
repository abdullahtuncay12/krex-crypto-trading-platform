/**
 * InvestmentValueHistory Repository
 * 
 * Data access layer for InvestmentValueHistory model operations.
 * Provides CRUD operations and query methods for investment_value_history table.
 * 
 * Requirements: 13.5
 */

import { pool } from '../config/database';
import { InvestmentValueHistory, CreateInvestmentValueHistoryInput } from './InvestmentValueHistory';

export class InvestmentValueHistoryRepository {
  /**
   * Create a new value history record
   * Requirement 13.5: Record investment value snapshots for charting
   */
  async create(input: CreateInvestmentValueHistoryInput): Promise<InvestmentValueHistory> {
    const { investmentId, value, timestamp = new Date() } = input;
    
    const result = await pool.query(
      `INSERT INTO investment_value_history (investment_id, value, timestamp)
       VALUES ($1, $2, $3)
       RETURNING id, investment_id as "investmentId", value, timestamp`,
      [investmentId, value, timestamp]
    );
    
    return result.rows[0];
  }

  /**
   * Find value history by ID
   */
  async findById(id: string): Promise<InvestmentValueHistory | null> {
    const result = await pool.query(
      `SELECT id, investment_id as "investmentId", value, timestamp
       FROM investment_value_history
       WHERE id = $1`,
      [id]
    );
    
    return result.rows[0] || null;
  }

  /**
   * Find value history for an investment
   * Requirement 13.5: Retrieve time-series data for chart display
   */
  async findByInvestmentId(investmentId: string, limit?: number): Promise<InvestmentValueHistory[]> {
    let query = `
      SELECT id, investment_id as "investmentId", value, timestamp
      FROM investment_value_history
      WHERE investment_id = $1
      ORDER BY timestamp ASC
    `;
    
    const params: any[] = [investmentId];
    
    if (limit) {
      query += ` LIMIT $2`;
      params.push(limit);
    }
    
    const result = await pool.query(query, params);
    
    return result.rows;
  }

  /**
   * Find value history within a time range
   * Useful for displaying specific time periods on charts
   */
  async findByInvestmentIdAndTimeRange(
    investmentId: string,
    startTime: Date,
    endTime: Date
  ): Promise<InvestmentValueHistory[]> {
    const result = await pool.query(
      `SELECT id, investment_id as "investmentId", value, timestamp
       FROM investment_value_history
       WHERE investment_id = $1
         AND timestamp >= $2
         AND timestamp <= $3
       ORDER BY timestamp ASC`,
      [investmentId, startTime, endTime]
    );
    
    return result.rows;
  }

  /**
   * Get latest value for an investment
   */
  async findLatestByInvestmentId(investmentId: string): Promise<InvestmentValueHistory | null> {
    const result = await pool.query(
      `SELECT id, investment_id as "investmentId", value, timestamp
       FROM investment_value_history
       WHERE investment_id = $1
       ORDER BY timestamp DESC
       LIMIT 1`,
      [investmentId]
    );
    
    return result.rows[0] || null;
  }

  /**
   * Get value statistics for an investment
   */
  async getInvestmentValueStats(investmentId: string): Promise<{
    minValue: number;
    maxValue: number;
    avgValue: number;
    currentValue: number;
    dataPoints: number;
  }> {
    const result = await pool.query(
      `SELECT 
        MIN(value) as min_value,
        MAX(value) as max_value,
        AVG(value) as avg_value,
        (SELECT value FROM investment_value_history WHERE investment_id = $1 ORDER BY timestamp DESC LIMIT 1) as current_value,
        COUNT(*) as data_points
       FROM investment_value_history
       WHERE investment_id = $1`,
      [investmentId]
    );
    
    const row = result.rows[0];
    return {
      minValue: parseFloat(row.min_value) || 0,
      maxValue: parseFloat(row.max_value) || 0,
      avgValue: parseFloat(row.avg_value) || 0,
      currentValue: parseFloat(row.current_value) || 0,
      dataPoints: parseInt(row.data_points, 10)
    };
  }

  /**
   * Count value history records for an investment
   */
  async countByInvestmentId(investmentId: string): Promise<number> {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM investment_value_history WHERE investment_id = $1',
      [investmentId]
    );
    
    return parseInt(result.rows[0].count, 10);
  }

  /**
   * Delete value history by ID
   */
  async delete(id: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM investment_value_history WHERE id = $1',
      [id]
    );
    
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Delete all value history for an investment
   */
  async deleteByInvestmentId(investmentId: string): Promise<number> {
    const result = await pool.query(
      'DELETE FROM investment_value_history WHERE investment_id = $1',
      [investmentId]
    );
    
    return result.rowCount ?? 0;
  }

  /**
   * Delete old value history records
   * Useful for cleanup to prevent table bloat
   */
  async deleteOlderThan(days: number): Promise<number> {
    const result = await pool.query(
      `DELETE FROM investment_value_history 
       WHERE timestamp < NOW() - INTERVAL '${days} days'`
    );
    
    return result.rowCount ?? 0;
  }
}

// Export singleton instance
export const investmentValueHistoryRepository = new InvestmentValueHistoryRepository();
