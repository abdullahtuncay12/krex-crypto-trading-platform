/**
 * Authentication Service
 * 
 * Handles user registration, login, and JWT token management.
 * Implements bcrypt password hashing and JWT token generation.
 * 
 * Requirements: 1.1, 1.4
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { userRepository } from '../models/UserRepository';
import { User } from '../models/User';

const SALT_ROUNDS = 10;

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'passwordHash'>;
  token: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'normal' | 'premium';
}

export class AuthService {
  /**
   * Register a new user with bcrypt password hashing
   * Requirement 1.1: Default new users to 'normal' role
   */
  async register(input: RegisterInput): Promise<AuthResponse> {
    const { email, password, name } = input;

    // Check if email already exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user with default 'normal' role
    const user = await userRepository.create({
      email,
      passwordHash,
      name,
      role: 'normal', // Requirement 1.1: Default role
    });

    // Generate JWT token
    const token = this.generateToken(user);

    // Return user without password hash
    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  /**
   * Login user with email and password
   * Requirement 1.4: Authenticate users before granting access
   */
  async login(input: LoginInput): Promise<AuthResponse> {
    const { email, password } = input;

    // Find user by email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password with bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = this.generateToken(user);

    // Return user without password hash
    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  /**
   * Generate JWT token for authenticated user
   */
  generateToken(user: User): string {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
  }

  /**
   * Verify JWT token and return payload
   * Requirement 1.4: Token verification for authentication
   */
  verifyToken(token: string): TokenPayload {
    try {
      const payload = jwt.verify(token, config.jwt.secret) as TokenPayload;
      return payload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expired, please login again');
      }
      throw new Error('Invalid token');
    }
  }

  /**
   * Get user by ID (for token verification middleware)
   */
  async getUserById(userId: string): Promise<Omit<User, 'passwordHash'> | null> {
    const user = await userRepository.findById(userId);
    if (!user) {
      return null;
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

// Export singleton instance
export const authService = new AuthService();
