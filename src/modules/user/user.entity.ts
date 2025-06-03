/**
 * User Entity - Represents the structure of a user in the system
 */
export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * App User Entity - Represents the structure of app users from database
 */
export interface AppUser {
  id?: number;
  user_id: string;
  device_id: string;
  app_id: string;
  device_brand: string;
  device_model: string;
  os: string;
  os_version: string;
  client_version?: string;
  client_version_int?: number;
  carrier?: string;
  mac?: string;
  imei?: string;
  android_id?: string;
  ga_id?: string;
  time_zone?: string;
  origin_language?: string;
  simulator?: boolean;
  install_time?: number;
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
  bind_info?: string;
  first_ip?: string;
  first_ip_country_code?: string;
  last_checkin_timestamp?: number;
  consecutive_checkin_days?: number;
  subscription?: string;
  subscription_times?: number;
  last_active_time?: number;
  activedays?: number;
  user_consecutive_active_days?: number;
  user_category_ids?: string;
  ref?: string;
}

/**
 * Create User Request DTO
 */
export interface CreateUserRequest {
  name: string;
  email: string;
}

/**
 * Update User Request DTO
 */
export interface UpdateUserRequest {
  name?: string;
  email?: string;
}
