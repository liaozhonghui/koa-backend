import * as jwt from 'jsonwebtoken';
import { SignOptions } from 'jsonwebtoken';
import { JWTPayload } from '../../types';
import { logger } from '../logger';
import config from '../../config';

const JWT_SECRET = config['jwt'].secret;
const JWT_EXPIRES_IN: string | number = config['jwt'].expiresIn;

export class JWTService {  /**
   * Generate JWT token for user
   */  
  static async generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
    try {
      const tokenPayload: Omit<JWTPayload, 'iat' | 'exp'> = {
        user_id: payload.user_id,
        device_id: payload.device_id,
        app_id: payload.app_id,
      };      
      
      const options: SignOptions = {
        expiresIn: JWT_EXPIRES_IN as any,
      };
        const token = await new Promise<string>((resolve, reject) => {
        jwt.sign(tokenPayload, JWT_SECRET, options, (err: any, token: any) => {
          if (err) {
            reject(err);
          } else {
            resolve(token as string);
          }
        });
      });

      logger.security.info('JWT token generated', {
        user_id: payload.user_id,
        device_id: payload.device_id,
        app_id: payload.app_id,
        expiresIn: JWT_EXPIRES_IN
      });

      return token;
    } catch (error) {
      logger.security.error('JWT token generation failed', error as Error);
      throw new Error('Token generation failed');
    }
  }  /**
   * Verify JWT token
   */
  static async verifyToken(token: string): Promise<JWTPayload | null> {
    try {
      const decoded = await new Promise<JWTPayload>((resolve, reject) => {
        jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
          if (err) {
            reject(err);
          } else {
            resolve(decoded as JWTPayload);
          }
        });
      });
      logger.security.info('JWT token verified successfully', {
        user_id: decoded.user_id,
        device_id: decoded.device_id,
        app_id: decoded.app_id
      });

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        logger.security.warn('JWT token expired', { error: error.message });
      } else if (error instanceof jwt.JsonWebTokenError) {
        logger.security.warn('Invalid JWT token', { error: error.message });      } else {
        logger.security.error('JWT token verification failed', error as Error);
      }
      return null;
    }
  }

  /**
   * Get token expiration time in seconds
   */
  static getExpirationTime(): number {
    // Convert JWT_EXPIRES_IN to seconds
    const expiresIn = JWT_EXPIRES_IN;
    if (typeof expiresIn === 'string') {
      const unit = expiresIn.slice(-1);
      const value = parseInt(expiresIn.slice(0, -1));
      
      switch (unit) {
        case 's': return value;
        case 'm': return value * 60;
        case 'h': return value * 60 * 60;
        case 'd': return value * 24 * 60 * 60;
        default: return 7 * 24 * 60 * 60; // Default 7 days
      }
    }
    return 7 * 24 * 60 * 60; // Default 7 days
  }
}
