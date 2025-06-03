export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CreateUserRequest {
  name: string;
  email: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
}

export interface ApiError {
  message: string;
  status: number;
}

export interface HealthCheckResponse {
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

export interface StatusResponse {
  status: string;
  uptime: number;
  timestamp: string;
  environment: string;
  version: string;
}

export interface InfoResponse {
  name: string;
  description: string;
  version: string;
  author: string;
  endpoints: Record<string, string>;
}

export interface EchoResponse {
  success: boolean;
  echo: any;
  timestamp: string;
  method: string;
  url: string;
}
