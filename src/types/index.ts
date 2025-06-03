// Re-export user entities from modules
export { User, CreateUserRequest, UpdateUserRequest, AppUser } from '../modules/user/user.entity';

// Re-export auth entities from modules  
export { LoginRequest, LoginResponse, JWTPayload } from '../modules/auth/auth.entity';

// Import and re-export error codes from utils
import { ErrorCode } from '../utils/errorCodes';
export { ErrorCode };

// Deprecated: Use ErrorCode instead
export const ResponseCodes = ErrorCode;

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
