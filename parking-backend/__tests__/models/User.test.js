const User = require('../../models/User');
const { createTestUser } = require('../helpers');

describe('User Model', () => {
  describe('User Creation', () => {
    it('should create a user with valid data', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        phoneNumber: '+1234567890',
      };

      const user = await User.create(userData);

      expect(user.username).toBe('testuser');
      expect(user.email).toBe('test@example.com');
      expect(user.firstName).toBe('Test');
      expect(user.lastName).toBe('User');
      expect(user.phoneNumber).toBe('+1234567890');
      expect(user.role).toBe('customer'); // default role
      expect(user.isActive).toBe(true); // default active
      expect(user.password).not.toBe('password123'); // should be hashed
    });

    it('should not create user with invalid email', async () => {
      const userData = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        phoneNumber: '+1234567890',
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should not create user with short password', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: '123',
        firstName: 'Test',
        lastName: 'User',
        phoneNumber: '+1234567890',
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should not create user with duplicate email', async () => {
      await createTestUser({ email: 'duplicate@example.com' });

      const userData = {
        username: 'differentuser',
        email: 'duplicate@example.com',
        password: 'password123',
        firstName: 'Different',
        lastName: 'User',
        phoneNumber: '+9876543210',
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should not create user with duplicate username', async () => {
      await createTestUser({ username: 'duplicateuser' });

      const userData = {
        username: 'duplicateuser',
        email: 'different@example.com',
        password: 'password123',
        firstName: 'Different',
        lastName: 'User',
        phoneNumber: '+9876543210',
      };

      await expect(User.create(userData)).rejects.toThrow();
    });
  });

  describe('User Methods', () => {
    describe('comparePassword', () => {
      it('should return true for correct password', async () => {
        const user = await createTestUser({ password: 'testpassword' });
        const isMatch = await user.comparePassword('testpassword');
        expect(isMatch).toBe(true);
      });

      it('should return false for incorrect password', async () => {
        const user = await createTestUser({ password: 'testpassword' });
        const isMatch = await user.comparePassword('wrongpassword');
        expect(isMatch).toBe(false);
      });
    });

    describe('changedPasswordAfter', () => {
      it('should return false if password was never changed', async () => {
        const user = await createTestUser();
        const JWTTimestamp = Math.floor(Date.now() / 1000);
        const hasChanged = user.changedPasswordAfter(JWTTimestamp);
        expect(hasChanged).toBe(false);
      });

      it('should return true if password was changed after JWT timestamp', async () => {
        const user = await createTestUser();
        const JWTTimestamp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
        
        // Simulate password change
        user.passwordChangedAt = new Date();
        await user.save();

        const hasChanged = user.changedPasswordAfter(JWTTimestamp);
        expect(hasChanged).toBe(true);
      });
    });
  });

  describe('User Virtuals', () => {
    it('should generate fullName virtual', async () => {
      const user = await createTestUser({
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(user.fullName).toBe('John Doe');
    });
  });

  describe('User Statics', () => {
    describe('findByEmailOrUsername', () => {
      it('should find user by email', async () => {
        const testUser = await createTestUser({
          email: 'findme@example.com',
          username: 'findmeuser',
        });

        const foundUser = await User.findByEmailOrUsername('findme@example.com');
        expect(foundUser).toBeDefined();
        expect(foundUser._id.toString()).toBe(testUser._id.toString());
      });

      it('should find user by username', async () => {
        const testUser = await createTestUser({
          email: 'findme2@example.com',
          username: 'findmeuser2',
        });

        const foundUser = await User.findByEmailOrUsername('findmeuser2');
        expect(foundUser).toBeDefined();
        expect(foundUser._id.toString()).toBe(testUser._id.toString());
      });

      it('should return null for non-existent user', async () => {
        const foundUser = await User.findByEmailOrUsername('nonexistent@example.com');
        expect(foundUser).toBeNull();
      });
    });
  });

  describe('Password Hashing', () => {
    it('should hash password before saving', async () => {
      const plainPassword = 'plainpassword123';
      const user = new User({
        username: 'hashtest',
        email: 'hash@example.com',
        password: plainPassword,
        firstName: 'Hash',
        lastName: 'Test',
        phoneNumber: '+1234567890',
      });

      await user.save();

      expect(user.password).not.toBe(plainPassword);
      expect(user.password).toMatch(/^\$2[ayb]\$.{56}$/); // bcrypt format
    });

    it('should not rehash password if not modified', async () => {
      const user = await createTestUser();
      const originalPassword = user.password;

      user.firstName = 'Updated';
      await user.save();

      expect(user.password).toBe(originalPassword);
    });
  });

  describe('Vehicle Management', () => {
    it('should add vehicle to user', async () => {
      const user = await createTestUser();
      
      user.vehicles.push({
        plateNumber: 'ABC123',
        vehicleType: 'car',
        make: 'Toyota',
        model: 'Camry',
      });

      await user.save();
      
      expect(user.vehicles).toHaveLength(1);
      expect(user.vehicles[0].plateNumber).toBe('ABC123');
      expect(user.vehicles[0].vehicleType).toBe('car');
    });

    it('should convert plate number to uppercase', async () => {
      const user = await createTestUser();
      
      user.vehicles.push({
        plateNumber: 'abc123',
        vehicleType: 'car',
      });

      await user.save();
      
      expect(user.vehicles[0].plateNumber).toBe('ABC123');
    });
  });
});