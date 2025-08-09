const AuthService = require('../../services/authService');
const User = require('../../models/User');
const { createTestUser } = require('../helpers');

describe('AuthService', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '7d';
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const userId = '507f1f77bcf86cd799439011';
      const token = AuthService.generateToken(userId);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.userId).toBe(userId);
    });
  });

  describe('validateCredentials', () => {
    it('should validate correct credentials', async () => {
      const testUser = await createTestUser({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

      const user = await AuthService.validateCredentials('testuser', 'password123');
      
      expect(user).toBeDefined();
      expect(user.username).toBe('testuser');
      expect(user.email).toBe('test@example.com');
    });

    it('should throw error for invalid username', async () => {
      await expect(
        AuthService.validateCredentials('nonexistent', 'password123')
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error for invalid password', async () => {
      await createTestUser({
        username: 'testuser',
        password: 'password123'
      });

      await expect(
        AuthService.validateCredentials('testuser', 'wrongpassword')
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error for inactive account', async () => {
      await createTestUser({
        username: 'testuser',
        password: 'password123',
        isActive: false
      });

      await expect(
        AuthService.validateCredentials('testuser', 'password123')
      ).rejects.toThrow('Account deactivated');
    });
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        phoneNumber: '+1234567890'
      };

      const user = await AuthService.createUser(userData);
      
      expect(user).toBeDefined();
      expect(user.username).toBe('newuser');
      expect(user.email).toBe('new@example.com');
      expect(user.firstName).toBe('New');
      expect(user.lastName).toBe('User');
    });

    it('should throw error for duplicate username', async () => {
      await createTestUser({ username: 'existinguser' });

      const userData = {
        username: 'existinguser',
        email: 'different@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        phoneNumber: '+1234567890'
      };

      await expect(AuthService.createUser(userData))
        .rejects.toThrow('User with this username already exists');
    });

    it('should throw error for duplicate email', async () => {
      await createTestUser({ email: 'existing@example.com' });

      const userData = {
        username: 'differentuser',
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        phoneNumber: '+1234567890'
      };

      await expect(AuthService.createUser(userData))
        .rejects.toThrow('User with this email already exists');
    });
  });

  describe('updateLastLogin', () => {
    it('should update user last login timestamp', async () => {
      const user = await createTestUser();
      const originalLastLogin = user.lastLogin;

      await AuthService.updateLastLogin(user._id);

      const updatedUser = await User.findById(user._id);
      expect(updatedUser.lastLogin).not.toEqual(originalLastLogin);
      expect(updatedUser.lastLogin).toBeInstanceOf(Date);
    });
  });

  describe('formatUserResponse', () => {
    it('should format user response without token', async () => {
      const user = await createTestUser();
      const formatted = AuthService.formatUserResponse(user);

      expect(formatted).toHaveProperty('id');
      expect(formatted).toHaveProperty('username');
      expect(formatted).toHaveProperty('email');
      expect(formatted).toHaveProperty('firstName');
      expect(formatted).toHaveProperty('lastName');
      expect(formatted).toHaveProperty('fullName');
      expect(formatted).toHaveProperty('role');
      expect(formatted).not.toHaveProperty('password');
      expect(formatted).not.toHaveProperty('token');
    });

    it('should format user response with token', async () => {
      const user = await createTestUser();
      const token = 'test-token';
      const formatted = AuthService.formatUserResponse(user, token);

      expect(formatted).toHaveProperty('user');
      expect(formatted).toHaveProperty('token', token);
      expect(formatted.user).toHaveProperty('id');
      expect(formatted.user).not.toHaveProperty('password');
    });
  });
});