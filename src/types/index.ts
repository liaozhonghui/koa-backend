// Re-export user entities from modules
export { User, CreateUserRequest, UpdateUserRequest, AppUser } from '../modules/user/user.entity';

// Re-export auth entities from modules  
export { LoginRequest, LoginResponse, JWTPayload } from '../modules/auth/auth.entity';

export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

export interface ApiError {
  message: string;
  status: number;
}

export interface HealthCheckData {
  message: string;
  version: string;
  timestamp: string;
  database?: {
    connected: boolean;
    host: string;
    dbname: string;
    reconnectAttempts?: number;
    status?: string;
  };
}

export interface StatusData {
  status: string;
  uptime: number;
  timestamp: string;
  environment: string;
  version: string;
}

export interface InfoData {
  name: string;
  description: string;
  version: string;
  author: string;
  endpoints: Record<string, string>;
}

export interface EchoData {
  echo: any;
  timestamp: string;
  method: string;
  url: string;
}



// API Response Codes
export const ResponseCodes = {
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
