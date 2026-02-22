/**
 * AlertPreferences Repository
 * 
 * Data access layer for AlertPreferences model operations.
 * Provides CRUD operations and query methods for alert_preferences table.
 * 
 * Requirements: 10.3
 */

import { pool } from '../config/database';
import { AlertPreferences, CreateAlertPreferencesInput, UpdateAlertPreferencesInput } from './AlertPreferences';

export class AlertPreferencesRepository {
  /**
   * Create alert preferences for a user
   * Requirement 10.3: Alert preferences persistence
   */
  async create(input: CreateAlertPreferencesInput): Promise<AlertPreferences> {
    const { userId, priceMovementThreshold, enablePumpAlerts, cryptocurrencies } = input;
    
    const result = await pool.query(
      `INSERT INTO alert_preferences (user_id, price_movement_threshold, enable_pump_alerts, cryptocurrencies)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id as "userId", price_movement_threshold as "priceMovementThreshold", 
                 enable_pump_alerts as "enablePumpAlerts", cryptocurrencies, updated_at as "updatedAt"`,
      [userId, priceMovementThreshold, enablePumpAlerts, cryptocurrencies]
    );
    
    return result.rows[0];
  }

  /**
   * Find alert preferences by ID
   */
  async findById(id: string): Promise<AlertPreferences | null> {
    const result = await pool.query(
      `SELECT id, user_id as "userId", price_movement_threshold as "priceMovementThreshold", 
              enable_pump_alerts as "enablePumpAlerts", cryptocurrencies, updated_at as "updatedAt"
       FROM alert_preferences
       WHERE id = $1`,
      [id]
    );
    
    return result.rows[0] || null;
  }

  /**
   * Find alert preferences by user ID
   * Each user has only one preferences record
   */
  async findByUserId(userId: string): Promise<AlertPreferences | null> {
    const result = await pool.query(
      `SELECT id, user_id as "userId", price_movement_threshold as "priceMovementThreshold", 
              enable_pump_alerts as "enablePumpAlerts", cryptocurrencies, updated_at as "updatedAt"
       FROM alert_preferences
       WHERE user_id = $1`,
      [userId]
    );
    
    return result.rows[0] || null;
  }

  /**
   * Update alert preferences
   * Requirement 10.3: Alert preferences persistence
   */
  async update(id: string, input: UpdateAlertPreferencesInput): Promise<AlertPreferences | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (input.priceMovementThreshold !== undefined) {
      fields.push(`price_movement_threshold = $${paramCount++}`);
      values.push(input.priceMovementThreshold);
    }
    if (input.enablePumpAlerts !== undefined) {
      fields.push(`enable_pump_alerts = $${paramCount++}`);
      values.push(input.enablePumpAlerts);
    }
    if (input.cryptocurrencies !== undefined) {
      fields.push(`cryptocurrencies = $${paramCount++}`);
      values.push(input.cryptocurrencies);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE alert_preferences
       SET ${fields.join(', ')}
       WHERE id = $${paramCount}
       RETURNING id, user_id as "userId", price_movement_threshold as "priceMovementThreshold", 
                 enable_pump_alerts as "enablePumpAlerts", cryptocurrencies, updated_at as "updatedAt"`,
      values
    );
    
    return result.rows[0] || null;
  }

  /**
   * Update alert preferences by user ID
   * Convenience method since each user has one preferences record
   */
  async updateByUserId(userId: string, input: UpdateAlertPreferencesInput): Promise<AlertPreferences | null> {
    const preferences = await this.findByUserId(userId);
    if (!preferences) {
      return null;
    }
    return this.update(preferences.id, input);
  }

  /**
   * Create or update alert preferences (upsert)
   * If preferences exist for user, update them; otherwise create new
   */
  async upsert(input: CreateAlertPreferencesInput): Promise<AlertPreferences> {
    const existing = await this.findByUserId(input.userId);
    
    if (existing) {
      const updated = await this.update(existing.id, {
        priceMovementThreshold: input.priceMovementThreshold,
        enablePumpAlerts: input.enablePumpAlerts,
        cryptocurrencies: input.cryptocurrencies
      });
      return updated!;
    }
    
    return this.create(input);
  }

  /**
   * Delete alert preferences by ID
   */
  async delete(id: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM alert_preferences WHERE id = $1',
      [id]
    );
    
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Delete alert preferences by user ID
   */
  async deleteByUserId(userId: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM alert_preferences WHERE user_id = $1',
      [userId]
    );
    
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Find all users monitoring a specific cryptocurrency
   * Useful for alert generation
   */
  async findUsersMonitoringCrypto(cryptocurrency: string): Promise<string[]> {
    const result = await pool.query(
      `SELECT user_id as "userId"
       FROM alert_preferences
       WHERE $1 = ANY(cryptocurrencies)`,
      [cryptocurrency]
    );
    
    return result.rows.map((row: any) => row.userId);
  }

  /**
   * Find all users with pump alerts enabled
   * Useful for pump detection notifications
   */
  async findUsersWithPumpAlertsEnabled(): Promise<string[]> {
    const result = await pool.query(
      `SELECT user_id as "userId"
       FROM alert_preferences
       WHERE enable_pump_alerts = true`
    );
    
    return result.rows.map((row: any) => row.userId);
  }
}

// Export singleton instance
export const alertPreferencesRepository = new AlertPreferencesRepository();
