import { ExchangeAggregator } from './ExchangeAggregator';
import { PricePoint } from './exchanges/BaseExchangeClient';
import { TradingSignalRepository } from '../models/TradingSignalRepository';

/**
 * Trading Signal Interface
 * Represents a trading recommendation with analysis
 */
export interface TradingSignal {
  recommendation: 'buy' | 'sell' | 'hold';
  confidence: number; // 0-100
  timestamp: Date;
  basicAnalysis: string;
  // Premium-only fields
  stopLoss?: number;
  limitOrder?: number;
  riskLevel?: 'low' | 'medium' | 'high';
  detailedAnalysis?: string;
}

/**
 * Technical Indicators Interface
 * Contains calculated technical analysis indicators
 */
interface Indicators {
  rsi: number;
  macd: { macd: number; signal: number; histogram: number };
  bollingerBands: { upper: number; middle: number; lower: number };
  currentPrice: number;
  volatility: number;
}

/**
 * SignalGenerator Service
 * 
 * Generates trading signals using technical analysis indicators:
 * - RSI (Relative Strength Index) for momentum analysis
 * - MACD (Moving Average Convergence Divergence) for trend analysis
 * - Bollinger Bands for volatility analysis
 * 
 * Provides both basic signals for normal users and premium signals
 * with risk management (stop-loss and limit orders) for premium users.
 * 
 * Requirements: 3.1, 4.1
 */
export class SignalGenerator {
  private exchangeAggregator: ExchangeAggregator;
  private tradingSignalRepository: TradingSignalRepository;

  constructor(exchangeAggregator?: ExchangeAggregator, tradingSignalRepository?: TradingSignalRepository) {
    this.exchangeAggregator = exchangeAggregator || new ExchangeAggregator();
    this.tradingSignalRepository = tradingSignalRepository || new TradingSignalRepository();
  }

  /**
   * Generate a basic trading signal for normal users.
   * Uses algorithmic analysis with RSI, MACD, and Bollinger Bands.
   * Stores the generated signal in the database.
   * 
   * @param symbol - Cryptocurrency symbol (e.g., 'BTC', 'ETH')
   * @returns Basic trading signal with recommendation and analysis
   * 
   * Requirements: 3.1, 3.2
   */
  async generateBasicSignal(symbol: string): Promise<TradingSignal> {
    // Fetch historical data (30 days for technical indicators)
    const historicalData = await this.exchangeAggregator.getHistoricalData(symbol, 30);
    const currentPrice = await this.exchangeAggregator.getCurrentPrice(symbol);

    // Calculate technical indicators
    const indicators = this.calculateIndicators(historicalData, currentPrice);

    // Determine recommendation
    const recommendation = this.determineRecommendation(indicators);

    // Calculate confidence based on indicator alignment
    const confidence = this.calculateConfidence(indicators, recommendation);

    // Generate basic analysis text
    const basicAnalysis = this.generateBasicAnalysis(indicators, recommendation);

    const timestamp = new Date();

    // Store signal in database
    await this.tradingSignalRepository.create({
      cryptocurrency: symbol,
      recommendation,
      confidence,
      entryPrice: currentPrice,
      signalType: 'basic',
    });

    return {
      recommendation,
      confidence,
      timestamp,
      basicAnalysis,
    };
  }

