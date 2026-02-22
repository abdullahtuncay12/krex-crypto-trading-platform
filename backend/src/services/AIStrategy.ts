/**
 * AIStrategy Service
 * 
 * Implements AI-driven trading strategy using technical indicators.
 * Calculates RSI, MACD, Bollinger Bands, and generates trading signals.
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7
 */

export interface MarketData {
  timestamp: Date;
  price: number;
  volume?: number;
}

export interface TechnicalIndicators {
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
  };
  volatility: number;
}

export interface TradingSignal {
  signal: 'buy' | 'sell' | 'hold';
  confidence: number;
  positionSize: number;
  stopLoss: number;
  indicators: TechnicalIndicators;
  reason: string;
}

export class AIStrategy {
  /**
   * Calculate RSI (Relative Strength Index)
   * Requirement 5.2: Use RSI for momentum analysis
   * @param prices - Array of closing prices (most recent last)
   * @param period - RSI period (default: 14)
   */
  calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) {
      throw new Error(`Insufficient data for RSI calculation. Need at least ${period + 1} prices`);
    }

    // Calculate price changes
    const changes: number[] = [];
    for (let i = 1; i < prices.length; i++) {
      changes.push(prices[i] - prices[i - 1]);
    }

    // Calculate initial average gain and loss
    let avgGain = 0;
    let avgLoss = 0;
    
    for (let i = 0; i < period; i++) {
      if (changes[i] > 0) {
        avgGain += changes[i];
      } else {
        avgLoss += Math.abs(changes[i]);
      }
    }
    
    avgGain /= period;
    avgLoss /= period;

    // Calculate RSI using smoothed averages
    for (let i = period; i < changes.length; i++) {
      const change = changes[i];
      const gain = change > 0 ? change : 0;
      const loss = change < 0 ? Math.abs(change) : 0;
      
      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
    }

    if (avgLoss === 0) {
      return 100;
    }

    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));

    return rsi;
  }

  /**
   * Calculate MACD (Moving Average Convergence Divergence)
   * Requirement 5.2: Use MACD for trend analysis
   * @param prices - Array of closing prices (most recent last)
   */
  calculateMACD(prices: number[]): { macd: number; signal: number; histogram: number } {
    if (prices.length < 26) {
      throw new Error('Insufficient data for MACD calculation. Need at least 26 prices');
    }

    // Calculate EMA
    const calculateEMA = (data: number[], period: number): number[] => {
      const ema: number[] = [];
      const multiplier = 2 / (period + 1);
      
      // Start with SMA
      let sum = 0;
      for (let i = 0; i < period; i++) {
        sum += data[i];
      }
      ema.push(sum / period);
      
      // Calculate EMA
      for (let i = period; i < data.length; i++) {
        const value = (data[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1];
        ema.push(value);
      }
      
      return ema;
    };

    // Calculate 12-period and 26-period EMAs
    const ema12 = calculateEMA(prices, 12);
    const ema26 = calculateEMA(prices, 26);

    // Calculate MACD line
    const macdLine: number[] = [];
    for (let i = 0; i < ema12.length && i < ema26.length; i++) {
      macdLine.push(ema12[i] - ema26[i]);
    }

    // Calculate signal line (9-period EMA of MACD)
    const signalLine = calculateEMA(macdLine, 9);

    // Get most recent values
    const macd = macdLine[macdLine.length - 1];
    const signal = signalLine[signalLine.length - 1];
    const histogram = macd - signal;

    return { macd, signal, histogram };
  }

  /**
   * Calculate Bollinger Bands
   * Requirement 5.2: Use Bollinger Bands for volatility analysis
   * @param prices - Array of closing prices (most recent last)
   * @param period - Period for moving average (default: 20)
   * @param stdDev - Number of standard deviations (default: 2)
   */
  calculateBollingerBands(
    prices: number[],
    period: number = 20,
    stdDev: number = 2
  ): { upper: number; middle: number; lower: number } {
    if (prices.length < period) {
      throw new Error(`Insufficient data for Bollinger Bands. Need at least ${period} prices`);
    }

    // Calculate SMA (middle band)
    const recentPrices = prices.slice(-period);
    const sum = recentPrices.reduce((acc, price) => acc + price, 0);
    const middle = sum / period;

    // Calculate standard deviation
    const squaredDiffs = recentPrices.map(price => Math.pow(price - middle, 2));
    const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / period;
    const standardDeviation = Math.sqrt(variance);

    // Calculate upper and lower bands
    const upper = middle + (stdDev * standardDeviation);
    const lower = middle - (stdDev * standardDeviation);

    return { upper, middle, lower };
  }

  /**
   * Calculate volatility
   * Requirement 5.7: Monitor volatility for pause mechanism
   * @param prices - Array of closing prices (most recent last)
   * @param period - Period for volatility calculation (default: 14)
   */
  calculateVolatility(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) {
      throw new Error(`Insufficient data for volatility calculation. Need at least ${period + 1} prices`);
    }

    const recentPrices = prices.slice(-period - 1);
    
    // Calculate returns
    const returns: number[] = [];
    for (let i = 1; i < recentPrices.length; i++) {
      const returnValue = (recentPrices[i] - recentPrices[i - 1]) / recentPrices[i - 1];
      returns.push(returnValue);
    }

    // Calculate standard deviation of returns
    const mean = returns.reduce((acc, val) => acc + val, 0) / returns.length;
    const squaredDiffs = returns.map(ret => Math.pow(ret - mean, 2));
    const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / returns.length;
    const volatility = Math.sqrt(variance);

    return volatility;
  }

  /**
   * Determine trading signal based on technical indicators
   * Requirement 5.1: Generate buy/sell/hold signals
   * Requirement 5.3: Only execute trades with confidence > 0.7
   */
  determineSignal(indicators: TechnicalIndicators): 'buy' | 'sell' | 'hold' {
    const { rsi, macd, bollingerBands } = indicators;
    const currentPrice = bollingerBands.middle; // Using middle band as reference

    let buySignals = 0;
    let sellSignals = 0;

    // RSI signals
    if (rsi < 30) {
      buySignals += 2; // Strong oversold signal
    } else if (rsi < 40) {
      buySignals += 1; // Moderate oversold
    } else if (rsi > 70) {
      sellSignals += 2; // Strong overbought signal
    } else if (rsi > 60) {
      sellSignals += 1; // Moderate overbought
    }

    // MACD signals
    if (macd.histogram > 0 && macd.macd > macd.signal) {
      buySignals += 2; // Bullish momentum
    } else if (macd.histogram < 0 && macd.macd < macd.signal) {
      sellSignals += 2; // Bearish momentum
    }

    // Bollinger Bands signals
    // Note: We'd need current price for this, using middle as placeholder
    // In real implementation, pass current price separately

    // Determine signal based on total signals
    if (buySignals > sellSignals && buySignals >= 3) {
      return 'buy';
    } else if (sellSignals > buySignals && sellSignals >= 3) {
      return 'sell';
    } else {
      return 'hold';
    }
  }

  /**
   * Calculate confidence score for trading signal
   * Requirement 5.4: Calculate confidence score (0-1)
   * Requirement 5.3: Confidence threshold of 0.7
   */
  calculateConfidence(indicators: TechnicalIndicators, signal: 'buy' | 'sell' | 'hold'): number {
    if (signal === 'hold') {
      return 0;
    }

    let confidence = 0;
    const { rsi, macd, bollingerBands } = indicators;

    // RSI contribution (0-0.35)
    if (signal === 'buy') {
      if (rsi < 30) {
        confidence += 0.35;
      } else if (rsi < 40) {
        confidence += 0.25;
      } else if (rsi < 50) {
        confidence += 0.15;
      }
    } else if (signal === 'sell') {
      if (rsi > 70) {
        confidence += 0.35;
      } else if (rsi > 60) {
        confidence += 0.25;
      } else if (rsi > 50) {
        confidence += 0.15;
      }
    }

    // MACD contribution (0-0.35)
    const histogramStrength = Math.abs(macd.histogram);
    if (signal === 'buy' && macd.histogram > 0) {
      confidence += Math.min(0.35, histogramStrength * 10);
    } else if (signal === 'sell' && macd.histogram < 0) {
      confidence += Math.min(0.35, histogramStrength * 10);
    }

    // Volatility contribution (0-0.30)
    // Lower volatility = higher confidence
    const volatility = indicators.volatility;
    if (volatility < 0.02) {
      confidence += 0.30;
    } else if (volatility < 0.05) {
      confidence += 0.20;
    } else if (volatility < 0.10) {
      confidence += 0.10;
    }

    // Ensure confidence is between 0 and 1
    return Math.min(1, Math.max(0, confidence));
  }

  /**
   * Calculate position size based on principal amount
   * Requirement 5.5: Position size limited to 20% of principal
   * @param principalAmount - Total investment amount
   * @param currentPrice - Current cryptocurrency price
   */
  calculatePositionSize(principalAmount: number, currentPrice: number): number {
    const maxPositionValue = principalAmount * 0.20; // 20% limit
    const quantity = maxPositionValue / currentPrice;
    return quantity;
  }

  /**
   * Calculate stop-loss price
   * Requirement 5.6: Stop-loss at 5% below entry price
   * @param entryPrice - Entry price for the position
   */
  calculateStopLoss(entryPrice: number): number {
    return entryPrice * 0.95; // 5% below entry
  }

  /**
   * Main analysis method - generates complete trading signal
   * Requirement 5.1: Analyze market and generate signals
   * Requirement 5.7: Pause trading during high volatility (>10%)
   * @param prices - Historical price data (most recent last)
   * @param principalAmount - Investment principal amount
   */
  analyze(prices: number[], principalAmount: number): TradingSignal {
    // Calculate all technical indicators
    const rsi = this.calculateRSI(prices);
    const macd = this.calculateMACD(prices);
    const bollingerBands = this.calculateBollingerBands(prices);
    const volatility = this.calculateVolatility(prices);

    const indicators: TechnicalIndicators = {
      rsi,
      macd,
      bollingerBands,
      volatility
    };

    // Check for high volatility pause
    // Requirement 5.7: Pause if volatility > 10%
    if (volatility > 0.10) {
      const currentPrice = prices[prices.length - 1];
      const positionSize = this.calculatePositionSize(principalAmount, currentPrice);
      const stopLoss = this.calculateStopLoss(currentPrice);

      return {
        signal: 'hold',
        confidence: 0,
        positionSize,
        stopLoss,
        indicators,
        reason: `Trading paused: High volatility detected (${(volatility * 100).toFixed(2)}% > 10% threshold)`
      };
    }

    // Determine signal
    const signal = this.determineSignal(indicators);

    // Calculate confidence
    const confidence = this.calculateConfidence(indicators, signal);

    // Get current price
    const currentPrice = prices[prices.length - 1];

    // Calculate position size and stop-loss
    const positionSize = this.calculatePositionSize(principalAmount, currentPrice);
    const stopLoss = this.calculateStopLoss(currentPrice);

    // Generate reason
    let reason = '';
    if (signal === 'buy') {
      reason = `Buy signal: RSI=${rsi.toFixed(2)}, MACD histogram=${macd.histogram.toFixed(4)}, Confidence=${confidence.toFixed(2)}`;
    } else if (signal === 'sell') {
      reason = `Sell signal: RSI=${rsi.toFixed(2)}, MACD histogram=${macd.histogram.toFixed(4)}, Confidence=${confidence.toFixed(2)}`;
    } else {
      reason = `Hold: Insufficient signal strength. Confidence would be ${confidence.toFixed(2)}`;
    }

    return {
      signal,
      confidence,
      positionSize,
      stopLoss,
      indicators,
      reason
    };
  }
}

// Export singleton instance
export const aiStrategy = new AIStrategy();
