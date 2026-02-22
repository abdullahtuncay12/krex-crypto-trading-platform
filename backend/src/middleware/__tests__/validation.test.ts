/**
 * Validation Middleware Unit Tests
 * 
 * Tests request validation for authentication endpoints.
 * 
 * Requirements: 1.1, 1.4
 */

import { Request, Response, NextFunction } from 'express';
import { validateRegister, validateLogin } from '../validation';

describe('Validation Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    
    mockRequest = {
      body: {},
    };
    
    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };
    
    mockNext = jest.fn();
  });

  describe('validateRegister', () => {
    it('should call next() with valid registration data', () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      validateRegister(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should return 400 for missing email', () => {
      mockRequest.body = {
        password: 'password123',
        name: 'Test User',
      };

      validateRegister(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'VALIDATION_ERROR',
            details: expect.arrayContaining([
              expect.objectContaining({
                field: 'email',
                message: 'Email is required',
              }),
            ]),
          }),
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid email format', () => {
      mockRequest.body = {
        email: 'not-an-email',
        password: 'password123',
        name: 'Test User',
      };

      validateRegister(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'VALIDATION_ERROR',
            details: expect.arrayContaining([
              expect.objectContaining({
                field: 'email',
                message: 'Invalid email format',
              }),
            ]),
          }),
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 for password less than 8 characters', () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'short',
        name: 'Test User',
      };

      validateRegister(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'VALIDATION_ERROR',
            details: expect.arrayContaining([
              expect.objectContaining({
                field: 'password',
                message: 'Password must be at least 8 characters',
              }),
            ]),
          }),
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 for missing name', () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      validateRegister(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'VALIDATION_ERROR',
            details: expect.arrayContaining([
              expect.objectContaining({
                field: 'name',
                message: 'Name is required',
              }),
            ]),
          }),
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 for empty name', () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
        name: '   ',
      };

      validateRegister(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'VALIDATION_ERROR',
            details: expect.arrayContaining([
              expect.objectContaining({
                field: 'name',
                message: 'Name cannot be empty',
              }),
            ]),
          }),
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return multiple validation errors', () => {
      mockRequest.body = {
        email: 'invalid',
        password: 'short',
        name: '',
      };

      validateRegister(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      const callArg = jsonMock.mock.calls[0][0];
      expect(callArg.error.details).toHaveLength(3);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('validateLogin', () => {
    it('should call next() with valid login data', () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      validateLogin(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should return 400 for missing email', () => {
      mockRequest.body = {
        password: 'password123',
      };

      validateLogin(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'VALIDATION_ERROR',
            details: expect.arrayContaining([
              expect.objectContaining({
                field: 'email',
                message: 'Email is required',
              }),
            ]),
          }),
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid email format', () => {
      mockRequest.body = {
        email: 'not-valid',
        password: 'password123',
      };

      validateLogin(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'VALIDATION_ERROR',
            details: expect.arrayContaining([
              expect.objectContaining({
                field: 'email',
                message: 'Invalid email format',
              }),
            ]),
          }),
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 for missing password', () => {
      mockRequest.body = {
        email: 'test@example.com',
      };

      validateLogin(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'VALIDATION_ERROR',
            details: expect.arrayContaining([
              expect.objectContaining({
                field: 'password',
                message: 'Password is required',
              }),
            ]),
          }),
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return multiple validation errors', () => {
      mockRequest.body = {};

      validateLogin(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      const callArg = jsonMock.mock.calls[0][0];
      expect(callArg.error.details).toHaveLength(2);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});


  describe('validateCryptoSymbol', () => {
    const { validateCryptoSymbol } = require('../validation');

    it('should call next() with valid cryptocurrency symbol', () => {
      mockRequest.params = { symbol: 'BTC' };

      validateCryptoSymbol(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
      expect(mockRequest.params.symbol).toBe('BTC');
    });

    it('should normalize symbol to uppercase', () => {
      mockRequest.params = { symbol: 'btc' };

      validateCryptoSymbol(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.params.symbol).toBe('BTC');
    });

    it('should return 400 for unsupported cryptocurrency', () => {
      mockRequest.params = { symbol: 'INVALID' };

      validateCryptoSymbol(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'UNSUPPORTED_CRYPTOCURRENCY',
            message: expect.stringContaining('INVALID'),
          }),
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 for missing symbol', () => {
      mockRequest.params = {};

      validateCryptoSymbol(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('validateSubscriptionUpgrade', () => {
    const { validateSubscriptionUpgrade } = require('../validation');

    it('should call next() with valid upgrade data', () => {
      mockRequest.body = {
        planId: 'price_123',
        paymentMethodId: 'pm_456',
      };

      validateSubscriptionUpgrade(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should return 400 for missing planId', () => {
      mockRequest.body = {
        paymentMethodId: 'pm_456',
      };

      validateSubscriptionUpgrade(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'VALIDATION_ERROR',
            details: expect.arrayContaining([
              expect.objectContaining({
                field: 'planId',
                message: 'Plan ID is required',
              }),
            ]),
          }),
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 for missing paymentMethodId', () => {
      mockRequest.body = {
        planId: 'price_123',
      };

      validateSubscriptionUpgrade(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            details: expect.arrayContaining([
              expect.objectContaining({
                field: 'paymentMethodId',
                message: 'Payment method ID is required',
              }),
            ]),
          }),
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 for empty planId', () => {
      mockRequest.body = {
        planId: '   ',
        paymentMethodId: 'pm_456',
      };

      validateSubscriptionUpgrade(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 for non-string planId', () => {
      mockRequest.body = {
        planId: 123,
        paymentMethodId: 'pm_456',
      };

      validateSubscriptionUpgrade(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('validateAlertPreferences', () => {
    const { validateAlertPreferences } = require('../validation');

    it('should call next() with valid alert preferences', () => {
      mockRequest.body = {
        priceMovementThreshold: 5,
        enablePumpAlerts: true,
        cryptocurrencies: ['BTC', 'ETH'],
      };

      validateAlertPreferences(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should return 400 for missing priceMovementThreshold', () => {
      mockRequest.body = {
        enablePumpAlerts: true,
        cryptocurrencies: ['BTC'],
      };

      validateAlertPreferences(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            details: expect.arrayContaining([
              expect.objectContaining({
                field: 'priceMovementThreshold',
              }),
            ]),
          }),
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 for threshold out of range', () => {
      mockRequest.body = {
        priceMovementThreshold: 150,
        enablePumpAlerts: true,
        cryptocurrencies: ['BTC'],
      };

      validateAlertPreferences(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            details: expect.arrayContaining([
              expect.objectContaining({
                field: 'priceMovementThreshold',
                message: expect.stringContaining('between 0 and 100'),
              }),
            ]),
          }),
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 for non-boolean enablePumpAlerts', () => {
      mockRequest.body = {
        priceMovementThreshold: 5,
        enablePumpAlerts: 'yes',
        cryptocurrencies: ['BTC'],
      };

      validateAlertPreferences(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 for non-array cryptocurrencies', () => {
      mockRequest.body = {
        priceMovementThreshold: 5,
        enablePumpAlerts: true,
        cryptocurrencies: 'BTC',
      };

      validateAlertPreferences(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid cryptocurrency symbols', () => {
      mockRequest.body = {
        priceMovementThreshold: 5,
        enablePumpAlerts: true,
        cryptocurrencies: ['BTC', 'INVALID', 'ETH'],
      };

      validateAlertPreferences(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            details: expect.arrayContaining([
              expect.objectContaining({
                field: 'cryptocurrencies',
                message: expect.stringContaining('INVALID'),
              }),
            ]),
          }),
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should accept threshold at boundary values', () => {
      mockRequest.body = {
        priceMovementThreshold: 0,
        enablePumpAlerts: false,
        cryptocurrencies: ['BTC'],
      };

      validateAlertPreferences(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();

      mockRequest.body.priceMovementThreshold = 100;
      validateAlertPreferences(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledTimes(2);
    });
  });

  describe('validateDateRange', () => {
    const { validateDateRange } = require('../validation');

    it('should call next() with valid days parameter', () => {
      mockRequest.query = { days: '30' };

      validateDateRange(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should call next() when days parameter is not provided', () => {
      mockRequest.query = {};

      validateDateRange(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should return 400 for non-numeric days', () => {
      mockRequest.query = { days: 'invalid' };

      validateDateRange(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'VALIDATION_ERROR',
            details: expect.arrayContaining([
              expect.objectContaining({
                field: 'days',
                message: 'Days must be a valid number',
              }),
            ]),
          }),
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 for days less than 1', () => {
      mockRequest.query = { days: '0' };

      validateDateRange(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            details: expect.arrayContaining([
              expect.objectContaining({
                field: 'days',
                message: 'Days must be at least 1',
              }),
            ]),
          }),
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 for days greater than 365', () => {
      mockRequest.query = { days: '400' };

      validateDateRange(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            details: expect.arrayContaining([
              expect.objectContaining({
                field: 'days',
                message: 'Days cannot exceed 365',
              }),
            ]),
          }),
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should accept boundary values', () => {
      mockRequest.query = { days: '1' };
      validateDateRange(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      expect(mockNext).toHaveBeenCalled();

      mockRequest.query = { days: '365' };
      validateDateRange(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      expect(mockNext).toHaveBeenCalledTimes(2);
    });
  });
});