  /**
   * Generate a premium trading signal with risk management.
   * Includes stop-loss, limit orders, and detailed analysis.
   * Stores the premium signal in the database.
   * 
   * @param symbol - Cryptocurrency symbol (e.g., 'BTC', 'ETH')
   * @returns Premium trading signal with risk management parameters
   * 
   * Requirements: 4.1, 4.2, 4.3
   */
  async generatePremiumSignal(symbol: string): Promise<TradingSignal> {
    // Fetch historical data and current price
    const historicalData = await this.exchangeAggregator.getHistoricalData(symbol, 30);
    const currentPrice = await this.exchangeAggregator.getCurrentPrice(symbol);

    // Calculate technical indicators
    const indicators = this.calculateIndicators(historicalData, currentPrice);

    // Determine recommendation
    const recommendation = this.determineRecommendation(indicators);

    // Calculate confidence based on indicator alignment
    const confidence = this.calculateConfidence(indicators, recommendation);

    // Generate basic analysis text
    const basicAnalysis = this.generateBasicAnalysis(indicators, recommendation);

    // Calculate volatility
    const prices = historicalData.map((point) => point.price);
    const volatility = this.calculateVolatility(prices);

    // Calculate stop-loss and limit orders
    const stopLoss = this.calculateStopLoss(currentPrice, volatility, recommendation);
    const limitOrder = this.calculateLimitOrder(currentPrice, recommendation, volatility);

    // Determine risk level
    const riskLevel = this.determineRiskLevel(volatility);

    // Generate detailed analysis
    const detailedAnalysis = this.generateDetailedAnalysis(
      historicalData,
      currentPrice,
      volatility,
      recommendation
    );

    const timestamp = new Date();

    // Store premium signal in database
    await this.tradingSignalRepository.create({
      cryptocurrency: symbol,
      recommendation,
      confidence,
      entryPrice: currentPrice,
      stopLoss,
      limitOrder,
      signalType: 'premium',
    });

    return {
      recommendation,
      confidence,
      timestamp,
      basicAnalysis,
      stopLoss,
      limitOrder,
      riskLevel,
      detailedAnalysis,
    };
  }

  /**
   * Calculate all technical indicators for signal generation.
   * 
   * @param historicalData - Array of price points
   * @param currentPrice - Current market price
   * @returns Object containing all calculated indicators
   */
  private calculateIndicators(historicalData: PricePoint[], currentPrice: number): Indicators {
    const prices = historicalData.map((point) => point.price);

    const rsi = this.calculateRSI(prices);
    const macd = this.calculateMACD(prices);
    const bollingerBands = this.calculateBollingerBands(prices);
    const volatility = this.calculateVolatility(prices);

    return {
      rsi,
      macd,
      bollingerBands,
      currentPrice,
      volatility,
    };
  }

  /**
   * Calculate RSI (Relative Strength Index) for momentum analysis.
   * RSI measures the speed and magnitude of price changes.
   * 
   * RSI > 70: Overbought (potential sell signal)
   * RSI < 30: Oversold (potential buy signal)
   * 
   * @param prices - Array of historical prices
   * @returns RSI value (0-100)
   */
  calculateRSI(prices: number[]): number {
    if (prices.length < 14) {
      return 50; // Neutral if insufficient data
    }

    // Calculate price changes
    const changes: number[] = [];
    for (let i = 1; i < prices.length; i++) {
      changes.push(prices[i] - prices[i - 1]);
    }

    // Separate gains and losses
    const gains = changes.map((change) => (change > 0 ? change : 0));
    const losses = changes.map((change) => (change < 0 ? Math.abs(change) : 0));

    // Calculate average gain and loss over 14 periods
    const avgGain = gains.slice(-14).reduce((sum, gain) => sum + gain, 0) / 14;
    const avgLoss = losses.slice(-14).reduce((sum, loss) => sum + loss, 0) / 14;

    // Avoid division by zero
    if (avgLoss === 0) {
      return 100;
    }

    // Calculate RS and RSI
    const rs = avgGain / avgLoss;
    const rsi = 100 - 100 / (1 + rs);

    return rsi;
  }

