# TradingSignal Model

## Overview

The TradingSignal model represents trading signals (buy/sell/hold recommendations) for cryptocurrencies. It supports both basic signals for normal users and premium signals with advanced risk management features.

**Task:** 2.3 Create TradingSignal model  
**Requirements:** 3.1, 4.1, 4.2, 4.3

## Schema

### TradingSignal Interface

```typescript
interface TradingSignal {
  id: string;                              // UUID primary key
  cryptocurrency: string;                  // Crypto symbol (e.g., 'BTC', 'ETH')
  recommendation: 'buy' | 'sell' | 'hold'; // Trading recommendation
  confidence: number;                      // Confidence level (0-100)
  entryPrice: number;                      // Recommended entry price
  stopLoss: number | null;                 // Stop-loss price (premium only)
  limitOrder: number | null;               // Limit order price (premium only)
  signalType: 'basic' | 'premium';         // Signal type
  createdAt: Date;                         // Timestamp when signal was generated
}
```

## Database Table

The `trading_signals` table is created by migration `003_create_trading_signals_table.sql`.

### Columns

- `id` - UUID primary key (auto-generated)
- `cryptocurrency` - VARCHAR(20), crypto symbol
- `recommendation` - VARCHAR(10), CHECK constraint for 'buy', 'sell', or 'hold'
- `confidence` - NUMERIC(5,2), range 0-100
- `entry_price` - NUMERIC(20,8), supports up to 8 decimal places for precision
- `stop_loss` - NUMERIC(20,8), nullable (premium signals only)
- `limit_order` - NUMERIC(20,8), nullable (premium signals only)
- `signal_type` - VARCHAR(10), CHECK constraint for 'basic' or 'premium'
- `created_at` - TIMESTAMP WITH TIME ZONE (auto-generated)

### Indexes

1. `idx_trading_signals_cryptocurrency` - Fast lookups by crypto symbol
2. `idx_trading_signals_created_at` - Time-based queries (descending order)
3. `idx_trading_signals_signal_type` - Filter by basic vs premium
4. `idx_trading_signals_crypto_created` - Composite index for common query pattern

## Repository Methods

The `TradingSignalRepository` provides the following methods:

### Create
- `create(input: CreateTradingSignalInput): Promise<TradingSignal>`
  - Creates a new trading signal
  - Automatically handles null values for stopLoss and limitOrder

### Read
- `findById(id: string): Promise<TradingSignal | null>`
  - Find signal by ID
  
- `findLatestByCryptocurrency(cryptocurrency: string, signalType?: 'basic' | 'premium'): Promise<TradingSignal | null>`
  - Get the most recent signal for a cryptocurrency
  - Optionally filter by signal type
  
- `findByCryptocurrency(cryptocurrency: string, options?: { signalType?: 'basic' | 'premium'; limit?: number }): Promise<TradingSignal[]>`
  - Get all signals for a cryptocurrency
  - Supports filtering by type and limiting results
  
- `findBySignalType(signalType: 'basic' | 'premium', limit?: number): Promise<TradingSignal[]>`
  - Get signals by type across all cryptocurrencies
  
- `findRecent(limit?: number, signalType?: 'basic' | 'premium'): Promise<TradingSignal[]>`
  - Get recent signals across all cryptocurrencies
  - Default limit: 10

### Update
- `update(id: string, input: UpdateTradingSignalInput): Promise<TradingSignal | null>`
  - Update signal fields
  - Only updates provided fields

### Delete
- `delete(id: string): Promise<boolean>`
  - Delete a signal by ID
  - Returns true if deleted, false if not found
  
- `deleteOlderThan(days: number): Promise<number>`
  - Delete signals older than specified days
  - Returns count of deleted signals

### Utility
- `countByCryptocurrency(cryptocurrency: string): Promise<number>`
  - Count signals for a cryptocurrency

## Usage Examples

### Creating a Basic Signal

```typescript
import { tradingSignalRepository } from './models';

const basicSignal = await tradingSignalRepository.create({
  cryptocurrency: 'BTC',
  recommendation: 'buy',
  confidence: 75.5,
  entryPrice: 50000.12345678,
  signalType: 'basic',
});
```

### Creating a Premium Signal

```typescript
const premiumSignal = await tradingSignalRepository.create({
  cryptocurrency: 'ETH',
  recommendation: 'sell',
  confidence: 82.3,
  entryPrice: 3000.5,
  stopLoss: 3100.0,      // Risk management
  limitOrder: 2900.0,    // Target price
  signalType: 'premium',
});
```

### Getting Latest Signal

```typescript
// Get latest signal for BTC (any type)
const latestBTC = await tradingSignalRepository.findLatestByCryptocurrency('BTC');

// Get latest premium signal for ETH
const latestPremiumETH = await tradingSignalRepository.findLatestByCryptocurrency('ETH', 'premium');
```

### Querying Signals

```typescript
// Get last 5 signals for BTC
const btcSignals = await tradingSignalRepository.findByCryptocurrency('BTC', { limit: 5 });

// Get all premium signals for ETH
const ethPremiumSignals = await tradingSignalRepository.findByCryptocurrency('ETH', { 
  signalType: 'premium' 
});

// Get 10 most recent premium signals across all cryptos
const recentPremium = await tradingSignalRepository.findRecent(10, 'premium');
```

## Running the Migration

To create the `trading_signals` table in your database:

```bash
# From the backend directory
npm run migrate
```

Or manually with psql:

```bash
psql -U postgres -d crypto_signals -f src/db/migrations/003_create_trading_signals_table.sql
```

## Rollback

To rollback the migration:

```bash
psql -U postgres -d crypto_signals -f src/db/migrations/003_create_trading_signals_table_down.sql
```

## Testing

Unit tests are provided in `__tests__/TradingSignalRepository.test.ts`.

Run tests:

```bash
npm test TradingSignalRepository
```

The tests cover:
- Creating basic and premium signals
- Finding signals by ID, cryptocurrency, and type
- Updating signal fields
- Deleting signals
- Edge cases (non-existent IDs, empty results)

## Requirements Mapping

- **Requirement 3.1**: Basic trading signals for normal users
  - Supports `signalType: 'basic'` with recommendation, confidence, and entry price
  
- **Requirement 4.1**: Advanced trading signals for premium users
  - Supports `signalType: 'premium'` with all basic fields plus advanced features
  
- **Requirement 4.2**: Stop-loss recommendations
  - `stopLoss` field for risk management (premium signals)
  
- **Requirement 4.3**: Limit order suggestions
  - `limitOrder` field for target prices (premium signals)

## Notes

- The `confidence` field uses NUMERIC(5,2) to support values like 75.50
- The `entry_price`, `stop_loss`, and `limit_order` fields use NUMERIC(20,8) for high precision
- Signals are immutable by design (no updated_at field) - create new signals instead of updating
- The composite index on (cryptocurrency, created_at) optimizes the common query pattern
- Consider implementing a cleanup job to delete old signals (use `deleteOlderThan` method)
