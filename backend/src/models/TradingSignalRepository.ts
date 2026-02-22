/**
 * TradingSignal Repository
 * 
 * Data access layer for TradingSignal model operations.
 * Provides CRUD operations and query methods for trading_signals table.
 * 
 * Requirements: 3.1, 4.1, 4.2, 4.3
 */

import { pool } from '../config/database';
import { TradingSignal, CreateTradingSignalInput, UpdateTradingSignalInput } from './TradingSignal';

export class TradingSignalRepository {
  /**
   * Create a new trading signal
   * Requirement 3.1: Basic trading signals for normal users
   * Requirement 4.1, 4.2, 4.3: Advanced trading signals for premium users
   */
  async create(input: CreateTradingSignalInput): Promise<TradingSignal> {
    const { cryptocurrency, recommendation, confidence, entryPrice, stopLoss, limitOrder, signalType } = input;
    
    const result = await pool.query(
      `INSERT INTO trading_signals (cryptocurrency, recommendation, confidence, entry_price, stop_loss, limit_order, signal_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, cryptocurrency, recommendation, confidence, entry_price as "entryPrice", 
                 stop_loss as "stopLoss", limit_order as "limitOrder", signal_type as "signalType", 
                 created_at as "createdAt"`,
      [cryptocurrency, recommendation, confidence, entryPrice, stopLoss ?? null, limitOrder ?? null, signalType]
    );
    
    return result.rows[0];
  }

  /**
   * Find trading signal by ID
   */
  async findById(id: string): Promise<TradingSignal | null> {
    const result = await pool.query(
      `SELECT id, cryptocurrency, recommendation, confidence, entry_price as "entryPrice",
              stop_loss as "stopLoss", limit_order as "limitOrder", signal_type as "signalType",
              created_at as "createdAt"
       FROM trading_signals
       WHERE id = $1`,
      [id]
    );
    
    return result.rows[0] || null;
  }

  /**
   * Find latest trading signal for a cryptocurrency
   * Used to get the most recent signal for display
   */
  async findLatestByCryptocurrency(cryptocurrency: string, signalType?: 'basic' | 'premium'): Promise<TradingSignal | null> {
    let query = `
      SELECT id, cryptocurrency, recommendation, confidence, entry_price as "entryPrice",
             stop_loss as "stopLoss", limit_order as "limitOrder", signal_type as "signalType",
             created_at as "createdAt"
      FROM trading_signals
      WHERE cryptocurrency = $1
    `;
    
    const params: any[] = [cryptocurrency];
    
    if (signalType) {
      query += ` AND signal_type = $2`;
      params.push(signalType);
    }
    
    query += ` ORDER BY created_at DESC LIMIT 1`;
    
    const result = await pool.query(query, params);
    
    return result.rows[0] || null;
  }

  /**
   * Find all trading signals for a cryptocurrency
   * Useful for historical analysis
   */
  async findByCryptocurrency(
    cryptocurrency: string, 
    options?: { signalType?: 'basic' | 'premium'; limit?: number }
  ): Promise<TradingSignal[]> {
    let query = `
      SELECT id, cryptocurrency, recommendation, confidence, entry_price as "entryPrice",
             stop_loss as "stopLoss", limit_order as "limitOrder", signal_type as "signalType",
             created_at as "createdAt"
      FROM trading_signals
      WHERE cryptocurrency = $1
    `;
    
    const params: any[] = [cryptocurrency];
    
    if (options?.signalType) {
      query += ` AND signal_type = $2`;
      params.push(options.signalType);
    }
    
    query += ` ORDER BY created_at DESC`;
    
    if (options?.limit) {
      query += ` LIMIT $${params.length + 1}`;
      params.push(options.limit);
    }
    
    const result = await pool.query(query, params);
    
    return result.rows;
  }

  /**
   * Find trading signals by type
   * Useful for filtering basic vs premium signals
   */
  async findBySignalType(signalType: 'basic' | 'premium', limit?: number): Promise<TradingSignal[]> {
    let query = `
      SELECT id, cryptocurrency, recommendation, confidence, entry_price as "entryPrice",
             stop_loss as "stopLoss", limit_order as "limitOrder", signal_type as "signalType",
             created_at as "createdAt"
      FROM trading_signals
      WHERE signal_type = $1
      ORDER BY created_at DESC
    `;
    
    const params: any[] = [signalType];
    
    if (limit) {
      query += ` LIMIT $2`;
      params.push(limit);
    }
    
    const result = await pool.query(query, params);
    
    return result.rows;
  }

  /**
   * Find recent trading signals across all cryptocurrencies
   * Useful for dashboard and overview displays
   */
  async findRecent(limit: number = 10, signalType?: 'basic' | 'premium'): Promise<TradingSignal[]> {
    let query = `
      SELECT id, cryptocurrency, recommendation, confidence, entry_price as "entryPrice",
             stop_loss as "stopLoss", limit_order as "limitOrder", signal_type as "signalType",
             created_at as "createdAt"
      FROM trading_signals
    `;
    
    const params: any[] = [];
    
    if (signalType) {
      query += ` WHERE signal_type = $1`;
      params.push(signalType);
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);
    
    const result = await pool.query(query, params);
    
    return result.rows;
  }

  /**
   * Update trading signal fields
   */
  async update(id: string, input: UpdateTradingSignalInput): Promise<TradingSignal | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (input.cryptocurrency !== undefined) {
      fields.push(`cryptocurrency = $${paramCount++}`);
      values.push(input.cryptocurrency);
    }
    if (input.recommendation !== undefined) {
      fields.push(`recommendation = $${paramCount++}`);
      values.push(input.recommendation);
    }
    if (input.confidence !== undefined) {
      fields.push(`confidence = $${paramCount++}`);
      values.push(input.confidence);
    }
    if (input.entryPrice !== undefined) {
      fields.push(`entry_price = $${paramCount++}`);
      values.push(input.entryPrice);
    }
    if (input.stopLoss !== undefined) {
      fields.push(`stop_loss = $${paramCount++}`);
      values.push(input.stopLoss);
    }
    if (input.limitOrder !== undefined) {
      fields.push(`limit_order = $${paramCount++}`);
      values.push(input.limitOrder);
    }
    if (input.signalType !== undefined) {
      fields.push(`signal_type = $${paramCount++}`);
      values.push(input.signalType);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE trading_signals
       SET ${fields.join(', ')}
       WHERE id = $${paramCount}
       RETURNING id, cryptocurrency, recommendation, confidence, entry_price as "entryPrice",
                 stop_loss as "stopLoss", limit_order as "limitOrder", signal_type as "signalType",
                 created_at as "createdAt"`,
      values
    );
    
    return result.rows[0] || null;
  }

  /**
   * Delete trading signal by ID
   */
  async delete(id: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM trading_signals WHERE id = $1',
      [id]
    );
    
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Delete old trading signals
   * Useful for cleanup jobs to remove outdated signals
   */
  async deleteOlderThan(days: number): Promise<number> {
    const result = await pool.query(
      `DELETE FROM trading_signals 
       WHERE created_at < NOW() - INTERVAL '${days} days'`
    );
    
    return result.rowCount ?? 0;
  }

  /**
   * Count signals by cryptocurrency
   * Useful for analytics
   */
  async countByCryptocurrency(cryptocurrency: string): Promise<number> {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM trading_signals WHERE cryptocurrency = $1',
      [cryptocurrency]
    );
    
    return parseInt(result.rows[0].count, 10);
  }
}

// Export singleton instance
export const tradingSignalRepository = new TradingSignalRepository();
