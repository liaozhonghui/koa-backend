import pino from 'pino';
import config from '../config';

// 日志级别枚举
export enum LogLevel {
  TRACE = 'trace',
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}

// 日志分类枚举
export enum LogCategory {
  APP = 'APP',           // 应用程序相关
  HTTP = 'HTTP',         // HTTP 请求/响应
  DATABASE = 'DATABASE', // 数据库操作
  AUTH = 'AUTH',         // 认证授权
  BUSINESS = 'BUSINESS', // 业务逻辑
  SYSTEM = 'SYSTEM',     // 系统级别
  SECURITY = 'SECURITY', // 安全相关
  PERFORMANCE = 'PERF'   // 性能监控
}

// 日志上下文接口
export interface LogContext {
  requestId?: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  responseTime?: number;
  category?: LogCategory;
  [key: string]: any;
}

// 创建 pino 配置
const createPinoConfig = () => {
  const isDevelopment = config.NODE_ENV === 'local';
  
  const baseConfig = {
    level: config["LOG_LEVEL"] || (isDevelopment ? 'debug' : 'info'),
    formatters: {
      level: (label: string) => {
        return { level: label.toUpperCase() };
      },
      log: (object: any) => {
        // 确保敏感信息不被记录
        const sanitized = { ...object };
        if (sanitized.password) sanitized.password = '[REDACTED]';
        if (sanitized.token) sanitized.token = '[REDACTED]';
        if (sanitized.authorization) sanitized.authorization = '[REDACTED]';
        return sanitized;
      }
    },
    serializers: {
      req: (req: any) => ({
        method: req.method,
        url: req.url,
        headers: {
          'user-agent': req.headers['user-agent'],
          'content-type': req.headers['content-type'],
          'x-forwarded-for': req.headers['x-forwarded-for']
        }
      }),
      res: (res: any) => ({
        statusCode: res.statusCode,
        headers: {
          'content-type': res.headers?.['content-type']
        }
      }),
      err: pino.stdSerializers.err
    },
    base: {
      service: 'koa-backend',
      version: '1.0.0',
      environment: config.NODE_ENV
    }
  };

  if (isDevelopment) {
    return {
      ...baseConfig,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'yyyy-mm-dd HH:MM:ss.l',
          ignore: 'pid,hostname',
          messageFormat: '[{category}] {msg}',
          customColors: 'trace:gray,debug:blue,info:green,warn:yellow,error:red,fatal:bgRed',
          levelFirst: true,
          singleLine: false
        }
      }
    };  }
  
  return baseConfig;
};

// 创建主日志实例
const pinoInstance = pino(createPinoConfig());

// 日志工具类
export class Logger {
  private static instance: Logger;
  private pino: pino.Logger;

