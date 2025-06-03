import { logger } from '../utils/logger';
import { ApiError, ApiResponse, ResponseCodes } from '../types';

/**
 * Global error handling filter
 * Catches all unhandled errors and formats them consistently
 * Always returns HTTP 200 with standardized response format
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

      // Always return HTTP 200
      ctx.status = 200;
      
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

      let responseCode: number;
      let responseMessage: string;      if (error.status >= 500) {
        // Server errors - map to HTTP equivalent codes
        responseCode = ResponseCodes.INTERNAL_SERVER_ERROR;
        responseMessage = process.env["NODE_ENV"] === 'prod' 
          ? "Internal Server Error" 
          : error.message;
        
        logger.http.error('Server error occurred', err, errorContext);
      } else if (error.status >= 400) {
        // Client errors - map to HTTP equivalent codes
        responseCode = error.status; // Keep original HTTP status as code
        responseMessage = error.message;
        
        logger.http.warn('Client error occurred', errorContext);
      } else {
        // Default case
        responseCode = ResponseCodes.INTERNAL_SERVER_ERROR;
        responseMessage = "Unknown error occurred";
        
        logger.http.error('Unknown error occurred', err, errorContext);
      }

      const response: ApiResponse<null> = {
        code: responseCode,
        msg: responseMessage,
        data: null
      };

      ctx.body = response;

      // Emit error for other error handlers if needed
      ctx.app.emit('error', err, ctx);
    }
  };
}

export default errorFilter;
