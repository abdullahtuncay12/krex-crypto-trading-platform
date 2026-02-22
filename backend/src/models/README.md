# Models

This directory contains data models and repositories for the crypto trading signals platform.

## User Model (Task 2.1)

### Files

- `User.ts` - TypeScript interfaces for User model
- `UserRepository.ts` - Data access layer for User operations
- `__tests__/UserRepository.test.ts` - Unit tests for UserRepository

### Database Schema

The User model is backed by the `users` table with the following schema:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (role IN ('normal', 'premium')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Indexes

- **Unique index on email**: `idx_users_email` - Ensures email uniqueness and fast lookups
- **Index on role**: `idx_users_role` - Optimizes role-based queries for RBAC

### Features

- **Default Role Assignment**: New users are automatically assigned 'normal' role (Requirement 1.1)
- **Role Management**: Support for upgrading to 'premium' and downgrading to 'normal' (Requirements 1.2, 1.3)
- **Auto-updated Timestamps**: `updated_at` is automatically updated via database trigger
- **Email Uniqueness**: Enforced at database level with unique constraint

### Usage Example

```typescript
import { userRepository } from './models';

// Create a new user (defaults to 'normal' role)
const user = await userRepository.create({
  email: 'user@example.com',
  passwordHash: 'bcrypt_hashed_password',
  name: 'John Doe'
});

// Find user by email
const found = await userRepository.findByEmail('user@example.com');

// Upgrade to premium
await userRepository.updateRole(user.id, 'premium');

// Downgrade to normal
await userRepository.updateRole(user.id, 'normal');
```

### Running Tests

```bash
# Run all tests
npm test

# Run only User tests
npm test UserRepository

# Run with coverage
npm run test:coverage
```

### Migration

To create the users table, run:

```bash
npm run migrate
```

Or manually:

```bash
psql -U postgres -d crypto_signals -f src/db/migrations/001_create_users_table.sql
```

## Future Models

The following models will be added in subsequent tasks:

- **Subscription** (Task 2.2) - User subscription management
- **TradingSignal** (Task 2.3) - Trading signal records
- **CompletedTrade** (Task 2.4) - Historical trade performance
- **Alert** (Task 2.5) - User alerts
- **AlertPreferences** (Task 2.5) - User alert preferences
