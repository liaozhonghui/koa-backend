import { Pool } from 'pg';
import Database from '../../singleton/database';
import { LoginRequest } from './auth.entity';
import { AppUser } from '../user/user.entity';
import { logger } from '../../singleton/logger';

export class AuthService {
  private db: Pool;

  constructor() {
    const database = Database.getInstance();
    this.db = database.getPool();
  }
  /**
   * Find user by device_id
   */
  async findUserByDeviceId(deviceId: string): Promise<AppUser | null> {
    try {
      const query = `
        SELECT 
          id, user_id, device_id, app_id, device_brand, device_model, os, os_version,
          client_version, client_version_int, carrier, mac, imei, android_id, ga_id,
          time_zone, origin_language, simulator, install_time, firebase_token, language,
          ip, ip_country_code, gender, height, weight, birthday, nickname, avatar,
          register_time, create_time, is_deleted, bind_type, bind_id, bind_info,
          first_ip, first_ip_country_code, last_checkin_timestamp, consecutive_checkin_days,
          subscription, subscription_times, last_active_time, activedays,
          user_consecutive_active_days, user_category_ids, ref
        FROM public."user" 
        WHERE device_id = $1 AND is_deleted = false
      `;

      const result = await this.db.query(query, [deviceId]);
      
      if (result.rows.length === 0) {
        logger.business.debug('User not found by device_id', { device_id: deviceId });
        return null;
      }

      const user = result.rows[0] as AppUser;
      logger.business.debug('User found by device_id', { 
        user_id: user.user_id, 
        device_id: user.device_id 
      });
      
      return user;
    } catch (error) {
      logger.database.error('Error finding user by device_id', error as Error, { device_id: deviceId });
      throw error;
    }
  }
  /**
   * Create new user from login request
   */
  async createUser(loginData: LoginRequest, ip?: string): Promise<AppUser> {
    try {
      const now = Date.now();
      const userId = `user_${loginData.device_id}_${now}`;

      const query = `
        INSERT INTO public."user" (
          user_id, device_id, app_id, device_brand, device_model, os, os_version,
          client_version, client_version_int, carrier, mac, imei, android_id, ga_id,
          time_zone, origin_language, simulator, install_time, firebase_token,
          ip, register_time, create_time, is_deleted
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
        ) RETURNING *
      `;

      const clientVersionInt = loginData.client_version ? 
        parseInt(loginData.client_version.replace(/\./g, '')) : null;

      const values = [
        userId,                                    // user_id
        loginData.device_id,                       // device_id
        loginData.app_id,                          // app_id
        loginData.device_brand,                    // device_brand
        loginData.device_model,                    // device_model
        loginData.os,                              // os
        loginData.os_version,                      // os_version
        loginData.client_version,                  // client_version
        clientVersionInt,                          // client_version_int
        loginData.carrier || null,                 // carrier
        loginData.mac || null,                     // mac
        loginData.imei || null,                    // imei
        loginData.android_id || null,              // android_id
        loginData.ga_id || null,                   // ga_id
        loginData.time_zone || null,               // time_zone
        loginData.origin_language || null,         // origin_language        loginData.simulator || false,              // simulator
        loginData.install_time || null,            // install_time
        loginData.firebase_token || null,          // firebase_token
        ip || null,                                // ip
        now,                                       // register_time
        now,                                       // create_time
        false                                      // is_deleted
      ];

      const result = await this.db.query(query, values);
      const newUser = result.rows[0] as AppUser;

      logger.business.info('New user created', {
        user_id: newUser.user_id,
        device_id: newUser.device_id,
        app_id: newUser.app_id,
        os: newUser.os,
        device_brand: newUser.device_brand
      });

      return newUser;
    } catch (error) {
      logger.database.error('Error creating user', error as Error, {
        device_id: loginData.device_id,
        app_id: loginData.app_id
      });
      throw error;
    }
  }
  /**
   * Update user's last active time and login info
   */
  async updateUserLoginInfo(userId: string, loginData: LoginRequest, ip?: string): Promise<void> {
    try {
      const now = Date.now();

      const query = `
        UPDATE public."user" 
        SET 
          last_active_time = $1,
          client_version = $2,
          client_version_int = $3,
          os_version = $4,
          firebase_token = $5,
          ip = $6,
          carrier = $7
        WHERE user_id = $8
      `;

      const clientVersionInt = loginData.client_version ? 
        parseInt(loginData.client_version.replace(/\./g, '')) : null;

      const values = [
        now,                                       // last_active_time
        loginData.client_version,                  // client_version
        clientVersionInt,                          // client_version_int
        loginData.os_version,                      // os_version
        loginData.firebase_token || null,          // firebase_token
        ip || null,                                // ip
        loginData.carrier || null,                 // carrier
        userId                                     // user_id
      ];

      await this.db.query(query, values);

      logger.business.debug('User login info updated', {
        user_id: userId,
        client_version: loginData.client_version
      });
    } catch (error) {
      logger.database.error('Error updating user login info', error as Error, { user_id: userId });
      throw error;
    }
  }
  /**
   * Validate login request data
   */
  validateLoginRequest(data: LoginRequest): string | null {
    if (!data.device_id || typeof data.device_id !== 'string') {
      return 'device_id is required and must be a string';
    }

    if (!data.app_id || typeof data.app_id !== 'string') {
      return 'app_id is required and must be a string';
    }

    if (!data.device_brand || typeof data.device_brand !== 'string') {
      return 'device_brand is required and must be a string';
    }

    if (!data.device_model || typeof data.device_model !== 'string') {
      return 'device_model is required and must be a string';
    }

    if (!data.os || typeof data.os !== 'string') {
      return 'os is required and must be a string';
    }

    if (!data.os_version || typeof data.os_version !== 'string') {
      return 'os_version is required and must be a string';
    }

    if (!data.client_version || typeof data.client_version !== 'string') {
      return 'client_version is required and must be a string';
    }

    return null;
  }

  /**
   * Get client IP address from request
   */
  getClientIP(ctx: any): string {
    return (
      ctx.get('X-Forwarded-For') ||
      ctx.get('X-Real-IP') ||
      ctx.get('X-Client-IP') ||
      ctx.ip ||
      'unknown'
    );
  }
}
