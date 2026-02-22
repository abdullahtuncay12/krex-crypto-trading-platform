/**
 * Authentication Middleware Unit Tests
 * 
 * Tests JWT token verification middleware.
 * 
 * Requirements: 1.4
 */

import { Request, Response, NextFunction } from 'express';
import { requireAuth } from '../auth';
import { authService } from '../../services/AuthService';

// Mock dependencies
jest.mock('../../services/AuthService');

describe('requireAuth middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('should authenticate user with valid token', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'normal' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockRequest.headers = {
      authorization: 'Bearer valid_token',
    };

    (authService.verifyToken as jest.Mock).mockReturnValue({
      userId: '1',
      email: 'test@example.com',
      role: 'normal',
    });
    (authService.getUserById as jest.Mock).mockResolvedValue(mockUser);

    await requireAuth(mockRequest as Request, mockResponse as Response, mockNext);

    expect(authService.verifyToken).toHaveBeenCalledWith('valid_token');
    expect(authService.getUserById).toHaveBeenCalledWith('1');
    expect(mockRequest.user).toEqual(mockUser);
    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('should return 401 when Authorization header is missing', async () => {
    mockRequest.headers = {};

    await requireAuth(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: expect.objectContaining({
        code: 'AUTHENTICATION_REQUIRED',
        message: 'Authentication required',
      }),
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 when Authorization header does not start with Bearer', async () => {
    mockRequest.headers = {
      authorization: 'Basic invalid_token',
    };

    await requireAuth(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: expect.objectContaining({
        code: 'AUTHENTICATION_REQUIRED',
        message: 'Authentication required',
      }),
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 when token is expired', async () => {
    mockRequest.headers = {
      authorization: 'Bearer expired_token',
    };

    (authService.verifyToken as jest.Mock).mockImplementation(() => {
      throw new Error('Token expired, please login again');
    });

    await requireAuth(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: expect.objectContaining({
        code: 'TOKEN_EXPIRED',
        message: 'Token expired, please login again',
      }),
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 when token is invalid', async () => {
    mockRequest.headers = {
      authorization: 'Bearer invalid_token',
    };

    (authService.verifyToken as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    await requireAuth(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: expect.objectContaining({
        code: 'INVALID_TOKEN',
        message: 'Invalid token',
      }),
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 when user not found', async () => {
    mockRequest.headers = {
      authorization: 'Bearer valid_token',
    };

    (authService.verifyToken as jest.Mock).mockReturnValue({
      userId: '999',
      email: 'test@example.com',
      role: 'normal',
    });
    (authService.getUserById as jest.Mock).mockResolvedValue(null);

    await requireAuth(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: expect.objectContaining({
        code: 'INVALID_TOKEN',
        message: 'Invalid token',
      }),
    });
    expect(mockNext).not.toHaveBeenCalled();
  });
});

describe('requireRole middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('requireRole("premium")', () => {
    it('should allow premium users to access premium routes', () => {
      const { requireRole } = require('../auth');
      const middleware = requireRole('premium');

      mockRequest.user = {
        id: '1',
        email: 'premium@example.com',
        name: 'Premium User',
        role: 'premium' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 403 when normal user tries to access premium route', () => {
      const { requireRole } = require('../auth');
      const middleware = requireRole('premium');

      mockRequest.user = {
        id: '2',
        email: 'normal@example.com',
        name: 'Normal User',
        role: 'normal' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: expect.objectContaining({
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'Premium membership required',
        }),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when user is not authenticated', () => {
      const { requireRole } = require('../auth');
      const middleware = requireRole('premium');

      // No user attached to request
      mockRequest.user = undefined;

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: expect.objectContaining({
          code: 'AUTHENTICATION_REQUIRED',
          message: 'Authentication required',
        }),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireRole("normal")', () => {
    it('should allow normal users to access normal routes', () => {
      const { requireRole } = require('../auth');
      const middleware = requireRole('normal');

      mockRequest.user = {
        id: '2',
        email: 'normal@example.com',
        name: 'Normal User',
        role: 'normal' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should allow premium users to access normal routes', () => {
      const { requireRole } = require('../auth');
      const middleware = requireRole('normal');

      mockRequest.user = {
        id: '1',
        email: 'premium@example.com',
        name: 'Premium User',
        role: 'premium' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 401 when user is not authenticated', () => {
      const { requireRole } = require('../auth');
      const middleware = requireRole('normal');

      // No user attached to request
      mockRequest.user = undefined;

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: expect.objectContaining({
          code: 'AUTHENTICATION_REQUIRED',
          message: 'Authentication required',
        }),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
