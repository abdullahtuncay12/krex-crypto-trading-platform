/**
 * Authentication Middleware
 * 
 * Provides JWT token verification middleware for protected routes.
 * Extracts and validates JWT tokens from Authorization header.
 * 
 * Requirements: 1.4
 */

import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/AuthService';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: 'normal' | 'premium';
        createdAt: Date;
        updatedAt: Date;
      };
    }
  }
}

/**
 * Middleware to require authentication
 * Requirement 1.4: Authenticate users before granting access to features
 */
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          message: 'Authentication required',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const payload = authService.verifyToken(token);

    // Get user from database
    const user = await authService.getUserById(payload.userId);
    if (!user) {
      res.status(401).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid token',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    // Attach user to request
    req.user = user;

    next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('expired')) {
        res.status(401).json({
          error: {
            code: 'TOKEN_EXPIRED',
            message: 'Token expired, please login again',
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }
    }

    res.status(401).json({
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid token',
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Middleware factory to require specific role
 * Requirements 1.5, 3.4: Enforce role-based permissions on feature requests
 * 
 * @param role - The required role ('normal' or 'premium')
 * @returns Middleware function that checks user role
 */
export const requireRole = (role: 'normal' | 'premium') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // User must be authenticated first (requireAuth should be called before this)
    if (!req.user) {
      res.status(401).json({
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          message: 'Authentication required',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    // Check if user has required role
    // For 'premium' requirement, user must have 'premium' role
    // For 'normal' requirement, both 'normal' and 'premium' users are allowed
    if (role === 'premium' && req.user.role !== 'premium') {
      res.status(403).json({
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'Premium membership required',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    next();
  };
};
