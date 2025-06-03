/**
 * Auth Entity - Authentication related types and interfaces
 */

import { AppUser } from '../user/user.entity';

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
