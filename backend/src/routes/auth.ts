/**
 * Authentication Routes
 * 
 * Provides endpoints for user registration, login, and profile retrieval.
 * Implements JWT-based authentication with validation middleware.
 * 
 * Requirements: 1.1, 1.4
 */

import { Router, Request, Response } from 'express';
import { authService } from '../services/AuthService';
import { requireAuth } from '../middleware/auth';
import { validateRegister, validateLogin } from '../middleware/validation';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user account
 * 
 * Request body:
 * - email: string (required, valid email format)
 * - password: string (required, min 8 characters)
 * - name: string (required, non-empty)
 * 
 * Response:
 * - user: User object without password
 * - token: JWT token
 * 
 * Requirement 1.1: Creates account with 'normal' role by default
 */
router.post('/register', validateRegister, async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    const result = await authService.register({ email, password, name });

    res.status(201).json(result);
  } catch (error) {
    if (error instanceof Error) {
      // Handle duplicate email error
      if (error.message === 'Email already registered') {
        res.status(409).json({
          error: {
            code: 'EMAIL_ALREADY_EXISTS',
            message: 'Email already registered',
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      // Handle other errors
      res.status(500).json({
        error: {
          code: 'REGISTRATION_FAILED',
          message: 'Failed to register user',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
      },
    });
  }
});

/**
 * POST /api/auth/login
 * Login with email and password
 * 
 * Request body:
 * - email: string (required, valid email format)
 * - password: string (required)
 * 
 * Response:
 * - user: User object without password
 * - token: JWT token
 * 
 * Requirement 1.4: Authenticates users before granting access
 */
router.post('/login', validateLogin, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const result = await authService.login({ email, password });

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      // Handle invalid credentials
      if (error.message === 'Invalid email or password') {
        res.status(401).json({
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      // Handle other errors
      res.status(500).json({
        error: {
          code: 'LOGIN_FAILED',
          message: 'Failed to login',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
      },
    });
  }
});

/**
 * GET /api/auth/me
 * Get current authenticated user information
 * 
 * Headers:
 * - Authorization: Bearer <token> (required)
 * 
 * Response:
 * - user: Current user object without password
 * 
 * Requirement 1.4: Requires authentication to access user info
 */
router.get('/me', requireAuth, (req: Request, res: Response) => {
  // User is attached to request by requireAuth middleware
  res.status(200).json({
    user: req.user,
  });
});

export default router;
