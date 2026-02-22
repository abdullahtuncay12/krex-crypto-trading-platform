/**
 * TradingBot Service
 * 
 * Main trading bot orchestrator that manages the complete trading lifecycle.
 * Integrates AIStrategy, TradeExecutor, and position management.
 * 
 * Requirements: 4.1, 4.3, 4.4, 4.5, 5.1, 5.4, 5.6, 6.3
 */

import { ExchangeAggregator } from './ExchangeAggregator';
import { AIStrategy, TradingSignal } from './AIStrategy';
import { TradeExecutor } from './TradeExecutor';
import { botPositionRepository } from '../models/BotPositionRepository';
import { botTradeRepository } from '../models/BotTradeRepository';
import { BotPosition } from '../models/BotPosition';
import { Exchange } from '../models/BotTrade';

export interface TradingBotConfig {
  investmentId: string;
  cryptocurrency: string;
  principalAmount: number;
}

export class TradingBot {
  private exchangeAggregator: ExchangeAggregator;
  private aiStrategy: AIStrategy;
  private tradeExecutor: TradeExecutor;
  private isRunning: Map<string, boolean>;

  constructor() {
    this.exchangeAggregator = new ExchangeAggregator();
    this.aiStrategy = new AIStrategy();
    this.tradeExecutor = new TradeExecutor();
    this.isRunning = new Map();
  }

  /**
   * Start trading for an investment
   * Requirement 4.1: Initialize trading bot for investment
   */
  async startTrading(config: TradingBotConfig): Promise<void> {
    const { investmentId } = config;
    
    if (this.isRunning.get(investmentId)) {
      throw new Error(`Trading bot already running for investment ${investmentId}`);
    }

    this.isRunning.set(investmentId, true);
    console.log(`Trading bot started for investment ${investmentId}`);
  }

  /**
   * Stop trading for an investment
   */
  async stopTrading(investmentId: string): Promise<void> {
    this.isRunning.set(investmentId, false);
    console.log(`Trading bot stopped for investment ${investmentId}`);
  }

  /**
   * Check if trading bot is running for an investment
   */
  isActive(investmentId: string): boolean {
    return this.isRunning.get(investmentId) || false;
  }

  /**
   * Analyze market conditions
   * Requirement 5.1: Analyze market using ExchangeAggregator
   * @param cryptocurrency - Cryptocurrency symbol
   * @param days - Number of days of historical data
   */
  async analyzeMarket(cryptocurrency: string, days: number = 30): Promise<number[]> {
    // Get historical price data
    const historicalData = await this.exchangeAggregator.getHistoricalData(cryptocurrency, days);
    
    // Extract prices
    const prices = historicalData.map(point => point.price);
    
    return prices;
  }

  /**
   * Generate trading signal
   * Requirement 5.1: Generate signal using AIStrategy
   * @param cryptocurrency - Cryptocurrency symbol
   * @param principalAmount - Investment principal amount
   */
  async generateSignal(cryptocurrency: string, principalAmount: number): Promise<TradingSignal> {
    // Get market data
    const prices = await this.analyzeMarket(cryptocurrency);
    
    // Generate signal using AI strategy
    const signal = this.aiStrategy.analyze(prices, principalAmount);
    
    return signal;
  }

  /**
   * Get current value of investment
   * Requirement 6.3: Calculate current investment value
   * @param investmentId - Investment ID
   * @param cryptocurrency - Cryptocurrency symbol
   */
  async getCurrentValue(investmentId: string, cryptocurrency: string): Promise<number> {
    // Get all open positions
    const openPositions = await botPositionRepository.findOpenByInvestmentId(investmentId);
    
    if (openPositions.length === 0) {
      // No open positions, return 0
      return 0;
    }

    // Get current market price
    const currentPrice = await this.exchangeAggregator.getCurrentPrice(cryptocurrency);
    
    // Calculate total value of all positions
    let totalValue = 0;
    for (const position of openPositions) {
      const positionValue = position.quantity * currentPrice;
      totalValue += positionValue;
    }

    return totalValue;
  }

