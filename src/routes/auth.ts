import Router from 'koa-router';
import { LoginRequest, LoginResponse, ApiResponse, ResponseCodes, AppUser, JWTPayload } from '../types';
import { logger } from '../utils/logger';
import { JWTService } from '../utils/jwt';
import { UserAuthService } from '../services/userAuth';
import { authMiddleware } from '../middleware/auth';

const router = new Router({ prefix: '/auth' });

/**
 * POST /auth/login - User login/register
 * Registers new user or logs in existing user based on device_id
 */
router.post('/login', async (ctx: any) => {
  try {
    const loginData: LoginRequest = ctx.request.body as LoginRequest;
    const clientIP = getClientIP(ctx);

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
    const validationError = validateLoginRequest(loginData);
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
    const existingUser = await UserAuthService.findUserByDeviceId(loginData.device_id);

    if (existingUser) {
      // Update existing user's login info
      await UserAuthService.updateUserLoginInfo(existingUser.user_id, loginData, clientIP);
      user = existingUser;
      
      logger.business.info('Existing user login', {
        requestId: (ctx as any).requestId,
        user_id: user.user_id,
        device_id: user.device_id,
        app_id: user.app_id
      });
    } else {
      // Create new user
      user = await UserAuthService.createUser(loginData, clientIP);
      
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
});

/**
 * GET /auth/user - Get current user info
 * Requires valid JWT token in Authorization header
 */
router.get('/user', authMiddleware(), async (ctx: any) => {
  try {
    const userPayload = (ctx as any).user as JWTPayload;

    logger.business.info('Get user info request', {
      requestId: (ctx as any).requestId,
      user_id: userPayload.user_id,
      device_id: userPayload.device_id
    });

    // Get current user data from database
    const user = await UserAuthService.findUserByDeviceId(userPayload.device_id);

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
});

/**
 * Validate login request data
 */
function validateLoginRequest(data: LoginRequest): string | null {
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
function getClientIP(ctx: any): string {
  return (
    ctx.get('X-Forwarded-For') ||
    ctx.get('X-Real-IP') ||
    ctx.get('X-Client-IP') ||
    ctx.ip ||
    'unknown'
  );
}

export default router;
