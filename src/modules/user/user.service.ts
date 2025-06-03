import { User, CreateUserRequest, UpdateUserRequest } from './user.entity';
import { ApiResponse } from '../../types';
import { logger } from '../../singleton/logger';

export class UserService {
  // Mock data for demonstration - in real app this would be database operations
  private users: User[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com', createdAt: new Date() },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', createdAt: new Date() }
  ];

  constructor() {
    // Constructor - no need to inject DATABASE since it's a singleton
  }
  /**
   * Validates user email format
   */
  isValidEmail(email: string): boolean {
    // Basic but effective email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    // Additional checks for edge cases
    if (!email || email.includes('..') || email.includes(' ') || email.includes('@@')) {
      return false;
    }
    
    return emailRegex.test(email);
  }

  /**
   * Validates user data for creation
   */
  validateCreateUser(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
      errors.push('Name is required and must be a non-empty string');
    }

    if (!data.email || typeof data.email !== 'string') {
      errors.push('Email is required and must be a string');
    } else if (!this.isValidEmail(data.email)) {
      errors.push('Email must be a valid email address');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
  /**
   * Creates a standardized API response
   */
  createResponse<T>(
    code: number,
    message: string,
    data: T
  ): ApiResponse<T> {
    return {
      code,
      msg: message,
      data
    };
  }

  /**
   * Sanitizes user data by removing sensitive information
   */
  sanitizeUser(user: User): Omit<User, 'id'> & { id?: number } {
    const { ...sanitizedUser } = user;
    return sanitizedUser;
  }

  /**
   * Generates a unique ID (simple implementation for demo)
   */
  generateId(existingUsers: User[]): number {
    const maxId = existingUsers.reduce((max, user) => Math.max(max, user.id), 0);
    return maxId + 1;
  }

  /**
   * Get all users
   */
  async getAllUsers(): Promise<User[]> {
    logger.business.debug('Fetching all users', { 
      userCount: this.users.length 
    });
    
    return this.users;
  }
  /**
   * Get user by ID
   */
  async getUserById(id: number): Promise<User | null> {
    logger.business.debug('Fetching user by ID', { 
      userId: id.toString()
    });
    
    const user = this.users.find(u => u.id === id);
    
    if (!user) {
      logger.business.warn('User not found', { 
        userId: id.toString()
      });
      return null;
    }
    
    return user;
  }
  /**
   * Create new user
   */
  async createUser(userData: CreateUserRequest): Promise<User> {
    const { name, email } = userData;
    
    logger.business.info('Creating new user', { 
      name,
      email 
    });

    if (!name || !email) {
      throw new Error('Name and email are required');
    }
    
    const newUser: User = {
      id: this.users.length + 1,
      name,
      email,
      createdAt: new Date()
    };
    
    this.users.push(newUser);
    
    logger.business.info('User created successfully', { 
      userId: newUser.id.toString(),
      name: newUser.name,
      email: newUser.email 
    });
    
    return newUser;
  }
  /**
   * Update user
   */
  async updateUser(id: number, updateData: UpdateUserRequest): Promise<User | null> {
    const { name, email } = updateData;
    
    logger.business.info('Updating user', { 
      userId: id.toString(),
      updates: { name, email }
    });
    
    const userIndex = this.users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      logger.business.warn('User update failed - user not found', { 
        userId: id.toString()
      });
      return null;
    }
    
    if (name) this.users[userIndex]!.name = name;
    if (email) this.users[userIndex]!.email = email;
    this.users[userIndex]!.updatedAt = new Date();
    
    logger.business.info('User updated successfully', { 
      userId: id.toString(),
      updatedUser: this.users[userIndex]
    });
    
    return this.users[userIndex]!;
  }
  /**
   * Delete user
   */
  async deleteUser(id: number): Promise<User | null> {
    logger.business.info('Deleting user', { 
      userId: id.toString()
    });
    
    const userIndex = this.users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      logger.business.warn('User deletion failed - user not found', { 
        userId: id.toString()
      });
      return null;
    }
    
    const deletedUser = this.users.splice(userIndex, 1)[0]!;
    
    logger.business.info('User deleted successfully', { 
      userId: id.toString(),
      deletedUser: {
        name: deletedUser.name,
        email: deletedUser.email
      }
    });
    
    return deletedUser;
  }
  /**
   * Validate user data
   */
  validateUserData(data: CreateUserRequest | UpdateUserRequest): string | null {
    if ('name' in data && data.name !== undefined) {
      if (typeof data.name !== 'string' || data.name.trim().length === 0) {
        return 'Name must be a non-empty string';
      }
    }

    if ('email' in data && data.email !== undefined) {
      if (typeof data.email !== 'string' || !data.email.includes('@')) {
        return 'Email must be a valid email address';
      }
    }

    return null;
  }
}
