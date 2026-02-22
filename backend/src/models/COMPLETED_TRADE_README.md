# CompletedTrade Model

## Overview

The CompletedTrade model represents completed premium trading signals with entry/exit prices and profit calculations. This model is used to track the performance of premium signals and display successful trades to users.

**Requirements:** 6.1, 6.2, 6.3, 6.4

## Schema

```typescript
interface CompletedTrade {
  id: string;                    // UUID primary key
  signalId: string;              // Reference to trading_signals.id
  cryptocurrency: string;        // Crypto symbol (e.g., "BTC", "ETH")
  entryPrice: number;            // Price at trade entry
  exitPrice: number;             // Price at trade exit
  profitPercent: number;         // Profit percentage (can be negative)
  entryDate: Date;               // When the trade was entered
  exitDate: Date;                // When the trade was exited
  signalType: 'premium';         // Always 'premium' (only premium signals tracked)
}
```

## Database Table

**Table:** `completed_trades`

**Indexes:**
- `idx_completed_trades_cryptocurrency` - Fast lookups by crypto symbol
- `idx_completed_trades_exit_date` - Time-based queries and sorting
- `idx_completed_trades_profit_percent` - Filtering profitable trades
- `idx_completed_trades_signal_id` - Referencing trading signals
- `idx_completed_trades_crypto_exit` - Composite index for common queries

**Foreign Keys:**
- `signal_id` references `trading_signals(id)` with CASCADE delete

## Repository Methods

### Create Operations

#### `create(input: CreateCompletedTradeInput): Promise<CompletedTrade>`
Creates a new completed trade record.

```typescript
const trade = await completedTradeRepository.create({
  signalId: 'uuid-of-signal',
  cryptocurrency: 'BTC',
  entryPrice: 50000,
  exitPrice: 55000,
  profitPercent: 10.0,
  entryDate: new Date('2024-01-01'),
  exitDate: new Date('2024-01-05')
});
```

### Read Operations

#### `findById(id: string): Promise<CompletedTrade | null>`
Finds a completed trade by its ID.

```typescript
const trade = await completedTradeRepository.findById('trade-uuid');
```

#### `findByCryptocurrency(cryptocurrency: string, limit?: number): Promise<CompletedTrade[]>`
Finds all completed trades for a specific cryptocurrency, sorted by exit date descending.

```typescript
// Get all BTC trades
const btcTrades = await completedTradeRepository.findByCryptocurrency('BTC');

// Get last 10 BTC trades
const recentBtcTrades = await completedTradeRepository.findByCryptocurrency('BTC', 10);
```

#### `findRecent(limit: number = 10): Promise<CompletedTrade[]>`
Finds the most recent completed trades across all cryptocurrencies.

**Requirement 6.1:** Display successful premium trades at bottom of page

```typescript
// Get last 10 completed trades
const recentTrades = await completedTradeRepository.findRecent(10);
```

#### `findProfitable(limit?: number): Promise<CompletedTrade[]>`
Finds only profitable trades (profit_percent > 0).

**Requirement 6.2:** Show profitable trades in green color

```typescript
// Get all profitable trades
const profitableTrades = await completedTradeRepository.findProfitable();

// Get last 20 profitable trades
const recentProfits = await completedTradeRepository.findProfitable(20);
```

#### `findBySignalId(signalId: string): Promise<CompletedTrade | null>`
Finds a completed trade by its associated signal ID.

**Requirement 6.4:** Reference valid trading signal ID

```typescript
const trade = await completedTradeRepository.findBySignalId('signal-uuid');
```

#### `getPerformanceStats(cryptocurrency: string): Promise<PerformanceStats>`
Calculates performance statistics for a cryptocurrency.

```typescript
const stats = await completedTradeRepository.getPerformanceStats('BTC');
// Returns:
// {
//   totalTrades: 50,
//   profitableTrades: 35,
//   averageProfit: 5.2,
//   totalProfit: 260.0
// }
```

### Update Operations

#### `update(id: string, input: UpdateCompletedTradeInput): Promise<CompletedTrade | null>`
Updates specific fields of a completed trade.

```typescript
const updated = await completedTradeRepository.update('trade-uuid', {
  exitPrice: 56000,
  profitPercent: 12.0
});
```

### Delete Operations

#### `delete(id: string): Promise<boolean>`
Deletes a completed trade by ID. Returns true if deleted, false if not found.

```typescript
const deleted = await completedTradeRepository.delete('trade-uuid');
```

#### `deleteOlderThan(days: number): Promise<number>`
Deletes completed trades older than the specified number of days. Returns count of deleted records.

```typescript
// Delete trades older than 90 days
const deletedCount = await completedTradeRepository.deleteOlderThan(90);
```

### Analytics Operations

#### `countByCryptocurrency(cryptocurrency: string): Promise<number>`
Counts the number of completed trades for a cryptocurrency.

```typescript
const btcTradeCount = await completedTradeRepository.countByCryptocurrency('BTC');
```

## Usage Examples

### Display Recent Successful Trades (Requirement 6.1)

```typescript
// Get recent profitable trades for homepage display
const successfulTrades = await completedTradeRepository.findProfitable(10);

// Render in UI with green color for profits (Requirement 6.2)
successfulTrades.forEach(trade => {
  console.log(`${trade.cryptocurrency}: ${trade.profitPercent}% profit`);
  // Style with green color in UI
});
```

### Track Signal Performance (Requirement 6.4)

```typescript
// Create a completed trade from a signal
const signal = await tradingSignalRepository.findById('signal-uuid');

const completedTrade = await completedTradeRepository.create({
  signalId: signal.id,
  cryptocurrency: signal.cryptocurrency,
  entryPrice: signal.entryPrice,
  exitPrice: 55000, // Actual exit price
  profitPercent: ((55000 - signal.entryPrice) / signal.entryPrice) * 100,
  entryDate: signal.createdAt,
  exitDate: new Date()
});
```

### Performance Analytics

```typescript
// Get performance stats for a cryptocurrency
const btcStats = await completedTradeRepository.getPerformanceStats('BTC');

console.log(`BTC Performance:
  Total Trades: ${btcStats.totalTrades}
  Profitable: ${btcStats.profitableTrades}
  Win Rate: ${(btcStats.profitableTrades / btcStats.totalTrades * 100).toFixed(2)}%
  Average Profit: ${btcStats.averageProfit.toFixed(2)}%
  Total Profit: ${btcStats.totalProfit.toFixed(2)}%
`);
```

## Data Integrity

### Foreign Key Constraint
The `signal_id` field references `trading_signals.id` with CASCADE delete. This ensures:
- Every completed trade references a valid trading signal (Requirement 6.4)
- When a signal is deleted, its associated completed trades are also deleted
- Data integrity is maintained at the database level

### Signal Type Constraint
The `signal_type` field is constrained to only accept 'premium' values, ensuring only premium signal results are tracked for public display.

## Testing

Unit tests are located in `__tests__/CompletedTradeRepository.test.ts` and cover:
- Creating completed trades with signal references (Requirement 6.4)
- Finding profitable trades (Requirement 6.2)
- Displaying recent trades (Requirement 6.1)
- Including profit percentages (Requirement 6.3)
- Performance statistics calculations
- All CRUD operations
- Edge cases (negative profits, empty results)

Run tests with:
```bash
npm test -- CompletedTradeRepository.test.ts
```

## Migration

The database migration is located at:
- **Up:** `backend/src/db/migrations/004_create_completed_trades_table.sql`
- **Down:** `backend/src/db/migrations/004_create_completed_trades_table_down.sql`

Run migration with:
```bash
npm run migrate
```
