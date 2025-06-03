import { JWTService } from '../singleton/jwt';
import { ApiResponse, ResponseCodes } from '../types';
import { logger } from '../singleton/logger';

/**
 * JWT Authentication middleware
 * Validates JWT token in Authorization header
 */
export function authMiddleware() {
  return async (ctx: any, next: any) => {
    try {
      const authHeader = ctx.get('Authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        logger.security.warn('Missing or invalid authorization header', {
          requestId: (ctx as any).requestId,
          url: ctx.url,
          method: ctx.method,
          ip: ctx.ip,
          authHeader: authHeader ? 'present but invalid format' : 'missing'
        });

        const response: ApiResponse<null> = {
          code: ResponseCodes.UNAUTHORIZED,
          msg: 'Authorization token required',
          data: null
        };
        
        ctx.status = 200; // Always return 200 as per API design
        ctx.body = response;
        return;
      }      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      const decoded = await JWTService.verifyToken(token);

      if (!decoded) {
        logger.security.warn('Invalid or expired JWT token', {
          requestId: (ctx as any).requestId,
          url: ctx.url,
          method: ctx.method,
          ip: ctx.ip
        });

        const response: ApiResponse<null> = {
          code: ResponseCodes.INVALID_TOKEN,
          msg: 'Invalid or expired token',
          data: null
        };
        
        ctx.status = 200;
        ctx.body = response;
        return;
      }      // Add decoded token data to context for use in routes
      (ctx as any).user = decoded;
      
      logger.security.info('User authenticated successfully', {
        requestId: (ctx as any).requestId,
        user_id: decoded.user_id,
        device_id: decoded.device_id,
        app_id: decoded.app_id
      });

      await next();    } catch (error) {
      logger.security.error('Authentication middleware error', error as Error, {
        requestId: (ctx as any).requestId,
        url: ctx.url,
        method: ctx.method
      });

      const response: ApiResponse<null> = {
        code: ResponseCodes.INTERNAL_SERVER_ERROR,
        msg: 'Authentication error',
        data: null
      };
      
      ctx.status = 200;
      ctx.body = response;
    }
  };
}

/**
 * Optional authentication middleware
 * Adds user info to context if token is valid, but doesn't block request if invalid
 */
export function optionalAuthMiddleware() {
  return async (ctx: any, next: any) => {
    try {
      const authHeader = ctx.get('Authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const decoded = await JWTService.verifyToken(token);
          if (decoded) {
          (ctx as any).user = decoded;
          logger.security.info('Optional auth: User authenticated', {
            requestId: (ctx as any).requestId,
            user_id: decoded.user_id,
            device_id: decoded.device_id
          });
        }
      }

      await next();    } catch (error) {
      logger.security.error('Optional authentication middleware error', error as Error);
      // Continue execution even if authentication fails
      await next();
    }
  };
}
