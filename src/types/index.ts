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

// User Authentication Types
export interface AppUser {
  id: number;
  user_id: string;
  device_id: string;
  app_id: string;
  device_brand: string;
  device_model: string;
  os: string;
  os_version: string;
  client_version: string;
  client_version_int?: number;
  carrier?: string;
  mac?: string;
  imei?: string;
  android_id?: string;
  ga_id?: string;
  time_zone?: string;
  origin_language?: string;
  simulator?: boolean;
  install_time?: string;
  firebase_token?: string;
  language?: string;
  ip?: string;
  ip_country_code?: string;
  gender?: string;
  height?: number;
  weight?: number;
  birthday?: string;
  nickname?: string;
  avatar?: string;
  register_time?: number;
  create_time?: number;
  is_deleted?: boolean;
  bind_type?: string;
  bind_id?: string;
  bind_info?: any;
  first_ip?: string;
  first_ip_country_code?: string;
  last_checkin_timestamp?: number;
  consecutive_checkin_days?: number;
  subscription?: any;
  subscription_times?: number;
  last_active_time?: number;
  activedays?: number;
  user_consecutive_active_days?: number;
  user_category_ids?: string[];
  ref?: any;
}

export interface LoginRequest {
  android_id?: string;
  app_id: string;
  carrier?: string;
  chid?: string;
  client_version: string;
  current_language?: string;
  device_brand: string;
  device_id: string;
  device_model: string;
  email?: string;
  first_name?: string;
  ga_id?: string;
  imei?: string;
  install_time?: string;
  last_name?: string;
  launch_num?: number;
  mac?: string;
  mchid?: string;
  origin_language?: string;
  os: string;
  os_version: string;
  simulator?: boolean;
  time_zone?: string;
  login_status?: string;
  use_burned_calories?: boolean;
  firebase_token?: string;
}

export interface LoginResponse {
  token: string;
  user: AppUser;
  expires_in: number;
}

export interface JWTPayload {
  user_id: string;
  device_id: string;
  app_id: string;
  iat: number;
  exp: number;
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
