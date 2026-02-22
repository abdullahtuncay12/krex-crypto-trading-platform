/**
 * Request Validation Middleware
 * 
 * Provides validation middleware for request bodies.
 * Validates required fields and formats for all POST/PUT endpoints.
 * Validates cryptocurrency symbols against supported list.
 * Validates date ranges for historical data.
 * Returns 400 Bad Request with field-specific errors.
 * 
 * Requirements: All (validation)
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Validation error response format
 */
interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validate email format
 */
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate registration request body
 */
export const validateRegister = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors: ValidationError[] = [];
  const { email, password, name } = req.body;

  // Validate email
  if (!email) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (typeof email !== 'string') {
    errors.push({ field: 'email', message: 'Email must be a string' });
  } else if (!isValidEmail(email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }

  // Validate password
  if (!password) {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (typeof password !== 'string') {
    errors.push({ field: 'password', message: 'Password must be a string' });
  } else if (password.length < 8) {
    errors.push({ field: 'password', message: 'Password must be at least 8 characters' });
  }

  // Validate name
  if (!name) {
    errors.push({ field: 'name', message: 'Name is required' });
  } else if (typeof name !== 'string') {
    errors.push({ field: 'name', message: 'Name must be a string' });
  } else if (name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Name cannot be empty' });
  }

  // Return validation errors if any
  if (errors.length > 0) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: errors,
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  next();
};

/**
 * Validate login request body
 */
export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors: ValidationError[] = [];
  const { email, password } = req.body;

  // Validate email
  if (!email) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (typeof email !== 'string') {
    errors.push({ field: 'email', message: 'Email must be a string' });
  } else if (!isValidEmail(email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }

  // Validate password
  if (!password) {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (typeof password !== 'string') {
    errors.push({ field: 'password', message: 'Password must be a string' });
  }

  // Return validation errors if any
  if (errors.length > 0) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: errors,
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  next();
};

/**
 * Supported cryptocurrency symbols
 * Must match the list in routes/cryptocurrencies.ts
 */
const SUPPORTED_SYMBOLS = ['BTC', 'ETH', 'BNB', 'SOL', 'ADA', 'XRP', 'DOT', 'DOGE'];

/**
 * Validate cryptocurrency symbol
 */
export const validateCryptoSymbol = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { symbol } = req.params;

  if (!symbol) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Cryptocurrency symbol is required',
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  const upperSymbol = symbol.toUpperCase();
  if (!SUPPORTED_SYMBOLS.includes(upperSymbol)) {
    res.status(400).json({
      error: {
        code: 'UNSUPPORTED_CRYPTOCURRENCY',
        message: `Unsupported cryptocurrency: ${symbol}`,
        details: {
          supportedSymbols: SUPPORTED_SYMBOLS,
        },
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  // Normalize symbol to uppercase
  req.params.symbol = upperSymbol;
  next();
};

/**
 * Validate subscription upgrade request
 */
export const validateSubscriptionUpgrade = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors: ValidationError[] = [];
  const { planId, paymentMethodId } = req.body;

  // Validate planId
  if (!planId) {
    errors.push({ field: 'planId', message: 'Plan ID is required' });
  } else if (typeof planId !== 'string') {
    errors.push({ field: 'planId', message: 'Plan ID must be a string' });
  } else if (planId.trim().length === 0) {
    errors.push({ field: 'planId', message: 'Plan ID cannot be empty' });
  }

  // Validate paymentMethodId
  if (!paymentMethodId) {
    errors.push({ field: 'paymentMethodId', message: 'Payment method ID is required' });
  } else if (typeof paymentMethodId !== 'string') {
    errors.push({ field: 'paymentMethodId', message: 'Payment method ID must be a string' });
  } else if (paymentMethodId.trim().length === 0) {
    errors.push({ field: 'paymentMethodId', message: 'Payment method ID cannot be empty' });
  }

  if (errors.length > 0) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: errors,
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  next();
};

/**
 * Validate alert preferences request
 */
export const validateAlertPreferences = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors: ValidationError[] = [];
  const { priceMovementThreshold, enablePumpAlerts, cryptocurrencies } = req.body;

  // Validate priceMovementThreshold
  if (priceMovementThreshold === undefined || priceMovementThreshold === null) {
    errors.push({ field: 'priceMovementThreshold', message: 'Price movement threshold is required' });
  } else if (typeof priceMovementThreshold !== 'number') {
    errors.push({ field: 'priceMovementThreshold', message: 'Price movement threshold must be a number' });
  } else if (priceMovementThreshold < 0 || priceMovementThreshold > 100) {
    errors.push({ field: 'priceMovementThreshold', message: 'Price movement threshold must be between 0 and 100' });
  }

  // Validate enablePumpAlerts
  if (enablePumpAlerts === undefined || enablePumpAlerts === null) {
    errors.push({ field: 'enablePumpAlerts', message: 'Enable pump alerts is required' });
  } else if (typeof enablePumpAlerts !== 'boolean') {
    errors.push({ field: 'enablePumpAlerts', message: 'Enable pump alerts must be a boolean' });
  }

  // Validate cryptocurrencies
  if (!cryptocurrencies) {
    errors.push({ field: 'cryptocurrencies', message: 'Cryptocurrencies list is required' });
  } else if (!Array.isArray(cryptocurrencies)) {
    errors.push({ field: 'cryptocurrencies', message: 'Cryptocurrencies must be an array' });
  } else {
    // Validate each cryptocurrency symbol
    const invalidSymbols = cryptocurrencies.filter(
      (symbol) => typeof symbol !== 'string' || !SUPPORTED_SYMBOLS.includes(symbol.toUpperCase())
    );
    if (invalidSymbols.length > 0) {
      errors.push({
        field: 'cryptocurrencies',
        message: `Invalid cryptocurrency symbols: ${invalidSymbols.join(', ')}. Supported: ${SUPPORTED_SYMBOLS.join(', ')}`,
      });
    }
  }

  if (errors.length > 0) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: errors,
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  next();
};

/**
 * Validate date range for historical data
 */
export const validateDateRange = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors: ValidationError[] = [];
  const { days } = req.query;

  if (days !== undefined) {
    const daysNum = parseInt(days as string, 10);

    if (isNaN(daysNum)) {
      errors.push({ field: 'days', message: 'Days must be a valid number' });
    } else if (daysNum < 1) {
      errors.push({ field: 'days', message: 'Days must be at least 1' });
    } else if (daysNum > 365) {
      errors.push({ field: 'days', message: 'Days cannot exceed 365' });
    }
  }

  if (errors.length > 0) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid date range',
        details: errors,
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  next();
};
