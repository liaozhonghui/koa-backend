import { ApiResponse, ResponseCodes } from '../types';

/**
 * Utility functions for creating standardized API responses
 */

/**
 * Create a success response
 */
export function createSuccessResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    code: ResponseCodes.SUCCESS,
    msg: message || 'Success',
    data
  };
}

/**
 * Create a created response (for POST operations)
 */
export function createCreatedResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    code: ResponseCodes.CREATED,
    msg: message || 'Resource created successfully',
    data
  };
}

/**
 * Create an error response
 */
export function createErrorResponse(code: number, message: string): ApiResponse<null> {
  return {
    code,
    msg: message,
    data: null
  };
}

/**
 * Create a validation error response
 */
export function createValidationErrorResponse(message?: string): ApiResponse<null> {
  return {
    code: ResponseCodes.VALIDATION_ERROR,
    msg: message || 'Validation failed',
    data: null
  };
}

/**
 * Create a not found error response
 */
export function createNotFoundResponse(message?: string): ApiResponse<null> {
  return {
    code: ResponseCodes.NOT_FOUND,
    msg: message || 'Resource not found',
    data: null
  };
}

/**
 * Create a user not found error response (business logic)
 */
export function createUserNotFoundResponse(): ApiResponse<null> {
  return {
    code: ResponseCodes.USER_NOT_FOUND,
    msg: 'User not found',
    data: null
  };
}

/**
 * Create an internal server error response
 */
export function createServerErrorResponse(message?: string, isProduction = false): ApiResponse<null> {
  return {
    code: ResponseCodes.INTERNAL_SERVER_ERROR,
    msg: isProduction ? 'Internal Server Error' : (message || 'Internal Server Error'),
    data: null
  };
}
