import { Pool } from 'pg';
import Database from '../database';
import { AppUser, LoginRequest } from '../types';
import { logger } from '../utils/logger';

export class UserAuthService {
  private static db: Pool;

  static async initialize() {
    const database = Database.getInstance();
    this.db = database.getPool();
  }

  /**
   * Find user by device_id
   */
  static async findUserByDeviceId(deviceId: string): Promise<AppUser | null> {
    try {
      if (!this.db) {
        await this.initialize();
      }

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
        WHERE device_id = $1 AND (is_deleted = false OR is_deleted IS NULL)
      `;

      const result = await this.db.query(query, [deviceId]);
      
      if (result.rows.length > 0) {
        const user = result.rows[0] as AppUser;
        logger.database.debug('User found by device_id', {
          device_id: deviceId,
          user_id: user.user_id
        });
        return user;
      }

      logger.database.debug('No user found with device_id', { device_id: deviceId });
      return null;    } catch (error) {
      logger.database.error('Error finding user by device_id', error as Error, { device_id: deviceId });
      throw error;
    }
  }

  /**
   * Create new user from login request
   */
  static async createUser(loginData: LoginRequest, ip?: string): Promise<AppUser> {
    try {
      if (!this.db) {
        await this.initialize();
      }

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
        loginData.origin_language || null,         // origin_language
        loginData.simulator || false,              // simulator
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

      return newUser;    } catch (error) {
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
  static async updateUserLoginInfo(userId: string, loginData: LoginRequest, ip?: string): Promise<void> {
    try {
      if (!this.db) {
        await this.initialize();
      }

      const now = Date.now();
      const clientVersionInt = loginData.client_version ? 
        parseInt(loginData.client_version.replace(/\./g, '')) : null;

      const query = `
        UPDATE public."user" 
        SET 
          last_active_time = $1,
          client_version = $2,
          client_version_int = $3,
          os_version = $4,
          firebase_token = $5,
          ip = COALESCE($6, ip),
          carrier = COALESCE($7, carrier)
        WHERE user_id = $8
      `;

      await this.db.query(query, [
        now,                                       // last_active_time
        loginData.client_version,                  // client_version
        clientVersionInt,                          // client_version_int
        loginData.os_version,                      // os_version
        loginData.firebase_token || null,          // firebase_token
        ip || null,                                // ip
        loginData.carrier || null,                 // carrier
        userId                                     // user_id
      ]);

      logger.business.debug('User login info updated', {
        user_id: userId,
        client_version: loginData.client_version
      });    } catch (error) {
      logger.database.error('Error updating user login info', error as Error, { user_id: userId });
      throw error;
    }
  }
}
