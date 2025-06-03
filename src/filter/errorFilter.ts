import { logger } from '../utils/logger';
import { ApiError } from '../types';

/**
 * Global error handling filter
 * Catches all unhandled errors and formats them consistently
 */
export function errorFilter() {
  return async (ctx: any, next: any) => {
    try {
      await next();
    } catch (err: any) {
      const error: ApiError = {
        message: err.message || "Internal Server Error",
        status: err.status || err.statusCode || 500,
      };

      ctx.status = error.status;
      
      // Log the error with full context
      const errorContext = {
        requestId: ctx.requestId,
        method: ctx.method,
        url: ctx.url,
        statusCode: error.status,
        userAgent: ctx.get('User-Agent'),
        ip: ctx.ip,
        stack: err.stack
      };

      if (error.status >= 500) {
        // Server errors
        logger.http.error('Server error occurred', err, errorContext);
        
        ctx.body = {
          error: {
            message: process.env["NODE_ENV"] === 'production' 
              ? "Internal Server Error" 
              : error.message,
            status: error.status,
            timestamp: new Date().toISOString(),
            requestId: ctx.requestId
          }
        };
      } else if (error.status >= 400) {
        // Client errors
        logger.http.warn('Client error occurred', errorContext);
        
        ctx.body = {
          error: {
            message: error.message,
            status: error.status,
            timestamp: new Date().toISOString(),
            requestId: ctx.requestId
          }
        };
      }

      // Emit error for other error handlers if needed
      ctx.app.emit('error', err, ctx);
    }
  };
}

export default errorFilter;
