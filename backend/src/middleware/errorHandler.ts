/**
 * Global Error Handler Middleware
 * 
 * Catches all errors and returns consistent error format.
 * Logs errors with request context for debugging.
 * Returns appropriate HTTP status codes.
 * Hides sensitive error details in production.
 * 
 * Requirements: All (error handling)
 */

import { Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';

/**
 * Standard error response format
 */
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    requestId: string;
  };
}

/**
 * Custom application error class
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handler middleware
 * Must be registered after all routes
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Generate request ID for tracking
  const requestId = req.headers['x-request-id'] as string || 
                    `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Log error with request context
  const logContext = {
    requestId,
    method: req.method,
    path: req.path,
    userId: req.user?.id,
    timestamp: new Date().toISOString(),
    error: {
      name: err.name,
      message: err.message,
      code: err.code,
      statusCode: err.statusCode,
    },
  };

  // Log full stack trace in development, minimal info in production
  if (process.env.NODE_ENV === 'production') {
    console.error('Error:', JSON.stringify(logContext));
  } else {
    console.error('Error:', logContext);
    console.error('Stack:', err.stack);
  }

  // Handle custom AppError
  if (err instanceof AppError) {
    const response: ErrorResponse = {
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
        timestamp: new Date().toISOString(),
        requestId,
      },
    };
    res.status(err.statusCode).json(response);
    return;
  }

  // Handle Stripe errors
  if (err instanceof Stripe.errors.StripeError) {
    const response: ErrorResponse = {
      error: {
        code: 'PAYMENT_ERROR',
        message: process.env.NODE_ENV === 'production' 
          ? 'Payment processing failed' 
          : err.message,
        timestamp: new Date().toISOString(),
        requestId,
      },
    };
    res.status(402).json(response);
    return;
  }

  // Handle validation errors (from express-validator or similar)
  if (err.name === 'ValidationError') {
    const response: ErrorResponse = {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: err.details || err.errors,
        timestamp: new Date().toISOString(),
        requestId,
      },
    };
    res.status(400).json(response);
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    const response: ErrorResponse = {
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid authentication token',
        timestamp: new Date().toISOString(),
        requestId,
      },
    };
    res.status(401).json(response);
    return;
  }

  if (err.name === 'TokenExpiredError') {
    const response: ErrorResponse = {
      error: {
        code: 'TOKEN_EXPIRED',
        message: 'Token expired, please login again',
        timestamp: new Date().toISOString(),
        requestId,
      },
    };
    res.status(401).json(response);
    return;
  }

  // Handle database errors
  if (err.code === '23505') { // PostgreSQL unique violation
    const response: ErrorResponse = {
      error: {
        code: 'DUPLICATE_ENTRY',
        message: 'Resource already exists',
        timestamp: new Date().toISOString(),
        requestId,
      },
    };
    res.status(409).json(response);
    return;
  }

  if (err.code === '23503') { // PostgreSQL foreign key violation
    const response: ErrorResponse = {
      error: {
        code: 'INVALID_REFERENCE',
        message: 'Referenced resource does not exist',
        timestamp: new Date().toISOString(),
        requestId,
      },
    };
    res.status(400).json(response);
    return;
  }

  // Handle database connection errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
    const response: ErrorResponse = {
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Service temporarily unavailable',
        timestamp: new Date().toISOString(),
        requestId,
      },
    };
    res.status(503).json(response);
    return;
  }

  // Default error response
  const statusCode = err.statusCode || err.status || 500;
  const response: ErrorResponse = {
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : err.message || 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
      requestId,
    },
  };

  res.status(statusCode).json(response);
};

/**
 * 404 Not Found handler
 * Should be registered after all routes but before error handler
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new AppError(
    404,
    'NOT_FOUND',
    `Route ${req.method} ${req.path} not found`
  );
  next(error);
};