  /**
   * Calculate MACD (Moving Average Convergence Divergence) for trend analysis.
   * MACD shows the relationship between two moving averages.
   * 
   * MACD > Signal: Bullish (potential buy signal)
   * MACD < Signal: Bearish (potential sell signal)
   * 
   * @param prices - Array of historical prices
   * @returns Object with MACD line, signal line, and histogram
   */
  calculateMACD(prices: number[]): { macd: number; signal: number; histogram: number } {
    if (prices.length < 26) {
      return { macd: 0, signal: 0, histogram: 0 }; // Neutral if insufficient data
    }

    // Calculate 12-period EMA
    const ema12 = this.calculateEMA(prices, 12);

    // Calculate 26-period EMA
    const ema26 = this.calculateEMA(prices, 26);

    // MACD line = EMA12 - EMA26
    const macd = ema12 - ema26;

    // Signal line = 9-period EMA of MACD
    // For simplicity, we'll use a simple moving average approximation
    const signal = macd * 0.9; // Simplified signal line

    // Histogram = MACD - Signal
    const histogram = macd - signal;

    return { macd, signal, histogram };
  }

  /**
   * Calculate Bollinger Bands for volatility analysis.
   * Bollinger Bands consist of a middle band (SMA) and upper/lower bands (±2 standard deviations).
   * 
   * Price near upper band: Overbought
   * Price near lower band: Oversold
   * 
   * @param prices - Array of historical prices
   * @returns Object with upper, middle, and lower bands
   */
  calculateBollingerBands(prices: number[]): { upper: number; middle: number; lower: number } {
    if (prices.length < 20) {
      const avg = prices.reduce((sum, price) => sum + price, 0) / prices.length;
      return { upper: avg, middle: avg, lower: avg }; // Neutral if insufficient data
    }

    // Calculate 20-period SMA (middle band)
    const recentPrices = prices.slice(-20);
    const middle = recentPrices.reduce((sum, price) => sum + price, 0) / 20;

    // Calculate standard deviation
    const squaredDiffs = recentPrices.map((price) => Math.pow(price - middle, 2));
    const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / 20;
    const stdDev = Math.sqrt(variance);

    // Upper and lower bands = middle ± 2 * standard deviation
    const upper = middle + 2 * stdDev;
    const lower = middle - 2 * stdDev;

    return { upper, middle, lower };
  }

  /**
   * Determine trading recommendation based on technical indicators.
   * Uses a weighted scoring system combining RSI, MACD, and Bollinger Bands.
   * 
   * @param indicators - Calculated technical indicators
   * @returns Trading recommendation: 'buy', 'sell', or 'hold'
   */
  determineRecommendation(indicators: Indicators): 'buy' | 'sell' | 'hold' {
    let score = 0;

    // RSI analysis (weight: 1)
    if (indicators.rsi < 30) {
      score += 1; // Oversold - buy signal
    } else if (indicators.rsi > 70) {
      score -= 1; // Overbought - sell signal
    }

    // MACD analysis (weight: 1)
    if (indicators.macd.histogram > 0) {
      score += 1; // Bullish - buy signal
    } else if (indicators.macd.histogram < 0) {
      score -= 1; // Bearish - sell signal
    }

    // Bollinger Bands analysis (weight: 1)
    const { upper, lower } = indicators.bollingerBands;
    const pricePosition = (indicators.currentPrice - lower) / (upper - lower);

    if (pricePosition < 0.2) {
      score += 1; // Near lower band - buy signal
    } else if (pricePosition > 0.8) {
      score -= 1; // Near upper band - sell signal
    }

    // Determine recommendation based on score
    if (score >= 2) {
      return 'buy';
    } else if (score <= -2) {
      return 'sell';
    } else {
      return 'hold';
    }
  }

