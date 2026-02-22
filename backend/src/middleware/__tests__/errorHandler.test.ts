/**
 * Error Handler Middleware Unit Tests
 * 
 * Tests global error handling middleware for consistent error responses.
 * 
 * Requirements: All (error handling)
 */

import { Request, Response, NextFunction } from 'express';
import { errorHandler, notFoundHandler, AppError } from '../errorHandler';
import Stripe from 'stripe';

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    
    mockRequest = {
      method: 'GET',
      path: '/api/test',
      headers: {},
      user: undefined,
    };
    
    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };
    
    mockNext = jest.fn();
    
    // Suppress console.error during tests
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('errorHandler', () => {
    it('should handle AppError with custom status and code', () => {
      const error = new AppError(400, 'CUSTOM_ERROR', 'Custom error message');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'CUSTOM_ERROR',
            message: 'Custom error message',
            timestamp: expect.any(String),
            requestId: expect.any(String),
          }),
        })
      );
    });

    it('should handle AppError with details', () => {
      const error = new AppError(400, 'VALIDATION_ERROR', 'Validation failed', {
        fields: ['email', 'password'],
      });

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: { fields: ['email', 'password'] },
          }),
        })
      );
    });

    it('should handle Stripe errors', () => {
      const error = new Stripe.errors.StripeCardError(
        'Your card was declined',
        'card_declined',
        'card_error',
        400
      );

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(402);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'PAYMENT_ERROR',
            message: expect.any(String),
          }),
        })
      );
    });

    it('should handle JWT JsonWebTokenError', () => {
      const error = new Error('invalid token');
      error.name = 'JsonWebTokenError';

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'INVALID_TOKEN',
            message: 'Invalid authentication token',
          }),
        })
      );
    });

    it('should handle JWT TokenExpiredError', () => {
      const error = new Error('jwt expired');
      error.name = 'TokenExpiredError';

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'TOKEN_EXPIRED',
            message: 'Token expired, please login again',
          }),
        })
      );
    });

    it('should handle PostgreSQL unique violation (23505)', () => {
      const error: any = new Error('duplicate key value');
      error.code = '23505';

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(409);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'DUPLICATE_ENTRY',
            message: 'Resource already exists',
          }),
        })
      );
    });

    it('should handle PostgreSQL foreign key violation (23503)', () => {
      const error: any = new Error('foreign key constraint');
      error.code = '23503';

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'INVALID_REFERENCE',
            message: 'Referenced resource does not exist',
          }),
        })
      );
    });

    it('should handle connection refused errors', () => {
      const error: any = new Error('Connection refused');
      error.code = 'ECONNREFUSED';

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(503);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'SERVICE_UNAVAILABLE',
            message: 'Service temporarily unavailable',
          }),
        })
      );
    });

    it('should handle timeout errors', () => {
      const error: any = new Error('Connection timeout');
      error.code = 'ETIMEDOUT';

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(503);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'SERVICE_UNAVAILABLE',
            message: 'Service temporarily unavailable',
          }),
        })
      );
    });

    it('should handle validation errors', () => {
      const error: any = new Error('Validation failed');
      error.name = 'ValidationError';
      error.details = [{ field: 'email', message: 'Invalid email' }];

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: [{ field: 'email', message: 'Invalid email' }],
          }),
        })
      );
    });

    it('should handle generic errors with default 500 status', () => {
      const error = new Error('Something went wrong');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'INTERNAL_SERVER_ERROR',
            message: expect.any(String),
          }),
        })
      );
    });

    it('should use custom status code from error object', () => {
      const error: any = new Error('Custom error');
      error.statusCode = 418;

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(418);
    });

    it('should include request ID from header if present', () => {
      mockRequest.headers = { 'x-request-id': 'test-request-123' };
      const error = new Error('Test error');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            requestId: 'test-request-123',
          }),
        })
      );
    });

    it('should generate request ID if not present in header', () => {
      const error = new Error('Test error');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      const callArg = jsonMock.mock.calls[0][0];
      expect(callArg.error.requestId).toMatch(/^req_/);
    });

    it('should log error context', () => {
      const error = new Error('Test error');
      mockRequest.user = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'normal',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should hide error details in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error = new Error('Sensitive error message');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      const callArg = jsonMock.mock.calls[0][0];
      expect(callArg.error.message).toBe('An unexpected error occurred');

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('notFoundHandler', () => {
    it('should create 404 error and pass to next', () => {
      mockRequest.method = 'GET';
      mockRequest.path = '/api/nonexistent';

      notFoundHandler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 404,
          code: 'NOT_FOUND',
          message: 'Route GET /api/nonexistent not found',
        })
      );
    });

    it('should handle POST requests', () => {
      mockRequest.method = 'POST';
      mockRequest.path = '/api/invalid';

      notFoundHandler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Route POST /api/invalid not found',
        })
      );
    });
  });

  describe('AppError class', () => {
    it('should create error with all properties', () => {
      const error = new AppError(400, 'TEST_ERROR', 'Test message', { extra: 'data' });

      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('TEST_ERROR');
      expect(error.message).toBe('Test message');
      expect(error.details).toEqual({ extra: 'data' });
      expect(error.name).toBe('AppError');
    });

    it('should capture stack trace', () => {
      const error = new AppError(500, 'ERROR', 'Message');

      expect(error.stack).toBeDefined();
    });
  });
});
