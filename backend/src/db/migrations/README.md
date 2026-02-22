# Database Migrations

This directory contains database migration files for the crypto trading signals platform.

## Migration Files

- ✅ `001_create_users_table.sql` - Task 2.1: User model migration
- ✅ `002_create_subscriptions_table.sql` - Task 2.2: Subscription model migration
- ✅ `003_create_trading_signals_table.sql` - Task 2.3: TradingSignal model migration
- ✅ `004_create_completed_trades_table.sql` - Task 2.4: CompletedTrade model migration
- ✅ `005_create_alerts_table.sql` - Task 2.5: Alert model migration
- ✅ `006_create_alert_preferences_table.sql` - Task 2.5: AlertPreferences model migration

## Running Migrations

Migrations can be run manually using psql. Make sure your PostgreSQL database is running first.

### Apply Migration

```bash
# From the backend directory
psql -U postgres -d crypto_signals -f src/db/migrations/001_create_users_table.sql
```

### Rollback Migration

```bash
# From the backend directory
psql -U postgres -d crypto_signals -f src/db/migrations/001_create_users_table_down.sql
```

## Migration Details

### 001_create_users_table.sql

Creates the `users` table with the following schema:
- `id` (UUID, primary key)
- `email` (VARCHAR, unique)
- `password_hash` (VARCHAR)
- `name` (VARCHAR)
- `role` (VARCHAR, default 'normal', CHECK constraint for 'normal' or 'premium')
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP, auto-updated via trigger)

Indexes:
- Unique index on `email` for fast lookups and uniqueness
- Index on `role` for role-based queries

Triggers:
- Auto-update `updated_at` timestamp on row updates


### 002_create_subscriptions_table.sql

Creates the `subscriptions` table with the following schema:
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key to users)
- `plan_id` (VARCHAR)
- `status` (VARCHAR, CHECK constraint for 'active', 'cancelled', or 'expired')
- `current_period_start` (TIMESTAMP)
- `current_period_end` (TIMESTAMP)
- `cancel_at_period_end` (BOOLEAN, default false)
- `stripe_subscription_id` (VARCHAR, unique)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP, auto-updated via trigger)

Indexes:
- Index on `user_id` for fast user subscription lookups
- Index on `status` for filtering subscriptions by status
- Index on `current_period_end` for finding expired subscriptions
- Unique index on `stripe_subscription_id` for Stripe webhook lookups

### 003_create_trading_signals_table.sql

Creates the `trading_signals` table with the following schema:
- `id` (UUID, primary key)
- `cryptocurrency` (VARCHAR, e.g., 'BTC', 'ETH')
- `recommendation` (VARCHAR, CHECK constraint for 'buy', 'sell', or 'hold')
- `confidence` (NUMERIC, 0-100)
- `entry_price` (NUMERIC, up to 20 digits with 8 decimal places)
- `stop_loss` (NUMERIC, nullable, for premium signals)
- `limit_order` (NUMERIC, nullable, for premium signals)
- `signal_type` (VARCHAR, CHECK constraint for 'basic' or 'premium')
- `created_at` (TIMESTAMP)

Indexes:
- Index on `cryptocurrency` for fast lookups by crypto symbol
- Index on `created_at` (descending) for time-based queries
- Index on `signal_type` for filtering basic vs premium signals
- Composite index on `cryptocurrency` + `created_at` for common query patterns


### 004_create_completed_trades_table.sql

Creates the `completed_trades` table with the following schema:
- `id` (UUID, primary key)
- `signal_id` (UUID, foreign key to trading_signals with CASCADE delete)
- `cryptocurrency` (VARCHAR, e.g., 'BTC', 'ETH')
- `entry_price` (NUMERIC, up to 20 digits with 8 decimal places)
- `exit_price` (NUMERIC, up to 20 digits with 8 decimal places)
- `profit_percent` (NUMERIC, can be negative for losses)
- `entry_date` (TIMESTAMP)
- `exit_date` (TIMESTAMP)
- `signal_type` (VARCHAR, always 'premium', CHECK constraint)

Indexes:
- Index on `cryptocurrency` for fast lookups by crypto symbol
- Index on `exit_date` (descending) for time-based queries and sorting
- Index on `profit_percent` for filtering profitable trades
- Index on `signal_id` for referencing trading signals
- Composite index on `cryptocurrency` + `exit_date` for common query patterns

Foreign Keys:
- `signal_id` references `trading_signals(id)` with CASCADE delete to maintain data integrity


### 005_create_alerts_table.sql

Creates the `alerts` table with the following schema:
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key to users with CASCADE delete)
- `cryptocurrency` (VARCHAR, e.g., 'BTC', 'ETH')
- `alert_type` (VARCHAR, CHECK constraint for 'price_movement', 'pump_detected', or 'trading_opportunity')
- `message` (TEXT, alert message describing the reason)
- `read` (BOOLEAN, default false)
- `created_at` (TIMESTAMP)

Indexes:
- Index on `user_id` for fast user alert lookups
- Index on `read` for filtering unread alerts
- Index on `created_at` (descending) for chronological ordering
- Composite index on `user_id` + `read` for efficient unread alert queries

Foreign Keys:
- `user_id` references `users(id)` with CASCADE delete

### 006_create_alert_preferences_table.sql

Creates the `alert_preferences` table with the following schema:
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key to users with CASCADE delete, unique)
- `price_movement_threshold` (DECIMAL, default 5.0, percentage threshold)
- `enable_pump_alerts` (BOOLEAN, default true)
- `cryptocurrencies` (TEXT[], array of cryptocurrency symbols to monitor)
- `updated_at` (TIMESTAMP, auto-updated via trigger)

Indexes:
- Unique index on `user_id` (one preference record per user)

Triggers:
- Auto-update `updated_at` timestamp on row updates

Foreign Keys:
- `user_id` references `users(id)` with CASCADE delete
