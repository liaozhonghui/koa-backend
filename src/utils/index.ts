import { User, ApiResponse } from '../types';

/**
 * Utility functions for user operations
 */
export class UserService {
  /**
   * Validates user email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validates user data for creation
   */
  static validateCreateUser(data: any): { isValid: boolean; errors: string[] } {
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
  static createResponse<T>(
    success: boolean,
    data?: T,
    message?: string,
    error?: string
  ): ApiResponse<T> {
    const response: ApiResponse<T> = { success };
    
    if (data !== undefined) response.data = data;
    if (message) response.message = message;
    if (error) response.error = error;
    
    return response;
  }

  /**
   * Sanitizes user data by removing sensitive information
   */
  static sanitizeUser(user: User): Omit<User, 'id'> & { id?: number } {
    const { ...sanitizedUser } = user;
    return sanitizedUser;
  }

  /**
   * Generates a unique ID (simple implementation for demo)
   */
  static generateId(existingUsers: User[]): number {
    const maxId = existingUsers.reduce((max, user) => Math.max(max, user.id), 0);
    return maxId + 1;
  }
}

/**
 * Error handling utilities
 */
export class ErrorHandler {
  /**
   * Creates a standardized error response
   */
  static createErrorResponse(message: string): ApiResponse {
    return {
      success: false,
      error: message
    };
  }

  /**
   * Handles different types of errors
   */
  static handleError(error: unknown): { message: string; status: number } {
    if (error instanceof Error) {
      return {
        message: error.message,
        status: 500
      };
    }
    
    return {
      message: 'An unknown error occurred',
      status: 500
    };
  }
}

/**
 * Logging utilities
 */
export class Logger {
  private static formatTimestamp(): string {
    return new Date().toISOString();
  }

  static info(message: string, meta?: Record<string, any>): void {
    console.log(`[${this.formatTimestamp()}] INFO: ${message}`, meta ? JSON.stringify(meta) : '');
  }

  static error(message: string, error?: unknown): void {
    console.error(`[${this.formatTimestamp()}] ERROR: ${message}`, error);
  }

  static warn(message: string, meta?: Record<string, any>): void {
    console.warn(`[${this.formatTimestamp()}] WARN: ${message}`, meta ? JSON.stringify(meta) : '');
  }
}
