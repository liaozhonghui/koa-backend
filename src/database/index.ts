import { Pool, PoolConfig } from 'pg';
import config from '../config';

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
    };

    this.pool = new Pool(dbConfig);

    // 监听连接成功
    this.pool.on('connect', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log(`✅ Database connected to ${config.database.host}:${config.database.port}/${config.database.dbname}`);
        // 清除重连定时器
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
    });

    // 监听连接错误 - 不要直接退出应用
    this.pool.on('error', (err: DatabaseError) => {
      this.isConnected = false;
      console.error('❌ Database connection error:', err.message);
      console.error('📊 Error details:', {
        code: err.code || 'UNKNOWN',
        errno: err.errno || 'UNKNOWN',
        syscall: err.syscall || 'UNKNOWN',
        address: err.address || 'UNKNOWN',
        port: err.port || 'UNKNOWN'
      });
      
      // 启动自动重连机制
      this.scheduleReconnect();
    });

    console.log(`🔄 Initializing database connection to ${config.database.host}:${config.database.port}/${config.database.dbname}`);
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return; // 已经有重连计划在进行中
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`❌ Maximum reconnection attempts (${this.maxReconnectAttempts}) reached. Please check database server.`);
      return;
    }

    this.reconnectAttempts++;
    console.log(`🔄 Scheduling database reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${this.reconnectInterval/1000}s...`);
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnect();
    }, this.reconnectInterval);
  }

  private async reconnect(): Promise<void> {
    try {
      console.log(`🔄 Attempting database reconnection (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
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
      console.error(`❌ Reconnection attempt ${this.reconnectAttempts} failed:`, error);
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
    
    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } catch (error) {
      console.error('Query execution error:', error);
      throw error;
    } finally {
      client.release();
    }
  }
  public async testConnection(): Promise<boolean> {
    try {
      // 直接使用池连接进行测试，而不是通过query方法
      const client = await this.pool.connect();
      try {
        const result = await client.query('SELECT NOW() as current_time');
        console.log('Database connection test successful:', result.rows[0]);
        this.isConnected = true;
        return true;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Database connection test failed:', error);
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
      console.log('Database connection pool closed');
    }
    
    this.isConnected = false;
  }
}

export default Database;
