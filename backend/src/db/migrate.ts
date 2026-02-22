/**
 * Database Migration Runner
 * 
 * Simple migration runner for applying SQL migrations to the database.
 * Run with: npm run migrate or tsx src/db/migrate.ts
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { pool } from '../config/database';

const migrations = [
  '001_create_users_table.sql',
  '002_create_subscriptions_table.sql',
  '003_create_trading_signals_table.sql',
  '004_create_completed_trades_table.sql',
  '005_create_alerts_table.sql',
  '006_create_alert_preferences_table.sql',
  '007_create_bot_investments_table.sql',
  '008_create_bot_trades_table.sql',
  '009_create_bot_positions_table.sql',
  '010_create_investment_value_history_table.sql',
  '011_create_audit_logs_table.sql',
  '012_add_balance_to_users.sql',
];

async function runMigrations() {
  console.log('Starting database migrations...\n');

  try {
    // Create migrations tracking table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        migration VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    for (const migration of migrations) {
      // Check if migration already applied
      const result = await pool.query(
        'SELECT migration FROM schema_migrations WHERE migration = $1',
        [migration]
      );

      if (result.rows.length > 0) {
        console.log(`⊘ ${migration} already applied, skipping\n`);
        continue;
      }

      const migrationPath = join(__dirname, 'migrations', migration);
      console.log(`Running migration: ${migration}`);
      
      const sql = readFileSync(migrationPath, 'utf-8');
      await pool.query(sql);
      
      // Record migration as applied
      await pool.query(
        'INSERT INTO schema_migrations (migration) VALUES ($1)',
        [migration]
      );
      
      console.log(`✓ ${migration} completed successfully\n`);
    }

    console.log('All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}

export { runMigrations };