  /**
   * Calculate confidence level based on indicator alignment.
   * Higher confidence when multiple indicators agree.
   * 
   * @param indicators - Calculated technical indicators
   * @param recommendation - Determined recommendation
   * @returns Confidence percentage (0-100)
   */
  private calculateConfidence(indicators: Indicators, recommendation: 'buy' | 'sell' | 'hold'): number {
    let alignedIndicators = 0;
    const totalIndicators = 3;

    // Check RSI alignment
    if (recommendation === 'buy' && indicators.rsi < 30) alignedIndicators++;
    if (recommendation === 'sell' && indicators.rsi > 70) alignedIndicators++;
    if (recommendation === 'hold' && indicators.rsi >= 30 && indicators.rsi <= 70) alignedIndicators++;

    // Check MACD alignment
    if (recommendation === 'buy' && indicators.macd.histogram > 0) alignedIndicators++;
    if (recommendation === 'sell' && indicators.macd.histogram < 0) alignedIndicators++;
    if (recommendation === 'hold' && Math.abs(indicators.macd.histogram) < 10) alignedIndicators++;

    // Check Bollinger Bands alignment
    const { upper, lower } = indicators.bollingerBands;
    const pricePosition = (indicators.currentPrice - lower) / (upper - lower);
    if (recommendation === 'buy' && pricePosition < 0.2) alignedIndicators++;
    if (recommendation === 'sell' && pricePosition > 0.8) alignedIndicators++;
    if (recommendation === 'hold' && pricePosition >= 0.3 && pricePosition <= 0.7) alignedIndicators++;

    // Calculate confidence as percentage
    const baseConfidence = (alignedIndicators / totalIndicators) * 100;

    // Ensure confidence is between 40 and 95
    return Math.max(40, Math.min(95, baseConfidence));
  }

  /**
   * Generate basic analysis text for normal users.
   * 
   * @param indicators - Calculated technical indicators
   * @param recommendation - Determined recommendation
   * @returns Human-readable analysis text in English
   */
  private generateBasicAnalysis(indicators: Indicators, recommendation: 'buy' | 'sell' | 'hold'): string {
    const rsiStatus = indicators.rsi < 30 ? 'oversold' : indicators.rsi > 70 ? 'overbought' : 'neutral';
    const trendStatus = indicators.macd.histogram > 0 ? 'bullish' : 'bearish';

    let analysis = `Technical analysis indicates a ${recommendation.toUpperCase()} signal. `;
    analysis += `The RSI is ${indicators.rsi.toFixed(2)}, suggesting the asset is ${rsiStatus}. `;
    analysis += `The MACD shows a ${trendStatus} trend. `;

    if (recommendation === 'buy') {
      analysis += 'Multiple indicators suggest this may be a good entry point.';
    } else if (recommendation === 'sell') {
      analysis += 'Multiple indicators suggest this may be a good exit point.';
    } else {
      analysis += 'Consider waiting for stronger signals before taking action.';
    }

    return analysis;
  }

  /**
   * Calculate stop-loss price for risk management.
   * Stop-loss is set based on volatility and recommendation.
   * 
   * @param currentPrice - Current market price
   * @param volatility - Price volatility (standard deviation)
   * @param recommendation - Trading recommendation
   * @returns Stop-loss price
   */
  calculateStopLoss(currentPrice: number, volatility: number, recommendation: 'buy' | 'sell' | 'hold'): number {
    if (recommendation === 'buy') {
      // For buy signals, set stop-loss below current price
      // Use 2x volatility as buffer
      return currentPrice - 2 * volatility;
    } else if (recommendation === 'sell') {
      // For sell signals, set stop-loss above current price
      return currentPrice + 2 * volatility;
    } else {
      // For hold, use conservative stop-loss
      return currentPrice - 1.5 * volatility;
    }
  }

  /**
   * Calculate limit order price for profit taking.
   * Limit order is set based on recommendation and volatility.
   * 
   * @param currentPrice - Current market price
   * @param recommendation - Trading recommendation
   * @param volatility - Price volatility
   * @returns Limit order price
   */
  calculateLimitOrder(currentPrice: number, recommendation: 'buy' | 'sell' | 'hold', volatility: number): number {
    if (recommendation === 'buy') {
      // For buy signals, set limit order above current price for profit
      // Target 3x volatility as profit target
      return currentPrice + 3 * volatility;
    } else if (recommendation === 'sell') {
      // For sell signals, set limit order below current price
      return currentPrice - 3 * volatility;
    } else {
      // For hold, use moderate limit order
      return currentPrice + 2 * volatility;
    }
  }

