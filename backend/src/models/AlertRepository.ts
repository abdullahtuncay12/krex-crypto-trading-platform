/**
 * Alert Repository
 * 
 * Data access layer for Alert model operations.
 * Provides CRUD operations and query methods for alerts table.
 * 
 * Requirements: 10.1, 10.4
 */

import { pool } from '../config/database';
import { Alert, CreateAlertInput, UpdateAlertInput } from './Alert';

export class AlertRepository {
  /**
   * Create a new alert
   * Requirement 10.1: Alert generation on trading opportunities
   * Requirement 10.4: Alert content completeness
   */
  async create(input: CreateAlertInput): Promise<Alert> {
    const { userId, cryptocurrency, alertType, message, read = false } = input;
    
    const result = await pool.query(
      `INSERT INTO alerts (user_id, cryptocurrency, alert_type, message, read)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, user_id as "userId", cryptocurrency, alert_type as "alertType", message, read, created_at as "createdAt"`,
      [userId, cryptocurrency, alertType, message, read]
    );
    
    return result.rows[0];
  }

  /**
   * Find alert by ID
   */
  async findById(id: string): Promise<Alert | null> {
    const result = await pool.query(
      `SELECT id, user_id as "userId", cryptocurrency, alert_type as "alertType", message, read, created_at as "createdAt"
       FROM alerts
       WHERE id = $1`,
      [id]
    );
    
    return result.rows[0] || null;
  }

  /**
   * Find all alerts for a user
   */
  async findByUserId(userId: string): Promise<Alert[]> {
    const result = await pool.query(
      `SELECT id, user_id as "userId", cryptocurrency, alert_type as "alertType", message, read, created_at as "createdAt"
       FROM alerts
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );
    
    return result.rows;
  }

  /**
   * Find unread alerts for a user
   */
  async findUnreadByUserId(userId: string): Promise<Alert[]> {
    const result = await pool.query(
      `SELECT id, user_id as "userId", cryptocurrency, alert_type as "alertType", message, read, created_at as "createdAt"
       FROM alerts
       WHERE user_id = $1 AND read = false
       ORDER BY created_at DESC`,
      [userId]
    );
    
    return result.rows;
  }

  /**
   * Update alert (typically to mark as read)
   */
  async update(id: string, input: UpdateAlertInput): Promise<Alert | null> {
    const { read } = input;
    
    if (read === undefined) {
      return this.findById(id);
    }
    
    const result = await pool.query(
      `UPDATE alerts
       SET read = $1
       WHERE id = $2
       RETURNING id, user_id as "userId", cryptocurrency, alert_type as "alertType", message, read, created_at as "createdAt"`,
      [read, id]
    );
    
    return result.rows[0] || null;
  }

  /**
   * Mark alert as read
   */
  async markAsRead(id: string): Promise<Alert | null> {
    return this.update(id, { read: true });
  }

  /**
   * Mark all alerts as read for a user
   */
  async markAllAsRead(userId: string): Promise<number> {
    const result = await pool.query(
      `UPDATE alerts
       SET read = true
       WHERE user_id = $1 AND read = false`,
      [userId]
    );
    
    return result.rowCount ?? 0;
  }

  /**
   * Delete alert by ID
   */
  async delete(id: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM alerts WHERE id = $1',
      [id]
    );
    
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Delete all alerts for a user
   */
  async deleteByUserId(userId: string): Promise<number> {
    const result = await pool.query(
      'DELETE FROM alerts WHERE user_id = $1',
      [userId]
    );
    
    return result.rowCount ?? 0;
  }

  /**
   * Find alerts by cryptocurrency
   * Useful for testing and analytics
   */
  async findByCryptocurrency(cryptocurrency: string): Promise<Alert[]> {
    const result = await pool.query(
      `SELECT id, user_id as "userId", cryptocurrency, alert_type as "alertType", message, read, created_at as "createdAt"
       FROM alerts
       WHERE cryptocurrency = $1
       ORDER BY created_at DESC`,
      [cryptocurrency]
    );
    
    return result.rows;
  }

  /**
   * Count unread alerts for a user
   */
  async countUnread(userId: string): Promise<number> {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM alerts WHERE user_id = $1 AND read = false',
      [userId]
    );
    
    return parseInt(result.rows[0].count, 10);
  }
}

// Export singleton instance
export const alertRepository = new AlertRepository();
