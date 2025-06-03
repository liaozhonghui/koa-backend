import { Pool, PoolConfig } from 'pg';
import config from '../config';
import { logger } from '../utils/logger';

interface DatabaseError extends Error {
  code?: string;
  errno?: string | number;
  syscall?: string;
  address?: string;
  port?: number;
}

class Database {
  private pool!: Pool;
  private static instance: Database;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private reconnectInterval: number = 5000; // 5 seconds
  private reconnectTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.initializeConnection();
  }

  private initializeConnection(): void {
    const dbConfig: PoolConfig = {
      host: config.database.host,
      port: config.database.port,
      user: config.database.user,
      password: config.database.password,
      database: config.database.dbname,
      max: config.database.max || 10,
      idleTimeoutMillis: config.database.idleTimeoutMillis || 30000,
      connectionTimeoutMillis: config.database.connectionTimeoutMillis || 2000,
    };    this.pool = new Pool(dbConfig);

    // 监听连接成功
    this.pool.on('connect', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      logger.database.info('Database client connected', {
        host: config.database.host,
        port: config.database.port,
        dbname: config.database.dbname
      });
        // 清除重连定时器
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
    });    // 监听连接错误 - 不要直接退出应用
    this.pool.on('error', (err: DatabaseError) => {
      this.isConnected = false;
      logger.database.error('Database connection error occurred', err, {
        host: config.database.host,
        port: config.database.port,
        dbname: config.database.dbname,
        reconnectAttempts: this.reconnectAttempts,
        errorCode: err.code || 'UNKNOWN',
        errorErrno: err.errno || 'UNKNOWN',
        errorSyscall: err.syscall || 'UNKNOWN'
      });
      
      // 启动自动重连机制
      this.scheduleReconnect();
    });

    logger.database.info('Initializing database connection', {
      host: config.database.host,
      port: config.database.port,
      dbname: config.database.dbname
    });
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return; // 已经有重连计划在进行中
    }    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.database.error('Maximum reconnection attempts reached', undefined, {
        maxReconnectAttempts: this.maxReconnectAttempts,
        host: config.database.host,
        port: config.database.port,
        dbname: config.database.dbname
      });
      return;
    }    this.reconnectAttempts++;
    logger.database.info('Scheduling database reconnection', {
      attempt: this.reconnectAttempts,
      maxAttempts: this.maxReconnectAttempts,
      intervalSeconds: this.reconnectInterval / 1000,
      host: config.database.host,
      port: config.database.port,
      dbname: config.database.dbname
    });
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnect();
    }, this.reconnectInterval);
  }
  private async reconnect(): Promise<void> {
    try {
      logger.database.info('Attempting database reconnection', {
        attempt: this.reconnectAttempts,
        maxAttempts: this.maxReconnectAttempts,
        host: config.database.host,
        port: config.database.port,
        dbname: config.database.dbname
      });
      
      // 关闭旧连接
      if (this.pool) {
        await this.pool.end();
      }
      
      // 重新初始化连接
      this.initializeConnection();
      
      // 测试新连接
      const connected = await this.testConnection();
      if (!connected) {
        throw new Error('Connection test failed after reconnection');
      }
        } catch (error) {
      logger.database.error('Database reconnection attempt failed', error as Error, {
        attempt: this.reconnectAttempts,
        maxAttempts: this.maxReconnectAttempts,
        host: config.database.host,
        port: config.database.port,
        dbname: config.database.dbname
      });
      this.scheduleReconnect();
    } finally {
      // 清除定时器
      this.reconnectTimer = null;
    }
  }
  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public getPool(): Pool {
    return this.pool;
  }

  public isHealthy(): boolean {
    return this.isConnected && this.reconnectAttempts === 0;
  }

  public getConnectionStatus(): {
    connected: boolean;
    reconnectAttempts: number;
    maxReconnectAttempts: number;
  } {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts
    };
  }
  public async query(text: string, params?: any[]): Promise<any> {
    if (!this.isConnected) {
      throw new Error('Database is not connected. Please wait for reconnection or check database server.');
    }
    
    const timer = logger.timer('Database Query');
    const client = await this.pool.connect();
    try {
      logger.database.debug('Executing database query', { 
        query: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        hasParams: !!params
      });
      
      const result = await client.query(text, params);
      
      timer.end({ 
        rowCount: result.rowCount,
        command: result.command 
      });
      
      return result;
    } catch (error) {
      timer.end({ error: true });
      logger.database.error('Query execution failed', error as Error, { 
        query: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        hasParams: !!params
      });
      throw error;
    } finally {
      client.release();
    }
  }  public async testConnection(): Promise<boolean> {
    try {
      // 直接使用池连接进行测试，而不是通过query方法
      const client = await this.pool.connect();
      try {
        const result = await client.query('SELECT NOW() as current_time');
        logger.database.info('Database connection test successful', { 
          currentTime: result.rows[0].current_time,
          host: config.database.host,
          port: config.database.port,
          dbname: config.database.dbname
        });
        this.isConnected = true;
        return true;
      } finally {
        client.release();
      }
    } catch (error) {
      logger.database.error('Database connection test failed', error as Error, {
        host: config.database.host,
        port: config.database.port,
        dbname: config.database.dbname
      });
      this.isConnected = false;
      return false;
    }
  }
  public async close(): Promise<void> {
    // 清除重连定时器
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    
    if (this.pool) {
      await this.pool.end();
      logger.database.info('Database connection pool closed', {
        host: config.database.host,
        port: config.database.port,
        dbname: config.database.dbname
      });
    }
    
    this.isConnected = false;
  }
}

export default Database;
