import { logger } from '../utils/logger';

/**
 * Response time middleware
 * Adds X-Response-Time header and logs response times
 */
export function responseTime() {
  return async (ctx: any, next: any) => {
    const start = Date.now();
    
    await next();
    
    const ms = Date.now() - start;
    
    // Add response time header
    ctx.set('X-Response-Time', `${ms}ms`);
    
    // Log performance based on response time
    const logData = {
      requestId: ctx.requestId,
      method: ctx.method,
      url: ctx.url,
      statusCode: ctx.status,
      responseTime: ms
    };    if (ms > 5000) {
      // Very slow requests (>5s)
      logger.performance.warn('Very slow response detected', logData);
    } else if (ms > 2000) {
      // Slow requests (>2s)
      logger.performance.warn('Slow response detected', logData);
    } else if (ms > 1000) {
      // Moderately slow requests (>1s)
      logger.performance.info('Moderate response time', logData);
    } else {
      // Fast requests (<1s) - only log in debug mode
      logger.performance.info('Response time recorded', logData);
    }
  };
}

export default responseTime;
