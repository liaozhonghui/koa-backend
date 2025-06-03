import { logger } from '../utils/logger';

/**
 * 404 Not Found filter
 * Handles requests that don't match any routes
 */
export function notFoundFilter() {
  return async (ctx: any, next: any) => {
    await next();
    
    // If no route was matched and no response body was set
    if (ctx.status === 404 || (!ctx.body && ctx.status === 404)) {
      ctx.status = 404;
      
      // Log the 404 with context
      logger.http.warn('Route not found', {
        requestId: ctx.requestId,
        method: ctx.method,
        url: ctx.url,
        userAgent: ctx.get('User-Agent'),
        ip: ctx.ip,
        referer: ctx.get('Referer')
      });
      
      ctx.body = {
        error: {
          message: "Not Found",
          status: 404,
          path: ctx.url,
          method: ctx.method,
          timestamp: new Date().toISOString(),
          requestId: ctx.requestId
        }
      };
    }
  };
}

export default notFoundFilter;
