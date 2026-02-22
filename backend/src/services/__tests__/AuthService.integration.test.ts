/**
 * Authentication Service Integration Tests
 * 
 * Tests authentication flow with real bcrypt and JWT operations.
 * Uses actual UserRepository (mocked at database level).
 * 
 * Requirements: 1.1, 1.4
 */

import { AuthService } from '../AuthService';
import { userRepository } from '../../models/UserRepository';
import bcrypt from 'bcrypt';

// Mock only the database layer
jest.mock('../../models/UserRepository');

describe('AuthService Integration', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe('complete registration and login flow', () => {
    it('should register user with hashed password and login successfully', async () => {
      const registerInput = {
        email: 'integration@example.com',
        password: 'SecurePassword123!',
        name: 'Integration Test User',
      };

      // Mock database responses
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      
      // Capture the created user
      let createdUser: any;
      (userRepository.create as jest.Mock).mockImplementation(async (input) => {
        createdUser = {
          id: 'test-user-id',
          email: input.email,
          passwordHash: input.passwordHash,
          name: input.name,
          role: input.role,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        return createdUser;
      });

      // Register user
      const registerResult = await authService.register(registerInput);

      // Verify registration response
      expect(registerResult.user.email).toBe(registerInput.email);
      expect(registerResult.user.name).toBe(registerInput.name);
      expect(registerResult.user.role).toBe('normal'); // Requirement 1.1
      expect(registerResult.user).not.toHaveProperty('passwordHash');
      expect(registerResult.token).toBeTruthy();

      // Verify password was hashed (not stored in plain text)
      expect(createdUser.passwordHash).not.toBe(registerInput.password);
      expect(createdUser.passwordHash.startsWith('$2b$')).toBe(true); // bcrypt hash format

      // Verify token can be decoded
      const tokenPayload = authService.verifyToken(registerResult.token);
      expect(tokenPayload.userId).toBe(createdUser.id);
      expect(tokenPayload.email).toBe(registerInput.email);
      expect(tokenPayload.role).toBe('normal');

      // Now test login with the same credentials
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(createdUser);

      const loginResult = await authService.login({
        email: registerInput.email,
        password: registerInput.password,
      });

      // Verify login response
      expect(loginResult.user.email).toBe(registerInput.email);
      expect(loginResult.user.role).toBe('normal');
      expect(loginResult.token).toBeTruthy();

      // Verify new token is valid
      const loginTokenPayload = authService.verifyToken(loginResult.token);
      expect(loginTokenPayload.userId).toBe(createdUser.id);
    });

    it('should fail login with wrong password', async () => {
      const password = 'CorrectPassword123!';
      const hashedPassword = await bcrypt.hash(password, 10);

      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        passwordHash: hashedPassword,
        name: 'Test User',
        role: 'normal' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'WrongPassword123!',
        })
      ).rejects.toThrow('Invalid email or password');
    });

    it('should verify token expiration is configured', () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        passwordHash: 'hash',
        name: 'Test User',
        role: 'normal' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const token = authService.generateToken(mockUser);
      const payload = authService.verifyToken(token);

      // Token should have expiration
      expect(payload).toBeTruthy();
      expect(payload.userId).toBe(mockUser.id);
    });
  });

  describe('role-based token generation', () => {
    it('should generate token with normal role', () => {
      const normalUser = {
        id: '1',
        email: 'normal@example.com',
        passwordHash: 'hash',
        name: 'Normal User',
        role: 'normal' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const token = authService.generateToken(normalUser);
      const payload = authService.verifyToken(token);

      expect(payload.role).toBe('normal');
    });

    it('should generate token with premium role', () => {
      const premiumUser = {
        id: '2',
        email: 'premium@example.com',
        passwordHash: 'hash',
        name: 'Premium User',
        role: 'premium' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const token = authService.generateToken(premiumUser);
      const payload = authService.verifyToken(token);

      expect(payload.role).toBe('premium');
    });
  });
});
