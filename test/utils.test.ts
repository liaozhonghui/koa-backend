import { UserService, ErrorHandler, Logger } from '../src/utils';
import { User } from '../src/types';

describe('UserService Unit Tests', () => {
  describe('isValidEmail', () => {
    it('should return true for valid email addresses', () => {
      const validEmails = [
        'user@example.com',
        'test.email@domain.org',
        'user+tag@example.co.uk',
        'simple@test.io'
      ];

      validEmails.forEach(email => {
        expect(UserService.isValidEmail(email)).toBe(true);
      });
    });    it('should return false for invalid email addresses', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user@@example.com',
        'user..email@example.com',
        '',
        'user@example',
        'user name@example.com'
      ];

      invalidEmails.forEach(email => {
        const result = UserService.isValidEmail(email);
        expect(result).toBe(false);
      });
    });
  });

  describe('validateCreateUser', () => {
    it('should return valid for correct user data', () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com'
      };

      const result = UserService.validateCreateUser(userData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors for missing name', () => {
      const userData = {
        email: 'john@example.com'
      };

      const result = UserService.validateCreateUser(userData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Name is required and must be a non-empty string');
    });

    it('should return errors for empty name', () => {
      const userData = {
        name: '   ',
        email: 'john@example.com'
      };

      const result = UserService.validateCreateUser(userData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Name is required and must be a non-empty string');
    });

    it('should return errors for missing email', () => {
      const userData = {
        name: 'John Doe'
      };

      const result = UserService.validateCreateUser(userData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email is required and must be a string');
    });

    it('should return errors for invalid email', () => {
      const userData = {
        name: 'John Doe',
        email: 'invalid-email'
      };

      const result = UserService.validateCreateUser(userData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email must be a valid email address');
    });

    it('should return multiple errors for invalid data', () => {
      const userData = {
        name: '',
        email: 'invalid'
      };

      const result = UserService.validateCreateUser(userData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
    });
  });
  describe('createResponse', () => {
    it('should create success response with data', () => {
      const data = { id: 1, name: 'Test' };
      const response = UserService.createResponse(200, 'Success', data);

      expect(response.code).toBe(200);
      expect(response.msg).toBe('Success');
      expect(response.data).toEqual(data);
    });

    it('should create error response', () => {
      const response = UserService.createResponse(500, 'Error occurred', null);

      expect(response.code).toBe(500);
      expect(response.msg).toBe('Error occurred');
      expect(response.data).toBe(null);
    });
  });

  describe('sanitizeUser', () => {
    it('should return user data without sensitive information', () => {
      const user: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: new Date()
      };

      const sanitized = UserService.sanitizeUser(user);
      expect(sanitized).toEqual(user); // In this case, no sensitive data to remove
    });
  });

  describe('generateId', () => {
    it('should generate next ID for empty array', () => {
      const users: User[] = [];
      const newId = UserService.generateId(users);
      expect(newId).toBe(1);
    });

    it('should generate next ID for existing users', () => {
      const users: User[] = [
        { id: 1, name: 'User 1', email: 'user1@example.com', createdAt: new Date() },
        { id: 3, name: 'User 3', email: 'user3@example.com', createdAt: new Date() },
        { id: 2, name: 'User 2', email: 'user2@example.com', createdAt: new Date() }
      ];
      const newId = UserService.generateId(users);
      expect(newId).toBe(4);
    });
  });
});

describe('ErrorHandler Unit Tests', () => {
  describe('createErrorResponse', () => {
    it('should create standardized error response', () => {
      const message = 'Something went wrong';
      const response = ErrorHandler.createErrorResponse(message);

      expect(response.code).toBe(500);
      expect(response.msg).toBe(message);
      expect(response.data).toBe(null);
    });

    it('should create error response with custom code', () => {
      const message = 'Validation error';
      const code = 400;
      const response = ErrorHandler.createErrorResponse(message, code);

      expect(response.code).toBe(code);
      expect(response.msg).toBe(message);
      expect(response.data).toBe(null);
    });
  });

  describe('handleError', () => {
    it('should handle Error instances', () => {
      const error = new Error('Test error');
      const result = ErrorHandler.handleError(error);

      expect(result.message).toBe('Test error');
      expect(result.status).toBe(500);
    });

    it('should handle unknown errors', () => {
      const error = 'String error';
      const result = ErrorHandler.handleError(error);

      expect(result.message).toBe('An unknown error occurred');
      expect(result.status).toBe(500);
    });
  });
});

describe('Logger Unit Tests', () => {
  // Mock console methods
  const originalConsole = { ...console };
  beforeEach(() => {
    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();
  });

  afterEach(() => {
    console.log = originalConsole.log;
    console.error = originalConsole.error;
    console.warn = originalConsole.warn;
  });

  describe('info', () => {
    it('should log info message', () => {
      Logger.info('Test message');
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('INFO: Test message'),
        ''
      );
    });

    it('should log info message with metadata', () => {
      const meta = { userId: 123 };
      Logger.info('Test message', meta);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('INFO: Test message'),
        JSON.stringify(meta)
      );
    });
  });

  describe('error', () => {
    it('should log error message', () => {
      const error = new Error('Test error');
      Logger.error('Error occurred', error);
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('ERROR: Error occurred'),
        error
      );
    });
  });

  describe('warn', () => {
    it('should log warning message', () => {
      Logger.warn('Warning message');
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('WARN: Warning message'),
        ''
      );
    });
  });
});
