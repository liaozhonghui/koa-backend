import { logger } from '../singleton/logger';
import { ApiResponse, ResponseCodes } from '../types';

/**
 * 404 Not Found filter
 * Handles requests that don't match any routes
 */
export function notFoundFilter() {
  return async (ctx: any, next: any) => {
    await next();
      // If no route was matched and no response body was set
    if (ctx.status === 404 || (!ctx.body && ctx.status === 404)) {
      // Always return HTTP 200 with not found error code
      ctx.status = 200;
      
      // Log the 404 with context
      logger.http.warn('Route not found', {
        requestId: ctx.requestId,
        method: ctx.method,
        url: ctx.url,
        userAgent: ctx.get('User-Agent'),
        ip: ctx.ip,
        referer: ctx.get('Referer')
      });
      
      const response: ApiResponse<null> = {
        code: ResponseCodes.NOT_FOUND,
        msg: "Route not found",
        data: null
      };
      
      ctx.body = response;
    }
  };
}

export default notFoundFilter;
