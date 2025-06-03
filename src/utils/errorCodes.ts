/**
 * Error Code definitions for API responses
 * Centralized error code management
 */
export const ErrorCode = {
  // HTTP equivalent codes (200-500)
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,

  // Business logic codes (600-1000)
  VALIDATION_ERROR: 600,
  USER_NOT_FOUND: 601,
  USER_ALREADY_EXISTS: 602,
  INVALID_EMAIL_FORMAT: 603,
  INVALID_TOKEN: 604,
  TOKEN_EXPIRED: 605,
  DEVICE_NOT_AUTHORIZED: 606,
  DATABASE_CONNECTION_ERROR: 700,
  EXTERNAL_SERVICE_ERROR: 701,
} as const;

// Type for error codes
export type ErrorCodeType = typeof ErrorCode[keyof typeof ErrorCode];
