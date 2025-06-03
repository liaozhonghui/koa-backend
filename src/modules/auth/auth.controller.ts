import { LoginRequest, LoginResponse, JWTPayload } from './auth.entity';
import { ApiResponse, ResponseCodes } from '../../types';
import { AppUser } from '../user/user.entity';
import { logger } from '../../singleton/logger';
import { JWTService } from '../../singleton/jwt';
import { AuthService } from './auth.service';

export class AuthController {
  /**
   * POST /auth/login - User login/register
   * Registers new user or logs in existing user based on device_id
   */
  static async login(ctx: any) {
    try {
      const loginData: LoginRequest = ctx.request.body as LoginRequest;
      const clientIP = AuthService.getClientIP(ctx);

      logger.business.info('Login attempt', {
        requestId: (ctx as any).requestId,
        device_id: loginData.device_id,
        app_id: loginData.app_id,
        os: loginData.os,
        device_brand: loginData.device_brand,
        client_version: loginData.client_version,
        ip: clientIP
      });

      // Validate required fields
      const validationError = AuthService.validateLoginRequest(loginData);
      if (validationError) {
        logger.business.warn('Login validation failed', {
          requestId: (ctx as any).requestId,
          device_id: loginData.device_id,
          error: validationError
        });

        const response: ApiResponse<null> = {
          code: ResponseCodes.VALIDATION_ERROR,
          msg: validationError,
          data: null
        };
        ctx.body = response;
        return;
      }

      let user: AppUser;

      // Check if user exists by device_id
      const existingUser = await AuthService.findUserByDeviceId(loginData.device_id);

      if (existingUser) {
        // Update existing user's login info
        await AuthService.updateUserLoginInfo(existingUser.user_id, loginData, clientIP);
        user = existingUser;
        
        logger.business.info('Existing user login', {
          requestId: (ctx as any).requestId,
          user_id: user.user_id,
          device_id: user.device_id,
          app_id: user.app_id
        });
      } else {
        // Create new user
        user = await AuthService.createUser(loginData, clientIP);
        
        logger.business.info('New user registered and logged in', {
          requestId: (ctx as any).requestId,
          user_id: user.user_id,
          device_id: user.device_id,
          app_id: user.app_id
        });
      }

      // Generate JWT token
      const tokenPayload = {
        user_id: user.user_id,
        device_id: user.device_id,
        app_id: user.app_id
      };

      const token = JWTService.generateToken(tokenPayload);
      const expiresIn = JWTService.getExpirationTime();

      const loginResponse: LoginResponse = {
        token,
        user,
        expires_in: expiresIn
      };

      const response: ApiResponse<LoginResponse> = {
        code: ResponseCodes.SUCCESS,
        msg: existingUser ? 'Login successful' : 'User registered and logged in successfully',
        data: loginResponse
      };

      ctx.body = response;
    } catch (error) {
      logger.business.error('Login error', error as Error, {
        requestId: (ctx as any).requestId,
        device_id: (ctx.request.body as any)?.device_id
      });

      const response: ApiResponse<null> = {
        code: ResponseCodes.INTERNAL_SERVER_ERROR,
        msg: 'Login failed due to internal error',
        data: null
      };
      ctx.body = response;
    }
  }

  /**
   * GET /auth/user - Get current user info
   * Requires valid JWT token in Authorization header
   */
  static async getUserInfo(ctx: any) {
    try {
      const userPayload = (ctx as any).user as JWTPayload;

      logger.business.info('Get user info request', {
        requestId: (ctx as any).requestId,
        user_id: userPayload.user_id,
        device_id: userPayload.device_id
      });

      // Get current user data from database
      const user = await AuthService.findUserByDeviceId(userPayload.device_id);

      if (!user) {
        logger.business.warn('User not found for valid token', {
          requestId: (ctx as any).requestId,
          user_id: userPayload.user_id,
          device_id: userPayload.device_id
        });

        const response: ApiResponse<null> = {
          code: ResponseCodes.USER_NOT_FOUND,
          msg: 'User not found',
          data: null
        };
        ctx.body = response;
        return;
      }

      // Verify the token belongs to the same user
      if (user.user_id !== userPayload.user_id) {
        logger.security.warn('Token user_id mismatch', {
          requestId: (ctx as any).requestId,
          token_user_id: userPayload.user_id,
          db_user_id: user.user_id,
          device_id: userPayload.device_id
        });

        const response: ApiResponse<null> = {
          code: ResponseCodes.INVALID_TOKEN,
          msg: 'Invalid token',
          data: null
        };
        ctx.body = response;
        return;
      }

      logger.business.info('User info retrieved successfully', {
        requestId: (ctx as any).requestId,
        user_id: user.user_id,
        device_id: user.device_id
      });

      const response: ApiResponse<AppUser> = {
        code: ResponseCodes.SUCCESS,
        msg: 'User information retrieved successfully',
        data: user
      };

      ctx.body = response;
    } catch (error) {
      logger.business.error('Get user info error', error as Error, {
        requestId: (ctx as any).requestId,
        user_id: ((ctx as any).user as JWTPayload)?.user_id
      });

      const response: ApiResponse<null> = {
        code: ResponseCodes.INTERNAL_SERVER_ERROR,
        msg: 'Failed to retrieve user information',
        data: null
      };
      ctx.body = response;
    }
  }
}
