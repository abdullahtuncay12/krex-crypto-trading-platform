/**
 * BotTrade Repository
 * 
 * Data access layer for BotTrade model operations.
 * Provides CRUD operations and query methods for bot_trades table.
 * 
 * Requirements: 10.3, 10.4, 10.5, 4.5, 10.8
 */

import { pool } from '../config/database';
import { BotTrade, CreateBotTradeInput, TradeType, Exchange } from './BotTrade';

export class BotTradeRepository {
  /**
   * Create a new bot trade record
   * Requirement 4.5: Record trade with timestamp
   * Requirement 10.3: Log all trade executions
   */
  async create(input: CreateBotTradeInput): Promise<BotTrade> {
    const { investmentId, tradeType, cryptocurrency, quantity, price, totalValue, exchange, executedAt, strategyConfidence } = input;
    
    const result = await pool.query(
      `INSERT INTO bot_trades (
        investment_id, trade_type, cryptocurrency, quantity, price,
        total_value, exchange, executed_at, strategy_confidence
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, investment_id as "investmentId", trade_type as "tradeType",
                 cryptocurrency, quantity, price, total_value as "totalValue",
                 exchange, executed_at as "executedAt", strategy_confidence as "strategyConfidence",
                 created_at as "createdAt"`,
      [investmentId, tradeType, cryptocurrency, quantity, price, totalValue, exchange, executedAt, strategyConfidence]
    );
    
    return result.rows[0];
  }

  /**
   * Find trade by ID
   */
  async findById(id: string): Promise<BotTrade | null> {
    const result = await pool.query(
      `SELECT id, investment_id as "investmentId", trade_type as "tradeType",
              cryptocurrency, quantity, price, total_value as "totalValue",
              exchange, executed_at as "executedAt", strategy_confidence as "strategyConfidence",
              created_at as "createdAt"
       FROM bot_trades
       WHERE id = $1`,
      [id]
    );
    
    return result.rows[0] || null;
  }

  /**
   * Find trades by investment ID
   * Requirement 10.8: Query trade history for an investment
   */
  async findByInvestmentId(investmentId: string): Promise<BotTrade[]> {
    const result = await pool.query(
      `SELECT id, investment_id as "investmentId", trade_type as "tradeType",
              cryptocurrency, quantity, price, total_value as "totalValue",
              exchange, executed_at as "executedAt", strategy_confidence as "strategyConfidence",
              created_at as "createdAt"
       FROM bot_trades
       WHERE investment_id = $1
       ORDER BY executed_at DESC`,
      [investmentId]
    );
    
    return result.rows;
  }

  /**
   * Find trades by type for an investment
   */
  async findByInvestmentAndType(investmentId: string, tradeType: TradeType): Promise<BotTrade[]> {
    const result = await pool.query(
      `SELECT id, investment_id as "investmentId", trade_type as "tradeType",
              cryptocurrency, quantity, price, total_value as "totalValue",
              exchange, executed_at as "executedAt", strategy_confidence as "strategyConfidence",
              created_at as "createdAt"
       FROM bot_trades
       WHERE investment_id = $1 AND trade_type = $2
       ORDER BY executed_at DESC`,
      [investmentId, tradeType]
    );
    
    return result.rows;
  }

  /**
   * Find trades by exchange
   * Requirement 12.7: Track trades by exchange for analytics
   */
  async findByExchange(exchange: Exchange, limit?: number): Promise<BotTrade[]> {
    let query = `
      SELECT id, investment_id as "investmentId", trade_type as "tradeType",
             cryptocurrency, quantity, price, total_value as "totalValue",
             exchange, executed_at as "executedAt", strategy_confidence as "strategyConfidence",
             created_at as "createdAt"
      FROM bot_trades
      WHERE exchange = $1
      ORDER BY executed_at DESC
    `;
    
    const params: any[] = [exchange];
    
    if (limit) {
      query += ` LIMIT $2`;
      params.push(limit);
    }
    
    const result = await pool.query(query, params);
    
    return result.rows;
  }

  /**
   * Find recent trades across all investments
   */
  async findRecent(limit: number = 50): Promise<BotTrade[]> {
    const result = await pool.query(
      `SELECT id, investment_id as "investmentId", trade_type as "tradeType",
              cryptocurrency, quantity, price, total_value as "totalValue",
              exchange, executed_at as "executedAt", strategy_confidence as "strategyConfidence",
              created_at as "createdAt"
       FROM bot_trades
       ORDER BY executed_at DESC
       LIMIT $1`,
      [limit]
    );
    
    return result.rows;
  }

  /**
   * Get trade statistics for an investment
   */
  async getInvestmentTradeStats(investmentId: string): Promise<{
    totalTrades: number;
    buyTrades: number;
    sellTrades: number;
    totalBuyValue: number;
    totalSellValue: number;
    averageConfidence: number;
  }> {
    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_trades,
        COUNT(*) FILTER (WHERE trade_type = 'buy') as buy_trades,
        COUNT(*) FILTER (WHERE trade_type = 'sell') as sell_trades,
        COALESCE(SUM(total_value) FILTER (WHERE trade_type = 'buy'), 0) as total_buy_value,
        COALESCE(SUM(total_value) FILTER (WHERE trade_type = 'sell'), 0) as total_sell_value,
        COALESCE(AVG(strategy_confidence), 0) as average_confidence
       FROM bot_trades
       WHERE investment_id = $1`,
      [investmentId]
    );
    
    const row = result.rows[0];
    return {
      totalTrades: parseInt(row.total_trades, 10),
      buyTrades: parseInt(row.buy_trades, 10),
      sellTrades: parseInt(row.sell_trades, 10),
      totalBuyValue: parseFloat(row.total_buy_value) || 0,
      totalSellValue: parseFloat(row.total_sell_value) || 0,
      averageConfidence: parseFloat(row.average_confidence) || 0
    };
  }

  /**
   * Get exchange distribution statistics
   */
  async getExchangeStats(): Promise<Array<{ exchange: Exchange; tradeCount: number; totalVolume: number }>> {
    const result = await pool.query(
      `SELECT 
        exchange,
        COUNT(*) as trade_count,
        SUM(total_value) as total_volume
       FROM bot_trades
       GROUP BY exchange
       ORDER BY total_volume DESC`
    );
    
    return result.rows.map(row => ({
      exchange: row.exchange as Exchange,
      tradeCount: parseInt(row.trade_count, 10),
      totalVolume: parseFloat(row.total_volume) || 0
    }));
  }

  /**
   * Count trades for an investment
   */
  async countByInvestmentId(investmentId: string): Promise<number> {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM bot_trades WHERE investment_id = $1',
      [investmentId]
    );
    
    return parseInt(result.rows[0].count, 10);
  }

  /**
   * Delete trade by ID
   */
  async delete(id: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM bot_trades WHERE id = $1',
      [id]
    );
    
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Delete all trades for an investment
   */
  async deleteByInvestmentId(investmentId: string): Promise<number> {
    const result = await pool.query(
      'DELETE FROM bot_trades WHERE investment_id = $1',
      [investmentId]
    );
    
    return result.rowCount ?? 0;
  }
}

// Export singleton instance
export const botTradeRepository = new BotTradeRepository();
