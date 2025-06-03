import { v4 as uuidv4 } from 'uuid';
import { logger, LogContext, LogCategory } from '../singleton/logger';

/**
 * HTTP 请求日志中间件
 * 为每个请求生成唯一ID并记录详细的请求/响应信息
 */
export function httpLogger() {
  return async (ctx: any, next: any) => {
    // 生成请求ID
    const requestId = uuidv4();
    const startTime = Date.now();
    
    // 将请求ID添加到上下文
    ctx.requestId = requestId;
      // 创建请求专用的日志器
    ctx.logger = logger.child({
      requestId,
      category: LogCategory.HTTP
    });

    // 获取客户端信息
    const clientInfo: LogContext = {
      requestId,
      method: ctx.method,
      url: ctx.url,
      ip: getClientIP(ctx),
      userAgent: ctx.get('User-Agent'),
      contentType: ctx.get('Content-Type'),
      contentLength: ctx.get('Content-Length'),
      referer: ctx.get('Referer'),
      origin: ctx.get('Origin')
    };

    // 记录请求开始
    logger.http.info('HTTP Request started', clientInfo);

    // 记录请求体信息（对于POST/PUT等请求）
    if (ctx.request.body && shouldLogRequestBody(ctx)) {
      logger.http.debug('Request body received', {
        requestId,
        bodyType: typeof ctx.request.body,
        bodySize: JSON.stringify(ctx.request.body).length
      });
    }

    try {
      await next();
      
      const duration = Date.now() - startTime;
      const responseInfo: LogContext = {
        requestId,
        statusCode: ctx.status,
        responseTime: duration,
        contentType: ctx.response.get('Content-Type'),
        contentLength: ctx.response.get('Content-Length')
      };

      // 根据状态码决定日志级别
      if (ctx.status >= 500) {
        logger.http.error('HTTP Request completed with server error', undefined, {
          ...clientInfo,
          ...responseInfo
        });
      } else if (ctx.status >= 400) {
        logger.http.warn('HTTP Request completed with client error', {
          ...clientInfo,
          ...responseInfo
        });
      } else if (duration > 5000) {
        // 慢请求警告（超过5秒）
        logger.performance.warn('Slow HTTP request detected', {
          ...clientInfo,
          ...responseInfo
        });
      } else {
        logger.http.info('HTTP Request completed successfully', {
          ...clientInfo,
          ...responseInfo
        });
      }

      // 记录响应体信息（仅用于调试）
      if (shouldLogResponseBody(ctx)) {
        logger.http.debug('Response body sent', {
          requestId,
          bodyType: typeof ctx.body,
          bodySize: ctx.body ? JSON.stringify(ctx.body).length : 0
        });
      }

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorInfo: LogContext = {
        requestId,
        statusCode: ctx.status || 500,
        responseTime: duration,
        errorName: (error as Error).name,
        errorMessage: (error as Error).message
      };

      logger.http.error('HTTP Request failed with error', error as Error, {
        ...clientInfo,
        ...errorInfo
      });

      // 重新抛出错误以便其他中间件处理
      throw error;
    }
  };
}

/**
 * 获取客户端真实IP地址
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

/**
 * 判断是否应该记录请求体
 */
function shouldLogRequestBody(ctx: any): boolean {
  // 只在开发环境记录请求体
  if (process.env["NODE_ENV"] !== 'development') {
    return false;
  }
  
  // 只记录JSON类型的请求体
  const contentType = ctx.get('Content-Type');
  return contentType.includes('application/json');
}

/**
 * 判断是否应该记录响应体
 */
function shouldLogResponseBody(ctx: any): boolean {
  // 只在开发环境且启用了trace级别时记录响应体
  if (process.env["NODE_ENV"] !== 'development' || process.env["LOG_LEVEL"] !== 'trace') {
    return false;
  }
  
  // 只记录小于1KB的JSON响应
  const contentType = ctx.response.get('Content-Type') || '';
  const contentLength = parseInt(ctx.response.get('Content-Length') || '0');
  
  return contentType.includes('application/json') && contentLength < 1024;
}

/**
 * 安全相关的请求日志中间件
 */
export function securityLogger() {
  return async (ctx: any, next: any) => {
    // 检测可疑请求
    const suspiciousPatterns = [
      /\.\.\//,  // Path traversal
      /<script/i, // XSS attempts
      /union.*select/i, // SQL injection
      /exec\s*\(/i, // Command injection
    ];

    const url = ctx.url.toLowerCase();
    const userAgent = ctx.get('User-Agent').toLowerCase();
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(url) || pattern.test(userAgent)) {
        logger.security.warn('Suspicious request detected', {
          requestId: ctx.requestId,
          method: ctx.method,
          url: ctx.url,
          ip: getClientIP(ctx),
          userAgent: ctx.get('User-Agent'),
          pattern: pattern.toString()
        });
        break;
      }
    }

    // 记录失败的身份验证尝试
    await next();
    
    if (ctx.status === 401 || ctx.status === 403) {
      logger.security.warn('Authentication/Authorization failed', {
        requestId: ctx.requestId,
        method: ctx.method,
        url: ctx.url,
        ip: getClientIP(ctx),
        statusCode: ctx.status,
        userAgent: ctx.get('User-Agent')
      });
    }
  };
}

export default httpLogger;
