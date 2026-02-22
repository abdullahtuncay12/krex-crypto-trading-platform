# SignalGenerator Service

## Overview

The `SignalGenerator` service is responsible for generating trading signals using technical analysis indicators. It provides both basic signals for normal users and premium signals with risk management parameters for premium users.

## Features

### Technical Indicators

1. **RSI (Relative Strength Index)**
   - Measures momentum and identifies overbought/oversold conditions
   - RSI > 70: Overbought (potential sell signal)
   - RSI < 30: Oversold (potential buy signal)
   - Period: 14 days

2. **MACD (Moving Average Convergence Divergence)**
   - Identifies trend direction and momentum
   - Uses 12-period and 26-period EMAs
   - Signal line: 9-period EMA of MACD
   - Positive histogram: Bullish trend
   - Negative histogram: Bearish trend

3. **Bollinger Bands**
   - Measures volatility and identifies price extremes
   - Middle band: 20-period SMA
   - Upper/Lower bands: ±2 standard deviations
   - Price near upper band: Overbought
   - Price near lower band: Oversold

### Signal Types

#### Basic Signal (Normal Users)
- Trading recommendation: buy, sell, or hold
- Confidence level (0-100)
- Basic analysis text in English
- Timestamp

#### Premium Signal (Premium Users)
- All basic signal fields
- Stop-loss price for risk management
- Limit order price for profit taking
- Risk level: low, medium, or high
- Detailed analysis with strategy recommendations

## Usage

```typescript
import { SignalGenerator } from './services/SignalGenerator';

const signalGenerator = new SignalGenerator();

// Generate basic signal for normal users
const basicSignal = await signalGenerator.generateBasicSignal('BTC');
console.log(basicSignal);
// {
//   recommendation: 'buy',
//   confidence: 75,
//   timestamp: 2024-01-15T10:30:00.000Z,
//   basicAnalysis: 'Technical analysis indicates a BUY signal...'
// }

// Generate premium signal for premium users
const premiumSignal = await signalGenerator.generatePremiumSignal('ETH');
console.log(premiumSignal);
// {
//   recommendation: 'buy',
//   confidence: 75,
//   timestamp: 2024-01-15T10:30:00.000Z,
//   basicAnalysis: 'Technical analysis indicates a BUY signal...',
//   stopLoss: 2850.50,
//   limitOrder: 3150.75,
//   riskLevel: 'medium',
//   detailedAnalysis: 'Advanced Technical Analysis:\n\nCurrent Price: $3000.00...'
// }
```

## Recommendation Logic

The service uses a weighted scoring system to determine recommendations:

1. **RSI Analysis** (Weight: 1)
   - RSI < 30: +1 (buy signal)
   - RSI > 70: -1 (sell signal)
   - Otherwise: 0 (neutral)

2. **MACD Analysis** (Weight: 1)
   - Histogram > 0: +1 (buy signal)
   - Histogram < 0: -1 (sell signal)

3. **Bollinger Bands Analysis** (Weight: 1)
   - Price in lower 20% of bands: +1 (buy signal)
   - Price in upper 20% of bands: -1 (sell signal)
   - Otherwise: 0 (neutral)

**Final Recommendation:**
- Score ≥ 2: BUY
- Score ≤ -2: SELL
- Otherwise: HOLD

## Risk Management

### Stop-Loss Calculation
- **Buy signals**: Set 2x volatility below current price
- **Sell signals**: Set 2x volatility above current price
- **Hold signals**: Set 1.5x volatility below current price

### Limit Order Calculation
- **Buy signals**: Set 3x volatility above current price (profit target)
- **Sell signals**: Set 3x volatility below current price
- **Hold signals**: Set 2x volatility above current price

### Risk Level Determination
- **Low**: Volatility < $100
- **Medium**: Volatility $100-$500
- **High**: Volatility > $500

## Data Requirements

The service requires at least 30 days of historical price data for accurate technical analysis. If insufficient data is available:
- RSI returns neutral value (50)
- MACD returns zeros
- Bollinger Bands return equal values

## Testing

The service includes comprehensive unit tests covering:
- Technical indicator calculations
- Recommendation logic
- Risk management calculations
- Edge cases (insufficient data, extreme volatility, etc.)

Run tests:
```bash
npm test -- SignalGenerator.test.ts
```

## Dependencies

- `ExchangeAggregator`: Fetches historical price data and current prices
- `PricePoint`: Interface for historical price data points

## Requirements Validation

This service validates the following requirements:
- **Requirement 3.1**: Basic trading signals for normal users
- **Requirement 4.1**: Advanced trading signals for premium users with risk management

## Notes

- All analysis text is generated in English
- Signals are generated using algorithmic analysis (not AI/ML)
- The service uses 30-second cached data from ExchangeAggregator
- Confidence levels range from 40-95% based on indicator alignment
