import { ApiResponse } from '../types';

/**
 * Error handling utilities for middleware
 */
export class ErrorHandler {
  /**
   * Creates a standardized error response
   */
  static createErrorResponse(message: string, code: number = 500): ApiResponse<null> {
    return {
      code,
      msg: message,
      data: null
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