  private constructor() {
    this.pino = pinoInstance;
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  // 创建子日志器，带有固定上下文
  public child(context: LogContext): pino.Logger {
    return this.pino.child(context);
  }

  // 应用程序日志
  public app = {
    trace: (msg: string, context?: LogContext) => this.log(LogLevel.TRACE, LogCategory.APP, msg, context),
    debug: (msg: string, context?: LogContext) => this.log(LogLevel.DEBUG, LogCategory.APP, msg, context),
    info: (msg: string, context?: LogContext) => this.log(LogLevel.INFO, LogCategory.APP, msg, context),
    warn: (msg: string, context?: LogContext) => this.log(LogLevel.WARN, LogCategory.APP, msg, context),
    error: (msg: string, error?: Error, context?: LogContext) => this.logError(LogCategory.APP, msg, error, context),
    fatal: (msg: string, error?: Error, context?: LogContext) => this.logFatal(LogCategory.APP, msg, error, context)
  };

  // HTTP 请求日志
  public http = {
    trace: (msg: string, context?: LogContext) => this.log(LogLevel.TRACE, LogCategory.HTTP, msg, context),
    debug: (msg: string, context?: LogContext) => this.log(LogLevel.DEBUG, LogCategory.HTTP, msg, context),
    info: (msg: string, context?: LogContext) => this.log(LogLevel.INFO, LogCategory.HTTP, msg, context),
    warn: (msg: string, context?: LogContext) => this.log(LogLevel.WARN, LogCategory.HTTP, msg, context),
    error: (msg: string, error?: Error, context?: LogContext) => this.logError(LogCategory.HTTP, msg, error, context)
  };

  // 数据库日志
  public database = {
    trace: (msg: string, context?: LogContext) => this.log(LogLevel.TRACE, LogCategory.DATABASE, msg, context),
    debug: (msg: string, context?: LogContext) => this.log(LogLevel.DEBUG, LogCategory.DATABASE, msg, context),
    info: (msg: string, context?: LogContext) => this.log(LogLevel.INFO, LogCategory.DATABASE, msg, context),
    warn: (msg: string, context?: LogContext) => this.log(LogLevel.WARN, LogCategory.DATABASE, msg, context),
    error: (msg: string, error?: Error, context?: LogContext) => this.logError(LogCategory.DATABASE, msg, error, context)
  };

  // 业务逻辑日志
  public business = {
    trace: (msg: string, context?: LogContext) => this.log(LogLevel.TRACE, LogCategory.BUSINESS, msg, context),
    debug: (msg: string, context?: LogContext) => this.log(LogLevel.DEBUG, LogCategory.BUSINESS, msg, context),
    info: (msg: string, context?: LogContext) => this.log(LogLevel.INFO, LogCategory.BUSINESS, msg, context),
    warn: (msg: string, context?: LogContext) => this.log(LogLevel.WARN, LogCategory.BUSINESS, msg, context),
    error: (msg: string, error?: Error, context?: LogContext) => this.logError(LogCategory.BUSINESS, msg, error, context)
  };

  // 安全日志
  public security = {
    info: (msg: string, context?: LogContext) => this.log(LogLevel.INFO, LogCategory.SECURITY, msg, context),
    warn: (msg: string, context?: LogContext) => this.log(LogLevel.WARN, LogCategory.SECURITY, msg, context),
    error: (msg: string, error?: Error, context?: LogContext) => this.logError(LogCategory.SECURITY, msg, error, context)
  };

  // 性能日志
  public performance = {
    info: (msg: string, context?: LogContext) => this.log(LogLevel.INFO, LogCategory.PERFORMANCE, msg, context),
    warn: (msg: string, context?: LogContext) => this.log(LogLevel.WARN, LogCategory.PERFORMANCE, msg, context)
  };

  // 系统日志
  public system = {
    trace: (msg: string, context?: LogContext) => this.log(LogLevel.TRACE, LogCategory.SYSTEM, msg, context),
    debug: (msg: string, context?: LogContext) => this.log(LogLevel.DEBUG, LogCategory.SYSTEM, msg, context),
    info: (msg: string, context?: LogContext) => this.log(LogLevel.INFO, LogCategory.SYSTEM, msg, context),
    warn: (msg: string, context?: LogContext) => this.log(LogLevel.WARN, LogCategory.SYSTEM, msg, context),
    error: (msg: string, error?: Error, context?: LogContext) => this.logError(LogCategory.SYSTEM, msg, error, context),
    fatal: (msg: string, error?: Error, context?: LogContext) => this.logFatal(LogCategory.SYSTEM, msg, error, context)
  };

  // 通用日志方法
  private log(level: LogLevel, category: LogCategory, msg: string, context?: LogContext): void {
    const logContext = { category, ...context };
    this.pino[level](logContext, msg);
  }

  // 错误日志方法
  private logError(category: LogCategory, msg: string, error?: Error, context?: LogContext): void {
    const logContext = { 
      category, 
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined,
      ...context 
    };
    this.pino.error(logContext, msg);
  }

  // 致命错误日志方法
  private logFatal(category: LogCategory, msg: string, error?: Error, context?: LogContext): void {
    const logContext = { 
      category, 
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined,
      ...context 
    };
    this.pino.fatal(logContext, msg);
  }

  // 请求跟踪方法
  public trace(requestId: string): pino.Logger {
    return this.pino.child({ requestId, category: LogCategory.HTTP });
  }

  // 性能计时器
  public timer(name: string, category: LogCategory = LogCategory.PERFORMANCE) {
    const start = Date.now();
    return {
      end: (context?: LogContext) => {
        const duration = Date.now() - start;
        this.log(LogLevel.INFO, category, `${name} completed`, { 
          duration: `${duration}ms`, 
          ...context 
        });
        return duration;
      }
    };
  }

  // 获取原始 pino 实例
  public getPino(): pino.Logger {
    return this.pino;
  }
}

// 导出单例实例
export const logger = Logger.getInstance();
export default logger;
