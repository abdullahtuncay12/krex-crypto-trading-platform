# Exchange Client Wrappers

This directory contains exchange client wrappers for integrating with major cryptocurrency exchanges (Binance, Coinbase, and Bybit).

## Overview

Each exchange client implements the `ExchangeClientInterface` and provides three core methods:
- `getCurrentPrice(symbol: string): Promise<number>` - Get the current spot price for a cryptocurrency
- `getHistoricalData(symbol: string, days: number): Promise<PricePoint[]>` - Get historical price data
- `get24hVolume(symbol: string): Promise<number>` - Get 24-hour trading volume

## Features

### Retry Logic with Exponential Backoff
All exchange clients inherit from `BaseExchangeClient`, which implements automatic retry logic:
- **Max retries**: 5 attempts
- **Backoff delays**: 1s, 2s, 4s, 8s, 16s (capped at 16 seconds)
- **Smart retry**: Does not retry on 4xx client errors (only retries on network/server errors)

### Symbol Normalization
Each client automatically normalizes cryptocurrency symbols to the exchange's expected format:
- **Binance**: `BTC` → `BTCUSDT`
- **Coinbase**: `BTC` → `BTC-USD`
- **Bybit**: `BTC` → `BTCUSDT`

## Usage

```typescript
import { BinanceClient, CoinbaseClient, BybitClient } from './services/exchanges';

// Create client instances
const binance = new BinanceClient();
const coinbase = new CoinbaseClient();
const bybit = new BybitClient();

// Get current price
const btcPrice = await binance.getCurrentPrice('BTC');
console.log(`BTC Price: $${btcPrice}`);

// Get historical data (last 30 days)
const historicalData = await binance.getHistoricalData('BTC', 30);
console.log(`Data points: ${historicalData.length}`);

// Get 24h volume
const volume = await binance.get24hVolume('BTC');
console.log(`24h Volume: ${volume}`);
```

## Exchange-Specific Details

### BinanceClient
- **Base URL**: `https://api.binance.com`
- **API Version**: v3
- **Symbol Format**: `BTCUSDT` (base + USDT)
- **Historical Data**: Uses klines endpoint with 1-day interval
- **Volume**: Returns base asset volume (not quote asset)

### CoinbaseClient
- **Base URL**: `https://api.coinbase.com`
- **API Version**: v2
- **Symbol Format**: `BTC-USD` (base-USD)
- **Historical Data**: Uses historic prices endpoint
- **Volume**: Falls back to Coinbase Pro API for volume data (v2 API limitation)
- **Note**: Volume data may return 0 if Coinbase Pro API is unavailable

### BybitClient
- **Base URL**: `https://api.bybit.com`
- **API Version**: v5
- **Symbol Format**: `BTCUSDT` (base + USDT)
- **Category**: Spot trading
- **Historical Data**: Uses kline endpoint with daily interval, data is reversed to chronological order
- **Volume**: Returns 24h volume from ticker endpoint

## Error Handling

All clients handle errors gracefully:
- **Network errors**: Automatically retried with exponential backoff
- **Rate limits**: Retried with backoff (treated as server errors)
- **4xx errors**: Not retried (client errors like invalid symbols)
- **Missing data**: Throws descriptive error messages

## Testing

Unit tests are provided in `__tests__/ExchangeClients.test.ts`:
- Tests for successful data fetching
- Tests for symbol normalization
- Tests for retry logic with exponential backoff
- Tests for error handling (4xx vs 5xx)

Run tests:
```bash
npm test -- ExchangeClients.test.ts
```

## Configuration

Exchange API keys can be configured in `.env`:
```env
BINANCE_API_KEY=your_binance_key
BINANCE_API_SECRET=your_binance_secret
COINBASE_API_KEY=your_coinbase_key
COINBASE_API_SECRET=your_coinbase_secret
BYBIT_API_KEY=your_bybit_key
BYBIT_API_SECRET=your_bybit_secret
```

**Note**: For public endpoints (price, historical data, volume), API keys are not required. They will be needed for authenticated endpoints in future implementations.

## Requirements

Implements requirements:
- **5.1**: Binance Exchange API integration
- **5.2**: Coinbase Exchange API integration
- **5.3**: Bybit Exchange API integration
- **5.4**: Retry logic with exponential backoff

## Future Enhancements

- Add authenticated endpoints (trading, account info)
- Add WebSocket support for real-time data
- Add more exchanges (Kraken, KuCoin, etc.)
- Add circuit breaker pattern for better fault tolerance
- Add request rate limiting to prevent hitting API limits
