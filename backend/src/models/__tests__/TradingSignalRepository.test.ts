/**
 * TradingSignalRepository Tests
 * 
 * Unit tests for TradingSignal repository operations.
 * 
 * Requirements: 3.1, 4.1, 4.2, 4.3
 */

import { pool } from '../../config/database';
import { TradingSignalRepository } from '../TradingSignalRepository';
import { CreateTradingSignalInput } from '../TradingSignal';

describe('TradingSignalRepository', () => {
  let repository: TradingSignalRepository;

  beforeAll(async () => {
    repository = new TradingSignalRepository();
  });

  afterAll(async () => {
    // Clean up test data
    await pool.query('DELETE FROM trading_signals WHERE cryptocurrency LIKE $1', ['TEST%']);
    await pool.end();
  });

  afterEach(async () => {
    // Clean up after each test
    await pool.query('DELETE FROM trading_signals WHERE cryptocurrency LIKE $1', ['TEST%']);
  });

  describe('create', () => {
    it('should create a basic trading signal', async () => {
      const input: CreateTradingSignalInput = {
        cryptocurrency: 'TESTBTC',
        recommendation: 'buy',
        confidence: 75.5,
        entryPrice: 50000.12345678,
        signalType: 'basic',
      };

      const signal = await repository.create(input);

      expect(signal).toBeDefined();
      expect(signal.id).toBeDefined();
      expect(signal.cryptocurrency).toBe('TESTBTC');
      expect(signal.recommendation).toBe('buy');
      expect(signal.confidence).toBe(75.5);
      expect(signal.entryPrice).toBe(50000.12345678);
      expect(signal.stopLoss).toBeNull();
      expect(signal.limitOrder).toBeNull();
      expect(signal.signalType).toBe('basic');
      expect(signal.createdAt).toBeInstanceOf(Date);
    });

    it('should create a premium trading signal with stop-loss and limit order', async () => {
      const input: CreateTradingSignalInput = {
        cryptocurrency: 'TESTETH',
        recommendation: 'sell',
        confidence: 82.3,
        entryPrice: 3000.5,
        stopLoss: 3100.0,
        limitOrder: 2900.0,
        signalType: 'premium',
      };

      const signal = await repository.create(input);

      expect(signal).toBeDefined();
      expect(signal.cryptocurrency).toBe('TESTETH');
      expect(signal.recommendation).toBe('sell');
      expect(signal.stopLoss).toBe(3100.0);
      expect(signal.limitOrder).toBe(2900.0);
      expect(signal.signalType).toBe('premium');
    });

    it('should create a hold signal', async () => {
      const input: CreateTradingSignalInput = {
        cryptocurrency: 'TESTADA',
        recommendation: 'hold',
        confidence: 60.0,
        entryPrice: 0.5,
        signalType: 'basic',
      };

      const signal = await repository.create(input);

      expect(signal.recommendation).toBe('hold');
    });
  });

  describe('findById', () => {
    it('should find a trading signal by ID', async () => {
      const input: CreateTradingSignalInput = {
        cryptocurrency: 'TESTBTC',
        recommendation: 'buy',
        confidence: 70.0,
        entryPrice: 50000.0,
        signalType: 'basic',
      };

      const created = await repository.create(input);
      const found = await repository.findById(created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.cryptocurrency).toBe('TESTBTC');
    });

    it('should return null for non-existent ID', async () => {
      const found = await repository.findById('00000000-0000-0000-0000-000000000000');
      expect(found).toBeNull();
    });
  });

  describe('findLatestByCryptocurrency', () => {
    it('should find the latest signal for a cryptocurrency', async () => {
      // Create multiple signals
      await repository.create({
        cryptocurrency: 'TESTBTC',
        recommendation: 'buy',
        confidence: 70.0,
        entryPrice: 49000.0,
        signalType: 'basic',
      });

      // Wait a bit to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));

      const latest = await repository.create({
        cryptocurrency: 'TESTBTC',
        recommendation: 'sell',
        confidence: 80.0,
        entryPrice: 51000.0,
        signalType: 'basic',
      });

      const found = await repository.findLatestByCryptocurrency('TESTBTC');

      expect(found).toBeDefined();
      expect(found?.id).toBe(latest.id);
      expect(found?.recommendation).toBe('sell');
    });

    it('should filter by signal type', async () => {
      await repository.create({
        cryptocurrency: 'TESTETH',
        recommendation: 'buy',
        confidence: 70.0,
        entryPrice: 3000.0,
        signalType: 'basic',
      });

      const premiumSignal = await repository.create({
        cryptocurrency: 'TESTETH',
        recommendation: 'sell',
        confidence: 85.0,
        entryPrice: 3100.0,
        stopLoss: 3200.0,
        limitOrder: 3000.0,
        signalType: 'premium',
      });

      const found = await repository.findLatestByCryptocurrency('TESTETH', 'premium');

      expect(found).toBeDefined();
      expect(found?.id).toBe(premiumSignal.id);
      expect(found?.signalType).toBe('premium');
    });

    it('should return null for non-existent cryptocurrency', async () => {
      const found = await repository.findLatestByCryptocurrency('NONEXISTENT');
      expect(found).toBeNull();
    });
  });

  describe('findByCryptocurrency', () => {
    it('should find all signals for a cryptocurrency', async () => {
      await repository.create({
        cryptocurrency: 'TESTBTC',
        recommendation: 'buy',
        confidence: 70.0,
        entryPrice: 49000.0,
        signalType: 'basic',
      });

      await repository.create({
        cryptocurrency: 'TESTBTC',
        recommendation: 'sell',
        confidence: 80.0,
        entryPrice: 51000.0,
        signalType: 'basic',
      });

      const signals = await repository.findByCryptocurrency('TESTBTC');

      expect(signals).toHaveLength(2);
      expect(signals[0].cryptocurrency).toBe('TESTBTC');
      expect(signals[1].cryptocurrency).toBe('TESTBTC');
    });

    it('should limit results', async () => {
      await repository.create({
        cryptocurrency: 'TESTETH',
        recommendation: 'buy',
        confidence: 70.0,
        entryPrice: 3000.0,
        signalType: 'basic',
      });

      await repository.create({
        cryptocurrency: 'TESTETH',
        recommendation: 'sell',
        confidence: 80.0,
        entryPrice: 3100.0,
        signalType: 'basic',
      });

      const signals = await repository.findByCryptocurrency('TESTETH', { limit: 1 });

      expect(signals).toHaveLength(1);
    });
  });

  describe('findBySignalType', () => {
    it('should find signals by type', async () => {
      await repository.create({
        cryptocurrency: 'TESTBTC',
        recommendation: 'buy',
        confidence: 70.0,
        entryPrice: 50000.0,
        signalType: 'basic',
      });

      await repository.create({
        cryptocurrency: 'TESTETH',
        recommendation: 'sell',
        confidence: 85.0,
        entryPrice: 3100.0,
        stopLoss: 3200.0,
        limitOrder: 3000.0,
        signalType: 'premium',
      });

      const basicSignals = await repository.findBySignalType('basic');
      const premiumSignals = await repository.findBySignalType('premium');

      expect(basicSignals.length).toBeGreaterThanOrEqual(1);
      expect(premiumSignals.length).toBeGreaterThanOrEqual(1);
      expect(basicSignals.every(s => s.signalType === 'basic')).toBe(true);
      expect(premiumSignals.every(s => s.signalType === 'premium')).toBe(true);
    });
  });

  describe('update', () => {
    it('should update signal fields', async () => {
      const signal = await repository.create({
        cryptocurrency: 'TESTBTC',
        recommendation: 'buy',
        confidence: 70.0,
        entryPrice: 50000.0,
        signalType: 'basic',
      });

      const updated = await repository.update(signal.id, {
        confidence: 85.0,
        recommendation: 'sell',
      });

      expect(updated).toBeDefined();
      expect(updated?.confidence).toBe(85.0);
      expect(updated?.recommendation).toBe('sell');
      expect(updated?.cryptocurrency).toBe('TESTBTC'); // Unchanged
    });
  });

  describe('delete', () => {
    it('should delete a signal', async () => {
      const signal = await repository.create({
        cryptocurrency: 'TESTBTC',
        recommendation: 'buy',
        confidence: 70.0,
        entryPrice: 50000.0,
        signalType: 'basic',
      });

      const deleted = await repository.delete(signal.id);
      expect(deleted).toBe(true);

      const found = await repository.findById(signal.id);
      expect(found).toBeNull();
    });

    it('should return false for non-existent ID', async () => {
      const deleted = await repository.delete('00000000-0000-0000-0000-000000000000');
      expect(deleted).toBe(false);
    });
  });

  describe('countByCryptocurrency', () => {
    it('should count signals for a cryptocurrency', async () => {
      await repository.create({
        cryptocurrency: 'TESTCOUNT',
        recommendation: 'buy',
        confidence: 70.0,
        entryPrice: 50000.0,
        signalType: 'basic',
      });

      await repository.create({
        cryptocurrency: 'TESTCOUNT',
        recommendation: 'sell',
        confidence: 80.0,
        entryPrice: 51000.0,
        signalType: 'basic',
      });

      const count = await repository.countByCryptocurrency('TESTCOUNT');
      expect(count).toBe(2);
    });
  });
});
