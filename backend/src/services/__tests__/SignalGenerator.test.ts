import { SignalGenerator } from '../SignalGenerator';
import { ExchangeAggregator } from '../ExchangeAggregator';
import { PricePoint } from '../exchanges/BaseExchangeClient';
import { TradingSignalRepository } from '../../models/TradingSignalRepository';

// Mock ExchangeAggregator and TradingSignalRepository
jest.mock('../ExchangeAggregator');
jest.mock('../../models/TradingSignalRepository');

describe('SignalGenerator', () => {
  let signalGenerator: SignalGenerator;
  let mockExchangeAggregator: jest.Mocked<ExchangeAggregator>;
  let mockTradingSignalRepository: jest.Mocked<TradingSignalRepository>;

  beforeEach(() => {
    mockExchangeAggregator = new ExchangeAggregator() as jest.Mocked<ExchangeAggregator>;
    mockTradingSignalRepository = new TradingSignalRepository() as jest.Mocked<TradingSignalRepository>;
    
    // Mock the create method to return a valid signal
    mockTradingSignalRepository.create = jest.fn().mockResolvedValue({
      id: '123',
      cryptocurrency: 'BTC',
      recommendation: 'buy',
      confidence: 75,
      entryPrice: 100,
      stopLoss: null,
      limitOrder: null,
      signalType: 'basic',
      createdAt: new Date(),
    });
    
    signalGenerator = new SignalGenerator(mockExchangeAggregator, mockTradingSignalRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Helper function to generate mock historical data
  const generateMockHistoricalData = (basePrice: number, trend: 'up' | 'down' | 'flat', days: number = 30): PricePoint[] => {
    const data: PricePoint[] = [];
    const now = new Date();

    for (let i = 0; i < days; i++) {
      const timestamp = new Date(now.getTime() - (days - i) * 24 * 60 * 60 * 1000);
      let price = basePrice;

      if (trend === 'up') {
        price = basePrice + (i * basePrice * 0.01); // 1% increase per day
      } else if (trend === 'down') {
        price = basePrice - (i * basePrice * 0.01); // 1% decrease per day
      } else {
        price = basePrice + (Math.random() - 0.5) * basePrice * 0.005; // Small random fluctuation
      }

      data.push({
        timestamp,
        price,
        volume: 1000000 + Math.random() * 500000,
      });
    }

    return data;
  };

  describe('calculateRSI', () => {
    it('should calculate RSI correctly for upward trending prices', () => {
      const prices = [100, 102, 105, 107, 110, 112, 115, 118, 120, 123, 125, 128, 130, 133, 135];
      const rsi = signalGenerator.calculateRSI(prices);

      expect(rsi).toBeGreaterThan(50); // Upward trend should have RSI > 50
      expect(rsi).toBeLessThanOrEqual(100);
    });

    it('should calculate RSI correctly for downward trending prices', () => {
      const prices = [135, 133, 130, 128, 125, 123, 120, 118, 115, 112, 110, 107, 105, 102, 100];
      const rsi = signalGenerator.calculateRSI(prices);

      expect(rsi).toBeLessThan(50); // Downward trend should have RSI < 50
      expect(rsi).toBeGreaterThanOrEqual(0);
    });

    it('should return neutral RSI (50) when insufficient data', () => {
      const prices = [100, 102, 105];
      const rsi = signalGenerator.calculateRSI(prices);

      expect(rsi).toBe(50);
    });

    it('should return 100 when there are only gains', () => {
      const prices = [100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114];
      const rsi = signalGenerator.calculateRSI(prices);

      expect(rsi).toBe(100);
    });

    it('should handle flat prices', () => {
      const prices = Array(20).fill(100);
      const rsi = signalGenerator.calculateRSI(prices);

      expect(rsi).toBe(100); // No losses means RSI = 100
    });
  });

  describe('calculateMACD', () => {
    it('should calculate MACD with positive histogram for upward trend', () => {
      const prices = Array.from({ length: 30 }, (_, i) => 100 + i * 2);
      const macd = signalGenerator.calculateMACD(prices);

      expect(macd).toHaveProperty('macd');
      expect(macd).toHaveProperty('signal');
      expect(macd).toHaveProperty('histogram');
      expect(macd.histogram).toBeGreaterThan(0); // Upward trend should have positive histogram
    });

    it('should calculate MACD with negative histogram for downward trend', () => {
      const prices = Array.from({ length: 30 }, (_, i) => 200 - i * 2);
      const macd = signalGenerator.calculateMACD(prices);

      expect(macd.histogram).toBeLessThan(0); // Downward trend should have negative histogram
    });

    it('should return neutral MACD when insufficient data', () => {
      const prices = [100, 102, 105];
      const macd = signalGenerator.calculateMACD(prices);

      expect(macd.macd).toBe(0);
      expect(macd.signal).toBe(0);
      expect(macd.histogram).toBe(0);
    });

    it('should calculate MACD for exactly 26 data points', () => {
      const prices = Array.from({ length: 26 }, (_, i) => 100 + i);
      const macd = signalGenerator.calculateMACD(prices);

      expect(macd.macd).not.toBe(0);
      expect(macd.signal).not.toBe(0);
    });
  });

  describe('calculateBollingerBands', () => {
    it('should calculate Bollinger Bands correctly', () => {
      const prices = Array.from({ length: 30 }, () => 100 + Math.random() * 10);
      const bands = signalGenerator.calculateBollingerBands(prices);

      expect(bands).toHaveProperty('upper');
      expect(bands).toHaveProperty('middle');
      expect(bands).toHaveProperty('lower');
      expect(bands.upper).toBeGreaterThan(bands.middle);
      expect(bands.middle).toBeGreaterThan(bands.lower);
    });

    it('should return equal bands when insufficient data', () => {
      const prices = [100, 102, 105];
      const bands = signalGenerator.calculateBollingerBands(prices);

      expect(bands.upper).toBe(bands.middle);
      expect(bands.middle).toBe(bands.lower);
    });

    it('should have wider bands for volatile prices', () => {
      const volatilePrices = [100, 120, 90, 130, 80, 140, 70, 150, 60, 160, 50, 170, 40, 180, 30, 190, 20, 200, 10, 210];
      const stablePrices = Array(20).fill(100);

      const volatileBands = signalGenerator.calculateBollingerBands(volatilePrices);
      const stableBands = signalGenerator.calculateBollingerBands(stablePrices);

      const volatileBandWidth = volatileBands.upper - volatileBands.lower;
      const stableBandWidth = stableBands.upper - stableBands.lower;

      expect(volatileBandWidth).toBeGreaterThan(stableBandWidth);
    });
  });

  describe('determineRecommendation', () => {
    it('should recommend buy when RSI is oversold, MACD is bullish, and price is near lower band', () => {
      const indicators = {
        rsi: 25, // Oversold
        macd: { macd: 10, signal: 5, histogram: 5 }, // Bullish
        bollingerBands: { upper: 110, middle: 100, lower: 90 },
        currentPrice: 92, // Near lower band
        volatility: 5,
      };

      const recommendation = signalGenerator.determineRecommendation(indicators);
      expect(recommendation).toBe('buy');
    });

    it('should recommend sell when RSI is overbought, MACD is bearish, and price is near upper band', () => {
      const indicators = {
        rsi: 75, // Overbought
        macd: { macd: -10, signal: -5, histogram: -5 }, // Bearish
        bollingerBands: { upper: 110, middle: 100, lower: 90 },
        currentPrice: 108, // Near upper band
        volatility: 5,
      };

      const recommendation = signalGenerator.determineRecommendation(indicators);
      expect(recommendation).toBe('sell');
    });

    it('should recommend hold when indicators are mixed', () => {
      const indicators = {
        rsi: 50, // Neutral
        macd: { macd: 1, signal: 0.5, histogram: 0.5 }, // Slightly bullish
        bollingerBands: { upper: 110, middle: 100, lower: 90 },
        currentPrice: 100, // Middle of bands
        volatility: 5,
      };

      const recommendation = signalGenerator.determineRecommendation(indicators);
      expect(recommendation).toBe('hold');
    });

    it('should recommend hold when only one indicator suggests action', () => {
      const indicators = {
        rsi: 25, // Oversold (buy signal)
        macd: { macd: -5, signal: -3, histogram: -2 }, // Bearish (sell signal)
        bollingerBands: { upper: 110, middle: 100, lower: 90 },
        currentPrice: 100, // Neutral
        volatility: 5,
      };

      const recommendation = signalGenerator.determineRecommendation(indicators);
      expect(recommendation).toBe('hold');
    });
  });

  describe('calculateStopLoss', () => {
    it('should calculate stop-loss below current price for buy recommendation', () => {
      const currentPrice = 100;
      const volatility = 5;
      const stopLoss = signalGenerator.calculateStopLoss(currentPrice, volatility, 'buy');

      expect(stopLoss).toBeLessThan(currentPrice);
      expect(stopLoss).toBe(currentPrice - 2 * volatility);
    });

    it('should calculate stop-loss above current price for sell recommendation', () => {
      const currentPrice = 100;
      const volatility = 5;
      const stopLoss = signalGenerator.calculateStopLoss(currentPrice, volatility, 'sell');

      expect(stopLoss).toBeGreaterThan(currentPrice);
      expect(stopLoss).toBe(currentPrice + 2 * volatility);
    });

    it('should calculate conservative stop-loss for hold recommendation', () => {
      const currentPrice = 100;
      const volatility = 5;
      const stopLoss = signalGenerator.calculateStopLoss(currentPrice, volatility, 'hold');

      expect(stopLoss).toBeLessThan(currentPrice);
      expect(stopLoss).toBe(currentPrice - 1.5 * volatility);
    });

    it('should adjust stop-loss based on volatility', () => {
      const currentPrice = 100;
      const lowVolatility = 2;
      const highVolatility = 10;

      const stopLossLow = signalGenerator.calculateStopLoss(currentPrice, lowVolatility, 'buy');
      const stopLossHigh = signalGenerator.calculateStopLoss(currentPrice, highVolatility, 'buy');

      expect(stopLossHigh).toBeLessThan(stopLossLow); // Higher volatility = lower stop-loss
    });
  });

  describe('calculateLimitOrder', () => {
    it('should calculate limit order above current price for buy recommendation', () => {
      const currentPrice = 100;
      const volatility = 5;
      const limitOrder = signalGenerator.calculateLimitOrder(currentPrice, 'buy', volatility);

      expect(limitOrder).toBeGreaterThan(currentPrice);
      expect(limitOrder).toBe(currentPrice + 3 * volatility);
    });

    it('should calculate limit order below current price for sell recommendation', () => {
      const currentPrice = 100;
      const volatility = 5;
      const limitOrder = signalGenerator.calculateLimitOrder(currentPrice, 'sell', volatility);

      expect(limitOrder).toBeLessThan(currentPrice);
      expect(limitOrder).toBe(currentPrice - 3 * volatility);
    });

    it('should calculate moderate limit order for hold recommendation', () => {
      const currentPrice = 100;
      const volatility = 5;
      const limitOrder = signalGenerator.calculateLimitOrder(currentPrice, 'hold', volatility);

      expect(limitOrder).toBeGreaterThan(currentPrice);
      expect(limitOrder).toBe(currentPrice + 2 * volatility);
    });
  });

  describe('generateBasicSignal', () => {
    it('should generate a valid basic signal with all required fields', async () => {
      const mockHistoricalData = generateMockHistoricalData(100, 'up', 30);
      mockExchangeAggregator.getHistoricalData.mockResolvedValue(mockHistoricalData);
      mockExchangeAggregator.getCurrentPrice.mockResolvedValue(130);

      const signal = await signalGenerator.generateBasicSignal('BTC');

      expect(signal).toHaveProperty('recommendation');
      expect(['buy', 'sell', 'hold']).toContain(signal.recommendation);
      expect(signal).toHaveProperty('confidence');
      expect(signal.confidence).toBeGreaterThanOrEqual(0);
      expect(signal.confidence).toBeLessThanOrEqual(100);
      expect(signal).toHaveProperty('timestamp');
      expect(signal.timestamp).toBeInstanceOf(Date);
      expect(signal).toHaveProperty('basicAnalysis');
      expect(typeof signal.basicAnalysis).toBe('string');
      expect(signal.basicAnalysis.length).toBeGreaterThan(0);
    });

    it('should store generated signal in database', async () => {
      const mockHistoricalData = generateMockHistoricalData(100, 'up', 30);
      mockExchangeAggregator.getHistoricalData.mockResolvedValue(mockHistoricalData);
      mockExchangeAggregator.getCurrentPrice.mockResolvedValue(130);

      await signalGenerator.generateBasicSignal('BTC');

      expect(mockTradingSignalRepository.create).toHaveBeenCalledTimes(1);
      expect(mockTradingSignalRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          cryptocurrency: 'BTC',
          recommendation: expect.stringMatching(/^(buy|sell|hold)$/),
          confidence: expect.any(Number),
          entryPrice: 130,
          signalType: 'basic',
        })
      );
    });

    it('should generate buy signal for strong upward trend', async () => {
      // Create strong upward trend with oversold RSI conditions
      const mockHistoricalData = generateMockHistoricalData(100, 'down', 30);
      mockExchangeAggregator.getHistoricalData.mockResolvedValue(mockHistoricalData);
      mockExchangeAggregator.getCurrentPrice.mockResolvedValue(70); // Low price

      const signal = await signalGenerator.generateBasicSignal('BTC');

      expect(signal.recommendation).toBe('buy');
    });

    it('should generate sell signal for strong downward trend', async () => {
      // Create strong downward trend with overbought conditions
      const mockHistoricalData = generateMockHistoricalData(100, 'up', 30);
      mockExchangeAggregator.getHistoricalData.mockResolvedValue(mockHistoricalData);
      mockExchangeAggregator.getCurrentPrice.mockResolvedValue(130); // High price

      const signal = await signalGenerator.generateBasicSignal('BTC');

      expect(signal.recommendation).toBe('sell');
    });

    it('should include English text in basic analysis', async () => {
      const mockHistoricalData = generateMockHistoricalData(100, 'flat', 30);
      mockExchangeAggregator.getHistoricalData.mockResolvedValue(mockHistoricalData);
      mockExchangeAggregator.getCurrentPrice.mockResolvedValue(100);

      const signal = await signalGenerator.generateBasicSignal('BTC');

      expect(signal.basicAnalysis).toMatch(/RSI|MACD|bullish|bearish|oversold|overbought|neutral/i);
    });
  });

  describe('generatePremiumSignal', () => {
    it('should generate a valid premium signal with all required fields', async () => {
      const mockHistoricalData = generateMockHistoricalData(100, 'up', 30);
      mockExchangeAggregator.getHistoricalData.mockResolvedValue(mockHistoricalData);
      mockExchangeAggregator.getCurrentPrice.mockResolvedValue(130);

      const signal = await signalGenerator.generatePremiumSignal('BTC');

      // Basic fields
      expect(signal).toHaveProperty('recommendation');
      expect(signal).toHaveProperty('confidence');
      expect(signal).toHaveProperty('timestamp');
      expect(signal).toHaveProperty('basicAnalysis');

      // Premium fields
      expect(signal).toHaveProperty('stopLoss');
      expect(typeof signal.stopLoss).toBe('number');
      expect(signal).toHaveProperty('limitOrder');
      expect(typeof signal.limitOrder).toBe('number');
      expect(signal).toHaveProperty('riskLevel');
      expect(['low', 'medium', 'high']).toContain(signal.riskLevel);
      expect(signal).toHaveProperty('detailedAnalysis');
      expect(typeof signal.detailedAnalysis).toBe('string');
      expect(signal.detailedAnalysis!.length).toBeGreaterThan(signal.basicAnalysis.length);
    });

    it('should include stop-loss and limit order for buy recommendation', async () => {
      const mockHistoricalData = generateMockHistoricalData(100, 'down', 30);
      mockExchangeAggregator.getHistoricalData.mockResolvedValue(mockHistoricalData);
      mockExchangeAggregator.getCurrentPrice.mockResolvedValue(70);

      const signal = await signalGenerator.generatePremiumSignal('BTC');

      expect(signal.recommendation).toBe('buy');
      expect(signal.stopLoss).toBeLessThan(70); // Stop-loss below entry
      expect(signal.limitOrder).toBeGreaterThan(70); // Limit order above entry
    });

    it('should include stop-loss and limit order for sell recommendation', async () => {
      const mockHistoricalData = generateMockHistoricalData(100, 'up', 30);
      mockExchangeAggregator.getHistoricalData.mockResolvedValue(mockHistoricalData);
      mockExchangeAggregator.getCurrentPrice.mockResolvedValue(130);

      const signal = await signalGenerator.generatePremiumSignal('BTC');

      expect(signal.recommendation).toBe('sell');
      expect(signal.stopLoss).toBeGreaterThan(130); // Stop-loss above entry
      expect(signal.limitOrder).toBeLessThan(130); // Limit order below entry
    });

    it('should determine risk level based on volatility', async () => {
      // Low volatility scenario
      const stablePrices = Array.from({ length: 30 }, (_, i) => ({
        timestamp: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000),
        price: 100 + Math.random() * 2, // Very stable
        volume: 1000000,
      }));

      mockExchangeAggregator.getHistoricalData.mockResolvedValue(stablePrices);
      mockExchangeAggregator.getCurrentPrice.mockResolvedValue(100);

      const signal = await signalGenerator.generatePremiumSignal('BTC');

      expect(signal.riskLevel).toBe('low');
    });

    it('should include detailed analysis in English', async () => {
      const mockHistoricalData = generateMockHistoricalData(100, 'up', 30);
      mockExchangeAggregator.getHistoricalData.mockResolvedValue(mockHistoricalData);
      mockExchangeAggregator.getCurrentPrice.mockResolvedValue(130);

      const signal = await signalGenerator.generatePremiumSignal('BTC');

      expect(signal.detailedAnalysis).toMatch(/Current Price|Volatility|Recommendation|Strategy/i);
    });

    it('should store premium signal in database with signalType premium', async () => {
      const mockHistoricalData = generateMockHistoricalData(100, 'up', 30);
      mockExchangeAggregator.getHistoricalData.mockResolvedValue(mockHistoricalData);
      mockExchangeAggregator.getCurrentPrice.mockResolvedValue(130);

      await signalGenerator.generatePremiumSignal('ETH');

      expect(mockTradingSignalRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          cryptocurrency: 'ETH',
          recommendation: expect.stringMatching(/^(buy|sell|hold)$/),
          confidence: expect.any(Number),
          entryPrice: 130,
          stopLoss: expect.any(Number),
          limitOrder: expect.any(Number),
          signalType: 'premium',
        })
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty price array gracefully', () => {
      const rsi = signalGenerator.calculateRSI([]);
      expect(rsi).toBe(50);

      const macd = signalGenerator.calculateMACD([]);
      expect(macd).toEqual({ macd: 0, signal: 0, histogram: 0 });

      const bands = signalGenerator.calculateBollingerBands([]);
      expect(bands.upper).toBe(bands.middle);
      expect(bands.middle).toBe(bands.lower);
    });

    it('should handle single price point', () => {
      const rsi = signalGenerator.calculateRSI([100]);
      expect(rsi).toBe(50);

      const macd = signalGenerator.calculateMACD([100]);
      expect(macd.macd).toBe(0);
    });

    it('should handle extreme volatility', async () => {
      const extremePrices = Array.from({ length: 30 }, (_, i) => ({
        timestamp: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000),
        price: 100 + (i % 2 === 0 ? 1000 : -1000), // Extreme swings
        volume: 1000000,
      }));

      mockExchangeAggregator.getHistoricalData.mockResolvedValue(extremePrices);
      mockExchangeAggregator.getCurrentPrice.mockResolvedValue(100);

      const signal = await signalGenerator.generatePremiumSignal('BTC');

      expect(signal.riskLevel).toBe('high');
      expect(signal.stopLoss).toBeDefined();
      expect(signal.limitOrder).toBeDefined();
    });

    it('should handle zero volatility', () => {
      const currentPrice = 100;
      const volatility = 0;

      const stopLoss = signalGenerator.calculateStopLoss(currentPrice, volatility, 'buy');
      const limitOrder = signalGenerator.calculateLimitOrder(currentPrice, 'buy', volatility);

      expect(stopLoss).toBe(currentPrice); // No volatility = no buffer
      expect(limitOrder).toBe(currentPrice);
    });
  });
});
