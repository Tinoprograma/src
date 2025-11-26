/**
 * AUTH SERVICE TESTS
 * Pruebas unitarias para el servicio de autenticación
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authService = require('../auth.service');
const userRepository = require('../../repositories/user.repository');
const logger = require('../../utils/logger');

// Mock dependencies
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../../repositories/user.repository');
jest.mock('../../utils/logger');

describe('AuthService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.JWT_SECRET = 'test-secret-key';
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('register', () => {
    const mockUserData = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
      display_name: 'Test User',
      country_code: 'US'
    };

    const mockUser = {
      id: 1,
      email: 'test@example.com',
      username: 'testuser',
      display_name: 'Test User',
      country_code: 'US',
      password_hash: 'hashed_password',
      toJSON: function () {
        return { ...this };
      }
    };

    test('should register new user successfully', async () => {
      userRepository.exists.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashed_password');
      userRepository.create.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('mock_token');

      const result = await authService.register(mockUserData);

      expect(userRepository.exists).toHaveBeenCalledWith(
        mockUserData.email,
        mockUserData.username
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(mockUserData.password, 10);
      expect(userRepository.create).toHaveBeenCalledWith({
        email: mockUserData.email,
        username: mockUserData.username,
        password_hash: 'hashed_password',
        display_name: mockUserData.display_name,
        country_code: mockUserData.country_code
      });

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.password_hash).toBeUndefined();
      expect(result.token).toBe('mock_token');
      expect(logger.info).toHaveBeenCalled();
    });

    test('should throw error if email already exists', async () => {
      userRepository.exists.mockResolvedValue({
        email: 'test@example.com'
      });

      await expect(authService.register(mockUserData)).rejects.toThrow();

      try {
        await authService.register(mockUserData);
      } catch (error) {
        expect(error.message).toContain('email');
        expect(error.code).toBe('EMAIL_EXISTS');
      }
    });

    test('should throw error if username already exists', async () => {
      userRepository.exists.mockResolvedValue({
        username: 'testuser'
      });

      await expect(authService.register(mockUserData)).rejects.toThrow();

      try {
        await authService.register(mockUserData);
      } catch (error) {
        expect(error.message).toContain('username');
        expect(error.code).toBe('USERNAME_EXISTS');
      }
    });

    test('should handle null optional fields', async () => {
      const minimalUserData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123'
      };

      userRepository.exists.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashed_password');
      userRepository.create.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('mock_token');

      await authService.register(minimalUserData);

      expect(userRepository.create).toHaveBeenCalledWith({
        email: minimalUserData.email,
        username: minimalUserData.username,
        password_hash: 'hashed_password',
        display_name: null,
        country_code: null
      });
    });
  });

  describe('login', () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      password_hash: 'hashed_password',
      toJSON: function () {
        return { id: this.id, email: this.email };
      }
    };

    test('should login successfully with valid credentials', async () => {
      userRepository.getByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mock_token');

      const result = await authService.login('test@example.com', 'password123');

      expect(userRepository.getByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed_password');
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.password_hash).toBeUndefined();
      expect(logger.info).toHaveBeenCalled();
    });

    test('should throw error if user not found', async () => {
      userRepository.getByEmail.mockResolvedValue(null);

      await expect(
        authService.login('notfound@example.com', 'password123')
      ).rejects.toThrow();

      try {
        await authService.login('notfound@example.com', 'password123');
      } catch (error) {
        expect(error.code).toBe('INVALID_CREDENTIALS');
        expect(logger.warn).toHaveBeenCalled();
      }
    });

    test('should throw error if password is incorrect', async () => {
      userRepository.getByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      await expect(
        authService.login('test@example.com', 'wrongpassword')
      ).rejects.toThrow();

      try {
        await authService.login('test@example.com', 'wrongpassword');
      } catch (error) {
        expect(error.code).toBe('INVALID_CREDENTIALS');
        expect(logger.warn).toHaveBeenCalled();
      }
    });
  });

  describe('verifyToken', () => {
    test('should verify valid token', () => {
      const mockDecoded = { userId: 1 };
      jwt.verify.mockReturnValue(mockDecoded);

      const result = authService.verifyToken('valid_token');

      expect(jwt.verify).toHaveBeenCalledWith('valid_token', 'test-secret-key');
      expect(result).toEqual(mockDecoded);
    });

    test('should throw error for expired token', () => {
      const expiredError = new Error('Token expired');
      expiredError.name = 'TokenExpiredError';
      jwt.verify.mockImplementation(() => {
        throw expiredError;
      });

      expect(() => authService.verifyToken('expired_token')).toThrow('Token expirado');
    });

    test('should throw error for invalid token', () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      try {
        authService.verifyToken('invalid_token');
      } catch (error) {
        expect(error.code).toBe('INVALID_TOKEN');
        expect(error.statusCode).toBe(403);
      }
    });
  });

  describe('refreshToken', () => {
    test('should generate new token for user', () => {
      jwt.sign.mockReturnValue('new_token');

      const result = authService.refreshToken(1);

      expect(result).toBe('new_token');
      expect(logger.info).toHaveBeenCalledWith('Token refrescado', { user_id: 1 });
    });
  });

  describe('changePassword', () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com'
    };

    const mockUserWithPassword = {
      id: 1,
      email: 'test@example.com',
      password_hash: 'old_hashed_password'
    };

    test('should change password successfully', async () => {
      userRepository.getById.mockResolvedValue(mockUser);
      userRepository.getByEmail.mockResolvedValue(mockUserWithPassword);
      bcrypt.compare.mockResolvedValue(true);
      bcrypt.hash.mockResolvedValue('new_hashed_password');
      userRepository.updatePassword.mockResolvedValue();

      await authService.changePassword(1, 'oldpassword', 'newpassword');

      expect(userRepository.getById).toHaveBeenCalledWith(1);
      expect(userRepository.getByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('oldpassword', 'old_hashed_password');
      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
      expect(userRepository.updatePassword).toHaveBeenCalledWith(1, 'new_hashed_password');
      expect(logger.info).toHaveBeenCalled();
    });

    test('should throw error if user not found', async () => {
      userRepository.getById.mockResolvedValue(null);

      await expect(
        authService.changePassword(999, 'oldpassword', 'newpassword')
      ).rejects.toThrow();

      try {
        await authService.changePassword(999, 'oldpassword', 'newpassword');
      } catch (error) {
        expect(error.code).toBe('USER_NOT_FOUND');
      }
    });

    test('should throw error if current password is incorrect', async () => {
      userRepository.getById.mockResolvedValue(mockUser);
      userRepository.getByEmail.mockResolvedValue(mockUserWithPassword);
      bcrypt.compare.mockResolvedValue(false);

      await expect(
        authService.changePassword(1, 'wrongpassword', 'newpassword')
      ).rejects.toThrow();

      try {
        await authService.changePassword(1, 'wrongpassword', 'newpassword');
      } catch (error) {
        expect(error.code).toBe('INVALID_PASSWORD');
        expect(logger.warn).toHaveBeenCalled();
      }
    });

    test('should throw error if new password is same as old', async () => {
      userRepository.getById.mockResolvedValue(mockUser);
      userRepository.getByEmail.mockResolvedValue(mockUserWithPassword);
      bcrypt.compare.mockResolvedValue(true);

      await expect(
        authService.changePassword(1, 'password123', 'password123')
      ).rejects.toThrow();

      try {
        await authService.changePassword(1, 'password123', 'password123');
      } catch (error) {
        expect(error.code).toBe('SAME_PASSWORD');
      }
    });
  });

  describe('hashPassword', () => {
    test('should hash password with bcrypt', async () => {
      bcrypt.hash.mockResolvedValue('hashed_password');

      const result = await authService.hashPassword('mypassword');

      expect(bcrypt.hash).toHaveBeenCalledWith('mypassword', 10);
      expect(result).toBe('hashed_password');
    });
  });

  describe('verifyPassword', () => {
    test('should verify correct password', async () => {
      bcrypt.compare.mockResolvedValue(true);

      const result = await authService.verifyPassword('password', 'hash');

      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hash');
      expect(result).toBe(true);
    });

    test('should reject incorrect password', async () => {
      bcrypt.compare.mockResolvedValue(false);

      const result = await authService.verifyPassword('wrongpassword', 'hash');

      expect(result).toBe(false);
    });
  });

  describe('generateToken', () => {
    test('should generate JWT token', () => {
      jwt.sign.mockReturnValue('generated_token');

      const result = authService.generateToken(1);

      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: 1 },
        'test-secret-key',
        { expiresIn: '24h' }
      );
      expect(result).toBe('generated_token');
    });
  });

  describe('getJwtSecret', () => {
    test('should return JWT secret from environment', () => {
      process.env.JWT_SECRET = 'my-secret-key';

      const result = authService.getJwtSecret();

      expect(result).toBe('my-secret-key');
    });

    test('should warn if using default insecure secret in non-production', () => {
      process.env.JWT_SECRET = 'secret-key';
      process.env.NODE_ENV = 'development';

      const result = authService.getJwtSecret();

      expect(result).toBe('secret-key');
      expect(logger.error).toHaveBeenCalled();
    });

    test('should throw error in production if secret not configured', () => {
      jest.clearAllMocks();
      process.env.JWT_SECRET = 'secret-key';
      process.env.NODE_ENV = 'production';

      expect(() => authService.getJwtSecret()).toThrow();

      try {
        authService.getJwtSecret();
      } catch (error) {
        expect(error.message).toContain('JWT_SECRET');
        expect(error.message).toContain('configurado');
      }
    });

    test('should use fallback if no secret configured in development', () => {
      delete process.env.JWT_SECRET;
      process.env.NODE_ENV = 'development';

      const result = authService.getJwtSecret();

      expect(result).toBe('secret-key');
    });
  });

  describe('validatePasswordStrength', () => {
    test('should validate strong password', () => {
      const result = authService.validatePasswordStrength('strongpassword123');

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject password shorter than 8 characters', () => {
      const result = authService.validatePasswordStrength('short');

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('8 caracteres');
    });

    test('should accept password with exactly 8 characters', () => {
      const result = authService.validatePasswordStrength('12345678');

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should return empty errors array for valid password', () => {
      const result = authService.validatePasswordStrength('validpassword');

      expect(result.errors).toEqual([]);
    });
  });

  describe('Error handling and codes', () => {
    test('should throw error with correct code for duplicate email', async () => {
      userRepository.exists.mockResolvedValue({
        email: 'test@example.com'
      });

      try {
        await authService.register({
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123'
        });
      } catch (error) {
        expect(error.code).toBe('EMAIL_EXISTS');
        expect(error.statusCode).toBe(409);
      }
    });

    test('should throw error with correct code for duplicate username', async () => {
      userRepository.exists.mockResolvedValue({
        username: 'testuser'
      });

      try {
        await authService.register({
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123'
        });
      } catch (error) {
        expect(error.code).toBe('USERNAME_EXISTS');
        expect(error.statusCode).toBe(409);
      }
    });

    test('should throw error with correct code for invalid credentials', async () => {
      userRepository.getByEmail.mockResolvedValue(null);

      try {
        await authService.login('test@example.com', 'wrongpassword');
      } catch (error) {
        expect(error.code).toBe('INVALID_CREDENTIALS');
        expect(error.statusCode).toBe(401);
      }
    });

    test('should throw error with correct code for expired token', () => {
      const expiredError = new Error('Token expired');
      expiredError.name = 'TokenExpiredError';
      jwt.verify.mockImplementation(() => {
        throw expiredError;
      });

      try {
        authService.verifyToken('expired_token');
      } catch (error) {
        expect(error.code).toBe('TOKEN_EXPIRED');
        expect(error.statusCode).toBe(401);
      }
    });

    test('should throw error with correct code for invalid token', () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid');
      });

      try {
        authService.verifyToken('invalid_token');
      } catch (error) {
        expect(error.code).toBe('INVALID_TOKEN');
        expect(error.statusCode).toBe(403);
      }
    });
  });
});
