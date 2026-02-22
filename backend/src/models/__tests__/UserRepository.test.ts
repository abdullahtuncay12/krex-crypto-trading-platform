/**
 * UserRepository Unit Tests
 * 
 * Tests for User model CRUD operations and role management.
 * Requirements: 1.1, 1.2, 1.3
 */

import { UserRepository } from '../UserRepository';
import { pool } from '../../config/database';

describe('UserRepository', () => {
  let userRepository: UserRepository;
  let testUserId: string;

  beforeAll(async () => {
    userRepository = new UserRepository();
    
    // Ensure users table exists (migration should be run before tests)
    // This is a safety check
    try {
      await pool.query('SELECT 1 FROM users LIMIT 1');
    } catch (error) {
      console.warn('Users table may not exist. Run migrations first.');
    }
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await pool.query('DELETE FROM users WHERE email LIKE $1', ['test%@example.com']);
  });

  afterAll(async () => {
    // Clean up test data after all tests
    await pool.query('DELETE FROM users WHERE email LIKE $1', ['test%@example.com']);
    await pool.end();
  });

  describe('create', () => {
    it('should create a new user with default normal role', async () => {
      // Requirement 1.1: Default role assignment on registration
      const input = {
        email: 'test1@example.com',
        passwordHash: 'hashedpassword123',
        name: 'Test User',
      };

      const user = await userRepository.create(input);

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.email).toBe(input.email);
      expect(user.passwordHash).toBe(input.passwordHash);
      expect(user.name).toBe(input.name);
      expect(user.role).toBe('normal'); // Default role
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);

      testUserId = user.id;
    });

    it('should create a user with explicitly set premium role', async () => {
      const input = {
        email: 'test2@example.com',
        passwordHash: 'hashedpassword456',
        name: 'Premium User',
        role: 'premium' as const,
      };

      const user = await userRepository.create(input);

      expect(user.role).toBe('premium');
    });

    it('should fail when creating user with duplicate email', async () => {
      const input = {
        email: 'test3@example.com',
        passwordHash: 'hashedpassword789',
        name: 'Duplicate User',
      };

      await userRepository.create(input);

      // Attempt to create another user with same email
      await expect(userRepository.create(input)).rejects.toThrow();
    });
  });

  describe('findById', () => {
    it('should find user by ID', async () => {
      const created = await userRepository.create({
        email: 'test4@example.com',
        passwordHash: 'hashedpassword',
        name: 'Find By ID User',
      });

      const found = await userRepository.findById(created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.email).toBe(created.email);
    });

    it('should return null for non-existent ID', async () => {
      const found = await userRepository.findById('00000000-0000-0000-0000-000000000000');

      expect(found).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const created = await userRepository.create({
        email: 'test5@example.com',
        passwordHash: 'hashedpassword',
        name: 'Find By Email User',
      });

      const found = await userRepository.findByEmail(created.email);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.email).toBe(created.email);
    });

    it('should return null for non-existent email', async () => {
      const found = await userRepository.findByEmail('nonexistent@example.com');

      expect(found).toBeNull();
    });
  });

  describe('update', () => {
    it('should update user name', async () => {
      const created = await userRepository.create({
        email: 'test6@example.com',
        passwordHash: 'hashedpassword',
        name: 'Original Name',
      });

      const updated = await userRepository.update(created.id, {
        name: 'Updated Name',
      });

      expect(updated).toBeDefined();
      expect(updated?.name).toBe('Updated Name');
      expect(updated?.email).toBe(created.email); // Unchanged
    });

    it('should update user role to premium', async () => {
      // Requirement 1.2: Role upgrade on premium subscription
      const created = await userRepository.create({
        email: 'test7@example.com',
        passwordHash: 'hashedpassword',
        name: 'Normal User',
      });

      expect(created.role).toBe('normal');

      const updated = await userRepository.update(created.id, {
        role: 'premium',
      });

      expect(updated).toBeDefined();
      expect(updated?.role).toBe('premium');
    });

    it('should update user role to normal', async () => {
      // Requirement 1.3: Role downgrade on subscription expiration
      const created = await userRepository.create({
        email: 'test8@example.com',
        passwordHash: 'hashedpassword',
        name: 'Premium User',
        role: 'premium',
      });

      expect(created.role).toBe('premium');

      const updated = await userRepository.update(created.id, {
        role: 'normal',
      });

      expect(updated).toBeDefined();
      expect(updated?.role).toBe('normal');
    });

    it('should return null for non-existent user', async () => {
      const updated = await userRepository.update('00000000-0000-0000-0000-000000000000', {
        name: 'New Name',
      });

      expect(updated).toBeNull();
    });
  });

  describe('updateRole', () => {
    it('should update user role using convenience method', async () => {
      const created = await userRepository.create({
        email: 'test9@example.com',
        passwordHash: 'hashedpassword',
        name: 'Role Update User',
      });

      const updated = await userRepository.updateRole(created.id, 'premium');

      expect(updated).toBeDefined();
      expect(updated?.role).toBe('premium');
    });
  });

  describe('delete', () => {
    it('should delete user by ID', async () => {
      const created = await userRepository.create({
        email: 'test10@example.com',
        passwordHash: 'hashedpassword',
        name: 'Delete User',
      });

      const deleted = await userRepository.delete(created.id);

      expect(deleted).toBe(true);

      const found = await userRepository.findById(created.id);
      expect(found).toBeNull();
    });

    it('should return false when deleting non-existent user', async () => {
      const deleted = await userRepository.delete('00000000-0000-0000-0000-000000000000');

      expect(deleted).toBe(false);
    });
  });

  describe('findByRole', () => {
    it('should find all users with normal role', async () => {
      await userRepository.create({
        email: 'test11@example.com',
        passwordHash: 'hashedpassword',
        name: 'Normal User 1',
      });

      await userRepository.create({
        email: 'test12@example.com',
        passwordHash: 'hashedpassword',
        name: 'Normal User 2',
      });

      const normalUsers = await userRepository.findByRole('normal');

      expect(normalUsers.length).toBeGreaterThanOrEqual(2);
      expect(normalUsers.every(u => u.role === 'normal')).toBe(true);
    });

    it('should find all users with premium role', async () => {
      await userRepository.create({
        email: 'test13@example.com',
        passwordHash: 'hashedpassword',
        name: 'Premium User 1',
        role: 'premium',
      });

      const premiumUsers = await userRepository.findByRole('premium');

      expect(premiumUsers.length).toBeGreaterThanOrEqual(1);
      expect(premiumUsers.every(u => u.role === 'premium')).toBe(true);
    });
  });

  describe('emailExists', () => {
    it('should return true for existing email', async () => {
      await userRepository.create({
        email: 'test14@example.com',
        passwordHash: 'hashedpassword',
        name: 'Email Check User',
      });

      const exists = await userRepository.emailExists('test14@example.com');

      expect(exists).toBe(true);
    });

    it('should return false for non-existent email', async () => {
      const exists = await userRepository.emailExists('nonexistent@example.com');

      expect(exists).toBe(false);
    });
  });
});