  /**
   * Close all open positions for an investment
   * Requirement 6.3: Close all positions when investment ends
   * @param investmentId - Investment ID
   * @param cryptocurrency - Cryptocurrency symbol
   */
  async closeAllPositions(investmentId: string, cryptocurrency: string): Promise<number> {
    // Get all open positions
    const openPositions = await botPositionRepository.findOpenByInvestmentId(investmentId);
    
    if (openPositions.length === 0) {
      return 0;
    }

    // Get current market price
    const currentPrice = await this.exchangeAggregator.getCurrentPrice(cryptocurrency);
    
    let totalValue = 0;

    // Close each position
    for (const position of openPositions) {
      try {
        // Execute sell order
        const tradeResult = await this.tradeExecutor.executeSell(
          cryptocurrency,
          position.quantity
        );

        // Record trade
        await botTradeRepository.create({
          investmentId,
          tradeType: 'sell',
          cryptocurrency,
          quantity: position.quantity,
          price: tradeResult.executedPrice,
          totalValue: tradeResult.totalValue,
          exchange: tradeResult.exchange,
          executedAt: tradeResult.timestamp,
          strategyConfidence: 0 // Closing position, not strategy-driven
        });

        // Close position
        await botPositionRepository.close(position.id, tradeResult.executedPrice);

        totalValue += tradeResult.totalValue;
      } catch (error) {
        console.error(`Failed to close position ${position.id}:`, error);
        // Continue with other positions even if one fails
      }
    }

    return totalValue;
  }

  /**
   * Execute trading strategy
   * Requirement 4.3: Execute trades only when confidence > 0.7
   * Requirement 4.4: Track positions
   * Requirement 4.5: Record all trades
   * Requirement 5.4: Monitor stop-loss
   * @param config - Trading bot configuration
   */
  async executeStrategy(config: TradingBotConfig): Promise<void> {
    const { investmentId, cryptocurrency, principalAmount } = config;

    // Check if bot is still running
    if (!this.isActive(investmentId)) {
      return;
    }

    try {
      // Generate trading signal
      const signal = await this.generateSignal(cryptocurrency, principalAmount);

      console.log(`Signal for ${investmentId}: ${signal.signal}, confidence: ${signal.confidence}`);

      // Only execute if confidence > 0.7
      if (signal.confidence <= 0.7) {
        console.log(`Signal confidence too low (${signal.confidence}), skipping trade`);
        return;
      }

      // Get current market price
      const currentPrice = await this.exchangeAggregator.getCurrentPrice(cryptocurrency);

      // Execute trade based on signal
      if (signal.signal === 'buy') {
        await this.executeBuySignal(investmentId, cryptocurrency, signal, currentPrice);
      } else if (signal.signal === 'sell') {
        await this.executeSellSignal(investmentId, cryptocurrency, signal);
      }

      // Check stop-loss for all open positions
      await this.checkStopLoss(investmentId, cryptocurrency);
    } catch (error) {
      console.error(`Strategy execution failed for ${investmentId}:`, error);
      throw error;
    }
  }

  /**
   * Execute buy signal
   * @param investmentId - Investment ID
   * @param cryptocurrency - Cryptocurrency symbol
   * @param signal - Trading signal
   * @param currentPrice - Current market price
   */
  private async executeBuySignal(
    investmentId: string,
    cryptocurrency: string,
    signal: TradingSignal,
    currentPrice: number
  ): Promise<void> {
    try {
      // Execute buy order
      const tradeResult = await this.tradeExecutor.executeBuy(
        cryptocurrency,
        signal.positionSize
      );

      // Record trade
      await botTradeRepository.create({
        investmentId,
        tradeType: 'buy',
        cryptocurrency,
        quantity: tradeResult.executedQuantity,
        price: tradeResult.executedPrice,
        totalValue: tradeResult.totalValue,
        exchange: tradeResult.exchange,
        executedAt: tradeResult.timestamp,
        strategyConfidence: signal.confidence
      });

      // Create position
      await botPositionRepository.create({
        investmentId,
        cryptocurrency,
        quantity: tradeResult.executedQuantity,
        entryPrice: tradeResult.executedPrice,
        currentPrice: tradeResult.executedPrice,
        stopLoss: signal.stopLoss,
        openedAt: tradeResult.timestamp
      });

      console.log(`Buy executed for ${investmentId}: ${tradeResult.executedQuantity} ${cryptocurrency} at ${tradeResult.executedPrice}`);
    } catch (error) {
      console.error(`Buy execution failed for ${investmentId}:`, error);
      throw error;
    }
  }

