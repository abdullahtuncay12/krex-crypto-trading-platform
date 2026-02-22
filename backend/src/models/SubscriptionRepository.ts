/**
 * Subscription Repository
 * 
 * Data access layer for Subscription model operations.
 * Provides CRUD operations and query methods for subscriptions table.
 * 
 * Requirements: 8.2, 8.4, 8.5
 */

import { pool } from '../config/database';
import { Subscription, CreateSubscriptionInput, UpdateSubscriptionInput } from './Subscription';

export class SubscriptionRepository {
  /**
   * Create a new subscription
   * Requirement 8.2: Premium activation on payment success
   */
  async create(input: CreateSubscriptionInput): Promise<Subscription> {
    const {
      userId,
      planId,
      status,
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd = false,
      stripeSubscriptionId
    } = input;
    
    const result = await pool.query(
      `INSERT INTO subscriptions (user_id, plan_id, status, current_period_start, current_period_end, cancel_at_period_end, stripe_subscription_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, user_id as "userId", plan_id as "planId", status, 
                 current_period_start as "currentPeriodStart", current_period_end as "currentPeriodEnd",
                 cancel_at_period_end as "cancelAtPeriodEnd", stripe_subscription_id as "stripeSubscriptionId",
                 created_at as "createdAt", updated_at as "updatedAt"`,
      [userId, planId, status, currentPeriodStart, currentPeriodEnd, cancelAtPeriodEnd, stripeSubscriptionId]
    );
    
    return result.rows[0];
  }

  /**
   * Find subscription by ID
   */
  async findById(id: string): Promise<Subscription | null> {
    const result = await pool.query(
      `SELECT id, user_id as "userId", plan_id as "planId", status,
              current_period_start as "currentPeriodStart", current_period_end as "currentPeriodEnd",
              cancel_at_period_end as "cancelAtPeriodEnd", stripe_subscription_id as "stripeSubscriptionId",
              created_at as "createdAt", updated_at as "updatedAt"
       FROM subscriptions
       WHERE id = $1`,
      [id]
    );
    
    return result.rows[0] || null;
  }

  /**
   * Find subscription by user ID
   * Returns the most recent subscription for the user
   */
  async findByUserId(userId: string): Promise<Subscription | null> {
    const result = await pool.query(
      `SELECT id, user_id as "userId", plan_id as "planId", status,
              current_period_start as "currentPeriodStart", current_period_end as "currentPeriodEnd",
              cancel_at_period_end as "cancelAtPeriodEnd", stripe_subscription_id as "stripeSubscriptionId",
              created_at as "createdAt", updated_at as "updatedAt"
       FROM subscriptions
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId]
    );
    
    return result.rows[0] || null;
  }

  /**
   * Find subscription by Stripe subscription ID
   */
  async findByStripeSubscriptionId(stripeSubscriptionId: string): Promise<Subscription | null> {
    const result = await pool.query(
      `SELECT id, user_id as "userId", plan_id as "planId", status,
              current_period_start as "currentPeriodStart", current_period_end as "currentPeriodEnd",
              cancel_at_period_end as "cancelAtPeriodEnd", stripe_subscription_id as "stripeSubscriptionId",
              created_at as "createdAt", updated_at as "updatedAt"
       FROM subscriptions
       WHERE stripe_subscription_id = $1`,
      [stripeSubscriptionId]
    );
    
    return result.rows[0] || null;
  }

  /**
   * Update subscription fields
   * Requirement 8.4: Access retention on subscription cancellation
   */
  async update(id: string, input: UpdateSubscriptionInput): Promise<Subscription | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (input.planId !== undefined) {
      fields.push(`plan_id = $${paramCount++}`);
      values.push(input.planId);
    }
    if (input.status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(input.status);
    }
    if (input.currentPeriodStart !== undefined) {
      fields.push(`current_period_start = $${paramCount++}`);
      values.push(input.currentPeriodStart);
    }
    if (input.currentPeriodEnd !== undefined) {
      fields.push(`current_period_end = $${paramCount++}`);
      values.push(input.currentPeriodEnd);
    }
    if (input.cancelAtPeriodEnd !== undefined) {
      fields.push(`cancel_at_period_end = $${paramCount++}`);
      values.push(input.cancelAtPeriodEnd);
    }
    if (input.stripeSubscriptionId !== undefined) {
      fields.push(`stripe_subscription_id = $${paramCount++}`);
      values.push(input.stripeSubscriptionId);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE subscriptions
       SET ${fields.join(', ')}
       WHERE id = $${paramCount}
       RETURNING id, user_id as "userId", plan_id as "planId", status,
                 current_period_start as "currentPeriodStart", current_period_end as "currentPeriodEnd",
                 cancel_at_period_end as "cancelAtPeriodEnd", stripe_subscription_id as "stripeSubscriptionId",
                 created_at as "createdAt", updated_at as "updatedAt"`,
      values
    );
    
    return result.rows[0] || null;
  }

  /**
   * Cancel subscription (set cancelAtPeriodEnd flag)
   * Requirement 8.4: Maintain access until period end
   */
  async cancelAtPeriodEnd(id: string): Promise<Subscription | null> {
    return this.update(id, { cancelAtPeriodEnd: true });
  }

  /**
   * Find all expired subscriptions that need status update
   * Used by scheduled job to revert user roles
   */
  async findExpiredSubscriptions(): Promise<Subscription[]> {
    const result = await pool.query(
      `SELECT id, user_id as "userId", plan_id as "planId", status,
              current_period_start as "currentPeriodStart", current_period_end as "currentPeriodEnd",
              cancel_at_period_end as "cancelAtPeriodEnd", stripe_subscription_id as "stripeSubscriptionId",
              created_at as "createdAt", updated_at as "updatedAt"
       FROM subscriptions
       WHERE status = 'active'
         AND current_period_end < CURRENT_TIMESTAMP
       ORDER BY current_period_end ASC`,
      []
    );
    
    return result.rows;
  }

  /**
   * Find subscriptions by status
   */
  async findByStatus(status: 'active' | 'cancelled' | 'expired'): Promise<Subscription[]> {
    const result = await pool.query(
      `SELECT id, user_id as "userId", plan_id as "planId", status,
              current_period_start as "currentPeriodStart", current_period_end as "currentPeriodEnd",
              cancel_at_period_end as "cancelAtPeriodEnd", stripe_subscription_id as "stripeSubscriptionId",
              created_at as "createdAt", updated_at as "updatedAt"
       FROM subscriptions
       WHERE status = $1
       ORDER BY created_at DESC`,
      [status]
    );
    
    return result.rows;
  }

  /**
   * Delete subscription by ID
   */
  async delete(id: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM subscriptions WHERE id = $1',
      [id]
    );
    
    return (result.rowCount ?? 0) > 0;
  }
}

// Export singleton instance
export const subscriptionRepository = new SubscriptionRepository();
