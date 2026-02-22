/**
 * User Model
 * 
 * Represents a user in the cryptocurrency trading signals platform.
 * Supports role-based access control with 'normal' and 'premium' roles.
 * 
 * Requirements: 1.1, 1.2, 1.3
 */

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'normal' | 'premium';
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  name: string;
  role?: 'normal' | 'premium';
  balance?: number;
}

export interface UpdateUserInput {
  email?: string;
  passwordHash?: string;
  name?: string;
  role?: 'normal' | 'premium';
  balance?: number;
}