  /**
   * Execute sell signal
   * @param investmentId - Investment ID
   * @param cryptocurrency - Cryptocurrency symbol
   * @param signal - Trading signal
   */
  private async executeSellSignal(
    investmentId: string,
    cryptocurrency: string,
    signal: TradingSignal
  ): Promise<void> {
    // Get open positions
    const openPositions = await botPositionRepository.findOpenByInvestmentId(investmentId);

    if (openPositions.length === 0) {
      console.log(`No open positions to sell for ${investmentId}`);
      return;
    }

    // Sell the oldest position
    const position = openPositions[0];

    try {
      // Execute sell order
      const tradeResult = await this.tradeExecutor.executeSell(
        cryptocurrency,
        position.quantity
      );

      // Record trade
      await botTradeRepository.create({
        investmentId,
        tradeType: 'sell',
        cryptocurrency,
        quantity: tradeResult.executedQuantity,
        price: tradeResult.executedPrice,
        totalValue: tradeResult.totalValue,
        exchange: tradeResult.exchange,
        executedAt: tradeResult.timestamp,
        strategyConfidence: signal.confidence
      });

      // Close position
      await botPositionRepository.close(position.id, tradeResult.executedPrice);

      console.log(`Sell executed for ${investmentId}: ${tradeResult.executedQuantity} ${cryptocurrency} at ${tradeResult.executedPrice}`);
    } catch (error) {
      console.error(`Sell execution failed for ${investmentId}:`, error);
      throw error;
    }
  }

  /**
   * Check stop-loss for all open positions
   * Requirement 5.6: Monitor and execute stop-loss
   * @param investmentId - Investment ID
   * @param cryptocurrency - Cryptocurrency symbol
   */
  private async checkStopLoss(investmentId: string, cryptocurrency: string): Promise<void> {
    // Get current market price
    const currentPrice = await this.exchangeAggregator.getCurrentPrice(cryptocurrency);

    // Get positions that hit stop-loss
    const positions = await botPositionRepository.findOpenByInvestmentId(investmentId);

    for (const position of positions) {
      // Update current price
      await botPositionRepository.updatePrice(position.id, currentPrice);

      // Check if stop-loss is triggered
      if (currentPrice <= position.stopLoss) {
        console.log(`Stop-loss triggered for position ${position.id}: ${currentPrice} <= ${position.stopLoss}`);

        try {
          // Execute sell order
          const tradeResult = await this.tradeExecutor.executeSell(
            cryptocurrency,
            position.quantity
          );

          // Record trade
          await botTradeRepository.create({
            investmentId,
            tradeType: 'sell',
            cryptocurrency,
            quantity: tradeResult.executedQuantity,
            price: tradeResult.executedPrice,
            totalValue: tradeResult.totalValue,
            exchange: tradeResult.exchange,
            executedAt: tradeResult.timestamp,
            strategyConfidence: 0 // Stop-loss, not strategy-driven
          });

          // Close position
          await botPositionRepository.close(position.id, tradeResult.executedPrice);

          console.log(`Stop-loss executed for ${investmentId}: ${tradeResult.executedQuantity} ${cryptocurrency} at ${tradeResult.executedPrice}`);
        } catch (error) {
          console.error(`Stop-loss execution failed for position ${position.id}:`, error);
        }
      }
    }
  }
}

// Export singleton instance
export const tradingBot = new TradingBot();


/**
 * TradingBotManager
 * 
 * Manages multiple TradingBot instances for different investments
 */
class TradingBotManager {
  private bots: Map<string, TradingBot>;

  constructor() {
    this.bots = new Map();
  }

  /**
   * Get or create a bot instance for an investment
   */
  getBot(investmentId: string): TradingBot | undefined {
    return this.bots.get(investmentId);
  }

  /**
   * Create and start a bot for an investment
   */
  async createBot(config: TradingBotConfig): Promise<TradingBot> {
    const { investmentId } = config;
    
    // Check if bot already exists
    if (this.bots.has(investmentId)) {
      return this.bots.get(investmentId)!;
    }

    // Create new bot instance
    const bot = new TradingBot();
    await bot.startTrading(config);
    
    this.bots.set(investmentId, bot);
    return bot;
  }

  /**
   * Stop and remove a bot for an investment
   */
  async removeBot(investmentId: string): Promise<void> {
    const bot = this.bots.get(investmentId);
    if (bot) {
      await bot.stopTrading(investmentId);
      this.bots.delete(investmentId);
    }
  }

  /**
   * Get all active bot investment IDs
   */
  getActiveBots(): string[] {
    return Array.from(this.bots.keys());
  }
}

// Export singleton manager instance
export const tradingBotManager = new TradingBotManager();
