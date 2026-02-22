/**
 * User Repository
 * 
 * Data access layer for User model operations.
 * Provides CRUD operations and query methods for users table.
 * 
 * Requirements: 1.1, 1.2, 1.3
 */

import { pool } from '../config/database';
import { User, CreateUserInput, UpdateUserInput } from './User';

export class UserRepository {
  /**
   * Create a new user with default 'normal' role
   * Requirement 1.1: Default role assignment on registration
   */
  async create(input: CreateUserInput): Promise<User> {
    const { email, passwordHash, name, role = 'normal', balance = 0 } = input;
    
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, role, balance)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, password_hash as "passwordHash", name, role, balance, created_at as "createdAt", updated_at as "updatedAt"`,
      [email, passwordHash, name, role, balance]
    );
    
    return result.rows[0];
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    const result = await pool.query(
      `SELECT id, email, password_hash as "passwordHash", name, role, balance, created_at as "createdAt", updated_at as "updatedAt"
       FROM users
       WHERE id = $1`,
      [id]
    );
    
    return result.rows[0] || null;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query(
      `SELECT id, email, password_hash as "passwordHash", name, role, balance, created_at as "createdAt", updated_at as "updatedAt"
       FROM users
       WHERE email = $1`,
      [email]
    );
    
    return result.rows[0] || null;
  }

  /**
   * Update user fields
   * Requirement 1.2: Role upgrade on premium subscription
   * Requirement 1.3: Role downgrade on subscription expiration
   */
  async update(id: string, input: UpdateUserInput): Promise<User | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (input.email !== undefined) {
      fields.push(`email = $${paramCount++}`);
      values.push(input.email);
    }
    if (input.passwordHash !== undefined) {
      fields.push(`password_hash = $${paramCount++}`);
      values.push(input.passwordHash);
    }
    if (input.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(input.name);
    }
    if (input.role !== undefined) {
      fields.push(`role = $${paramCount++}`);
      values.push(input.role);
    }
    if (input.balance !== undefined) {
      fields.push(`balance = $${paramCount++}`);
      values.push(input.balance);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE users
       SET ${fields.join(', ')}
       WHERE id = $${paramCount}
       RETURNING id, email, password_hash as "passwordHash", name, role, balance, created_at as "createdAt", updated_at as "updatedAt"`,
      values
    );
    
    return result.rows[0] || null;
  }

  /**
   * Update user role
   * Convenience method for role changes during subscription lifecycle
   */
  async updateRole(id: string, role: 'normal' | 'premium'): Promise<User | null> {
    return this.update(id, { role });
  }

  /**
   * Update user balance
   * Convenience method for balance changes
   */
  async updateBalance(id: string, balance: number): Promise<User | null> {
    return this.update(id, { balance });
  }

  /**
   * Delete user by ID
   */
  async delete(id: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1',
      [id]
    );
    
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Find all users with a specific role
   * Useful for admin operations and testing
   */
  async findByRole(role: 'normal' | 'premium'): Promise<User[]> {
    const result = await pool.query(
      `SELECT id, email, password_hash as "passwordHash", name, role, balance, created_at as "createdAt", updated_at as "updatedAt"
       FROM users
       WHERE role = $1
       ORDER BY created_at DESC`,
      [role]
    );
    
    return result.rows;
  }

  /**
   * Check if email already exists
   * Useful for validation before registration
   */
  async emailExists(email: string): Promise<boolean> {
    const result = await pool.query(
      'SELECT 1 FROM users WHERE email = $1',
      [email]
    );
    
    return result.rows.length > 0;
  }
}

// Export singleton instance
export const userRepository = new UserRepository();