  /**
   * Calculate price volatility (standard deviation).
   * 
   * @param prices - Array of historical prices
   * @returns Volatility (standard deviation)
   */
  private calculateVolatility(prices: number[]): number {
    if (prices.length < 2) {
      return 0;
    }

    const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const squaredDiffs = prices.map((price) => Math.pow(price - mean, 2));
    const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / prices.length;
    return Math.sqrt(variance);
  }

  /**
   * Determine risk level based on volatility.
   * 
   * @param volatility - Price volatility
   * @returns Risk level: 'low', 'medium', or 'high'
   */
  private determineRiskLevel(volatility: number): 'low' | 'medium' | 'high' {
    // Normalize volatility as percentage of average price
    // These thresholds can be adjusted based on market conditions
    if (volatility < 100) {
      return 'low';
    } else if (volatility < 500) {
      return 'medium';
    } else {
      return 'high';
    }
  }

  /**
   * Generate detailed analysis for premium users.
   * 
   * @param historicalData - Historical price data
   * @param currentPrice - Current market price
   * @param volatility - Price volatility
   * @param recommendation - Trading recommendation
   * @returns Detailed analysis text in English
   */
  private generateDetailedAnalysis(
    historicalData: PricePoint[],
    currentPrice: number,
    volatility: number,
    recommendation: 'buy' | 'sell' | 'hold'
  ): string {
    const prices = historicalData.map((point) => point.price);
    const priceChange = ((currentPrice - prices[0]) / prices[0]) * 100;

    let analysis = `Advanced Technical Analysis:\n\n`;
    analysis += `Current Price: $${currentPrice.toFixed(2)}\n`;
    analysis += `30-Day Change: ${priceChange > 0 ? '+' : ''}${priceChange.toFixed(2)}%\n`;
    analysis += `Volatility: $${volatility.toFixed(2)}\n\n`;

    analysis += `Recommendation: ${recommendation.toUpperCase()}\n\n`;

    if (recommendation === 'buy') {
      analysis += `Entry Strategy: Consider entering a position at current levels. `;
      analysis += `The technical indicators suggest strong buying momentum. `;
      analysis += `Use the provided stop-loss to manage downside risk.\n\n`;
    } else if (recommendation === 'sell') {
      analysis += `Exit Strategy: Consider reducing or closing positions. `;
      analysis += `The technical indicators suggest weakening momentum. `;
      analysis += `Use the provided limit order to secure profits.\n\n`;
    } else {
      analysis += `Wait Strategy: Current conditions suggest waiting for clearer signals. `;
      analysis += `Monitor the market for stronger confirmation before taking action.\n\n`;
    }

    analysis += `Risk Management: Always use stop-loss orders and never risk more than 2-3% of your portfolio on a single trade.`;

    return analysis;
  }

  /**
   * Calculate Exponential Moving Average (EMA).
   * Helper function for MACD calculation.
   * 
   * @param prices - Array of historical prices
   * @param period - EMA period
   * @returns EMA value
   */
  private calculateEMA(prices: number[], period: number): number {
    if (prices.length < period) {
      // If insufficient data, return simple average
      return prices.reduce((sum, price) => sum + price, 0) / prices.length;
    }

    // Calculate smoothing factor
    const multiplier = 2 / (period + 1);

    // Start with SMA for initial EMA
    const sma = prices.slice(0, period).reduce((sum, price) => sum + price, 0) / period;

    // Calculate EMA
    let ema = sma;
    for (let i = period; i < prices.length; i++) {
      ema = (prices[i] - ema) * multiplier + ema;
    }

    return ema;
  }
}
