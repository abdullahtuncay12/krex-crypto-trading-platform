/**
 * Authentication Service Unit Tests
 * 
 * Tests user registration, login, and token verification.
 * 
 * Requirements: 1.1, 1.4
 */

import { AuthService } from '../AuthService';
import { userRepository } from '../../models/UserRepository';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../../config';

// Mock dependencies
jest.mock('../../models/UserRepository');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user with normal role and hashed password', async () => {
      const input = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const hashedPassword = 'hashed_password';
      const mockUser = {
        id: '1',
        email: input.email,
        passwordHash: hashedPassword,
        name: input.name,
        role: 'normal' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (userRepository.create as jest.Mock).mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue('mock_token');

      const result = await authService.register(input);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(input.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(input.password, 10);
      expect(userRepository.create).toHaveBeenCalledWith({
        email: input.email,
        passwordHash: hashedPassword,
        name: input.name,
        role: 'normal',
      });
      expect(result.user.role).toBe('normal');
      expect(result.user).not.toHaveProperty('passwordHash');
      expect(result.token).toBe('mock_token');
    });

    it('should throw error if email already exists', async () => {
      const input = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const existingUser = {
        id: '1',
        email: input.email,
        passwordHash: 'hash',
        name: 'Existing User',
        role: 'normal' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (userRepository.findByEmail as jest.Mock).mockResolvedValue(existingUser);

      await expect(authService.register(input)).rejects.toThrow('Email already registered');
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(userRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const input = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: '1',
        email: input.email,
        passwordHash: 'hashed_password',
        name: 'Test User',
        role: 'normal' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mock_token');

      const result = await authService.login(input);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(input.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(input.password, mockUser.passwordHash);
      expect(result.user).not.toHaveProperty('passwordHash');
      expect(result.token).toBe('mock_token');
    });

    it('should throw error with invalid email', async () => {
      const input = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(authService.login(input)).rejects.toThrow('Invalid email or password');
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw error with invalid password', async () => {
      const input = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const mockUser = {
        id: '1',
        email: input.email,
        passwordHash: 'hashed_password',
        name: 'Test User',
        role: 'normal' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login(input)).rejects.toThrow('Invalid email or password');
    });
  });

  describe('generateToken', () => {
    it('should generate JWT token with user payload', () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        passwordHash: 'hash',
        name: 'Test User',
        role: 'normal' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (jwt.sign as jest.Mock).mockReturnValue('generated_token');

      const token = authService.generateToken(mockUser);

      expect(jwt.sign).toHaveBeenCalledWith(
        {
          userId: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );
      expect(token).toBe('generated_token');
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token and return payload', () => {
      const mockPayload = {
        userId: '1',
        email: 'test@example.com',
        role: 'normal' as const,
      };

      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

      const result = authService.verifyToken('valid_token');

      expect(jwt.verify).toHaveBeenCalledWith('valid_token', config.jwt.secret);
      expect(result).toEqual(mockPayload);
    });

    it('should throw error for expired token', () => {
      const expiredError = new jwt.TokenExpiredError('jwt expired', new Date());
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw expiredError;
      });

      expect(() => authService.verifyToken('expired_token')).toThrow('Token expired, please login again');
    });

    it('should throw error for invalid token', () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('invalid token');
      });

      expect(() => authService.verifyToken('invalid_token')).toThrow('Invalid token');
    });
  });

  describe('getUserById', () => {
    it('should return user without password hash', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        passwordHash: 'hashed_password',
        name: 'Test User',
        role: 'normal' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.getUserById('1');

      expect(userRepository.findById).toHaveBeenCalledWith('1');
      expect(result).not.toHaveProperty('passwordHash');
      expect(result?.id).toBe('1');
      expect(result?.email).toBe('test@example.com');
    });

    it('should return null for non-existent user', async () => {
      (userRepository.findById as jest.Mock).mockResolvedValue(null);

      const result = await authService.getUserById('999');

      expect(result).toBeNull();
    });
  });
});
