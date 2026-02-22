/**
 * CompletedTradeRepository Unit Tests
 * 
 * Tests CRUD operations and query methods for CompletedTrade model.
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4
 */

import { pool } from '../../config/database';
import { completedTradeRepository } from '../CompletedTradeRepository';
import { tradingSignalRepository } from '../TradingSignalRepository';
import { CreateCompletedTradeInput } from '../CompletedTrade';

describe('CompletedTradeRepository', () => {
  let testSignalId: string;

  beforeAll(async () => {
    // Create a test trading signal to reference
    const signal = await tradingSignalRepository.create({
      cryptocurrency: 'BTC',
      recommendation: 'buy',
      confidence: 85,
      entryPrice: 50000,
      stopLoss: 48000,
      limitOrder: 55000,
      signalType: 'premium'
    });
    testSignalId = signal.id;
  });

  afterAll(async () => {
    // Clean up test data
    await pool.query('DELETE FROM completed_trades WHERE signal_id = $1', [testSignalId]);
    await pool.query('DELETE FROM trading_signals WHERE id = $1', [testSignalId]);
    await pool.end();
  });

  afterEach(async () => {
    // Clean up completed trades after each test
    await pool.query('DELETE FROM completed_trades WHERE signal_id = $1', [testSignalId]);
  });

  describe('create', () => {
    it('should create a completed trade with all fields', async () => {
      // Requirement 6.1, 6.3, 6.4: Create completed trade with signal reference and profit
      const input: CreateCompletedTradeInput = {
        signalId: testSignalId,
        cryptocurrency: 'BTC',
        entryPrice: 50000,
        exitPrice: 55000,
        profitPercent: 10.0,
        entryDate: new Date('2024-01-01'),
        exitDate: new Date('2024-01-05')
      };

      const trade = await completedTradeRepository.create(input);

      expect(trade.id).toBeDefined();
      expect(trade.signalId).toBe(testSignalId);
      expect(trade.cryptocurrency).toBe('BTC');
      expect(trade.entryPrice).toBe(50000);
      expect(trade.exitPrice).toBe(55000);
      expect(trade.profitPercent).toBe(10.0);
      expect(trade.signalType).toBe('premium');
      expect(trade.entryDate).toBeInstanceOf(Date);
      expect(trade.exitDate).toBeInstanceOf(Date);
    });

    it('should create a completed trade with negative profit (loss)', async () => {
      // Requirement 6.3: Include profit percentage (can be negative)
      const input: CreateCompletedTradeInput = {
        signalId: testSignalId,
        cryptocurrency: 'ETH',
        entryPrice: 3000,
        exitPrice: 2700,
        profitPercent: -10.0,
        entryDate: new Date('2024-01-01'),
        exitDate: new Date('2024-01-03')
      };

      const trade = await completedTradeRepository.create(input);

      expect(trade.profitPercent).toBe(-10.0);
      expect(trade.cryptocurrency).toBe('ETH');
    });
  });

  describe('findById', () => {
    it('should find a completed trade by ID', async () => {
      const created = await completedTradeRepository.create({
        signalId: testSignalId,
        cryptocurrency: 'BTC',
        entryPrice: 50000,
        exitPrice: 52000,
        profitPercent: 4.0,
        entryDate: new Date('2024-01-01'),
        exitDate: new Date('2024-01-02')
      });

      const found = await completedTradeRepository.findById(created.id);

      expect(found).not.toBeNull();
      expect(found?.id).toBe(created.id);
      expect(found?.cryptocurrency).toBe('BTC');
    });

    it('should return null for non-existent ID', async () => {
      const found = await completedTradeRepository.findById('00000000-0000-0000-0000-000000000000');
      expect(found).toBeNull();
    });
  });

  describe('findByCryptocurrency', () => {
    it('should find completed trades by cryptocurrency', async () => {
      // Create multiple trades for BTC
      await completedTradeRepository.create({
        signalId: testSignalId,
        cryptocurrency: 'BTC',
        entryPrice: 50000,
        exitPrice: 52000,
        profitPercent: 4.0,
        entryDate: new Date('2024-01-01'),
        exitDate: new Date('2024-01-02')
      });

      await completedTradeRepository.create({
        signalId: testSignalId,
        cryptocurrency: 'BTC',
        entryPrice: 52000,
        exitPrice: 54000,
        profitPercent: 3.85,
        entryDate: new Date('2024-01-03'),
        exitDate: new Date('2024-01-04')
      });

      const trades = await completedTradeRepository.findByCryptocurrency('BTC');

      expect(trades.length).toBeGreaterThanOrEqual(2);
      expect(trades.every(t => t.cryptocurrency === 'BTC')).toBe(true);
    });

    it('should limit results when limit is specified', async () => {
      await completedTradeRepository.create({
        signalId: testSignalId,
        cryptocurrency: 'ETH',
        entryPrice: 3000,
        exitPrice: 3100,
        profitPercent: 3.33,
        entryDate: new Date('2024-01-01'),
        exitDate: new Date('2024-01-02')
      });

      const trades = await completedTradeRepository.findByCryptocurrency('ETH', 1);

      expect(trades.length).toBe(1);
    });
  });

  describe('findRecent', () => {
    it('should find recent completed trades', async () => {
      // Requirement 6.1: Display successful premium trades
      await completedTradeRepository.create({
        signalId: testSignalId,
        cryptocurrency: 'BTC',
        entryPrice: 50000,
        exitPrice: 52000,
        profitPercent: 4.0,
        entryDate: new Date('2024-01-01'),
        exitDate: new Date('2024-01-02')
      });

      const trades = await completedTradeRepository.findRecent(10);

      expect(trades.length).toBeGreaterThan(0);
      expect(trades[0].signalType).toBe('premium');
    });

    it('should sort trades by exit date descending', async () => {
      await completedTradeRepository.create({
        signalId: testSignalId,
        cryptocurrency: 'BTC',
        entryPrice: 50000,
        exitPrice: 51000,
        profitPercent: 2.0,
        entryDate: new Date('2024-01-01'),
        exitDate: new Date('2024-01-02')
      });

      await completedTradeRepository.create({
        signalId: testSignalId,
        cryptocurrency: 'BTC',
        entryPrice: 51000,
        exitPrice: 52000,
        profitPercent: 1.96,
        entryDate: new Date('2024-01-03'),
        exitDate: new Date('2024-01-05')
      });

      const trades = await completedTradeRepository.findRecent(10);

      // Most recent trade should be first
      expect(new Date(trades[0].exitDate).getTime()).toBeGreaterThanOrEqual(
        new Date(trades[1].exitDate).getTime()
      );
    });
  });

  describe('findProfitable', () => {
    it('should find only profitable trades', async () => {
      // Requirement 6.2: Display profitable trades in green color
      await completedTradeRepository.create({
        signalId: testSignalId,
        cryptocurrency: 'BTC',
        entryPrice: 50000,
        exitPrice: 52000,
        profitPercent: 4.0,
        entryDate: new Date('2024-01-01'),
        exitDate: new Date('2024-01-02')
      });

      await completedTradeRepository.create({
        signalId: testSignalId,
        cryptocurrency: 'ETH',
        entryPrice: 3000,
        exitPrice: 2800,
        profitPercent: -6.67,
        entryDate: new Date('2024-01-01'),
        exitDate: new Date('2024-01-03')
      });

      const trades = await completedTradeRepository.findProfitable();

      expect(trades.length).toBeGreaterThan(0);
      expect(trades.every(t => t.profitPercent > 0)).toBe(true);
    });
  });

  describe('findBySignalId', () => {
    it('should find completed trade by signal ID', async () => {
      // Requirement 6.4: Reference valid trading signal ID
      const created = await completedTradeRepository.create({
        signalId: testSignalId,
        cryptocurrency: 'BTC',
        entryPrice: 50000,
        exitPrice: 52000,
        profitPercent: 4.0,
        entryDate: new Date('2024-01-01'),
        exitDate: new Date('2024-01-02')
      });

      const found = await completedTradeRepository.findBySignalId(testSignalId);

      expect(found).not.toBeNull();
      expect(found?.signalId).toBe(testSignalId);
      expect(found?.id).toBe(created.id);
    });
  });

  describe('getPerformanceStats', () => {
    it('should calculate performance statistics for a cryptocurrency', async () => {
      await completedTradeRepository.create({
        signalId: testSignalId,
        cryptocurrency: 'BTC',
        entryPrice: 50000,
        exitPrice: 52000,
        profitPercent: 4.0,
        entryDate: new Date('2024-01-01'),
        exitDate: new Date('2024-01-02')
      });

      await completedTradeRepository.create({
        signalId: testSignalId,
        cryptocurrency: 'BTC',
        entryPrice: 52000,
        exitPrice: 54000,
        profitPercent: 3.85,
        entryDate: new Date('2024-01-03'),
        exitDate: new Date('2024-01-04')
      });

      const stats = await completedTradeRepository.getPerformanceStats('BTC');

      expect(stats.totalTrades).toBeGreaterThanOrEqual(2);
      expect(stats.profitableTrades).toBeGreaterThanOrEqual(2);
      expect(stats.averageProfit).toBeGreaterThan(0);
      expect(stats.totalProfit).toBeGreaterThan(0);
    });
  });

  describe('update', () => {
    it('should update completed trade fields', async () => {
      const created = await completedTradeRepository.create({
        signalId: testSignalId,
        cryptocurrency: 'BTC',
        entryPrice: 50000,
        exitPrice: 52000,
        profitPercent: 4.0,
        entryDate: new Date('2024-01-01'),
        exitDate: new Date('2024-01-02')
      });

      const updated = await completedTradeRepository.update(created.id, {
        exitPrice: 53000,
        profitPercent: 6.0
      });

      expect(updated).not.toBeNull();
      expect(updated?.exitPrice).toBe(53000);
      expect(updated?.profitPercent).toBe(6.0);
      expect(updated?.cryptocurrency).toBe('BTC'); // Unchanged field
    });
  });

  describe('delete', () => {
    it('should delete a completed trade', async () => {
      const created = await completedTradeRepository.create({
        signalId: testSignalId,
        cryptocurrency: 'BTC',
        entryPrice: 50000,
        exitPrice: 52000,
        profitPercent: 4.0,
        entryDate: new Date('2024-01-01'),
        exitDate: new Date('2024-01-02')
      });

      const deleted = await completedTradeRepository.delete(created.id);
      expect(deleted).toBe(true);

      const found = await completedTradeRepository.findById(created.id);
      expect(found).toBeNull();
    });

    it('should return false when deleting non-existent trade', async () => {
      const deleted = await completedTradeRepository.delete('00000000-0000-0000-0000-000000000000');
      expect(deleted).toBe(false);
    });
  });

  describe('countByCryptocurrency', () => {
    it('should count trades for a cryptocurrency', async () => {
      await completedTradeRepository.create({
        signalId: testSignalId,
        cryptocurrency: 'BTC',
        entryPrice: 50000,
        exitPrice: 52000,
        profitPercent: 4.0,
        entryDate: new Date('2024-01-01'),
        exitDate: new Date('2024-01-02')
      });

      const count = await completedTradeRepository.countByCryptocurrency('BTC');
      expect(count).toBeGreaterThanOrEqual(1);
    });
  });
});
