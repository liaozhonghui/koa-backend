import Database from '../src/database';
import config from '../src/config';

describe('Database Connection Tests', () => {
  let database: Database;

  beforeAll(async () => {
    // 确保我们在本地测试环境中
    process.env['NODE_ENV'] = 'local';
    database = Database.getInstance();
  });

  afterAll(async () => {
    // 测试结束后关闭数据库连接
    try {
      await database.close();
    } catch (error) {
      console.warn('Error closing database connection:', error);
    }
  });

  describe('Database Configuration', () => {
    it('should load database configuration correctly', () => {
      expect(config.database).toBeDefined();
      expect(config.database.host).toBe('192.168.191.148');
      expect(config.database.port).toBe(5432);
      expect(config.database.user).toBe('postgres');
      expect(config.database.dbname).toBe('node-db');
    });
  });

  describe('Database Connection', () => {
    it('should connect to PostgreSQL database successfully', async () => {
      const isConnected = await database.testConnection();
      expect(isConnected).toBe(true);
    }, 10000); // 10秒超时

    it('should execute simple query successfully', async () => {
      const result = await database.query('SELECT 1 as test_number');
      expect(result.rows).toBeDefined();
      expect(result.rows[0].test_number).toBe(1);
    }, 10000);

    it('should execute query with parameters', async () => {
      const testValue = 'Hello Database';
      const result = await database.query('SELECT $1 as test_string', [testValue]);
      expect(result.rows).toBeDefined();
      expect(result.rows[0].test_string).toBe(testValue);
    }, 10000);
  });

  describe('Database Pool', () => {
    it('should get database pool instance', () => {
      const pool = database.getPool();
      expect(pool).toBeDefined();
      expect(typeof pool.connect).toBe('function');
    });

    it('should be singleton instance', () => {
      const instance1 = Database.getInstance();
      const instance2 = Database.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Database Schema Information', () => {
    it('should get PostgreSQL version', async () => {
      const result = await database.query('SELECT version()');
      expect(result.rows).toBeDefined();
      expect(result.rows[0].version).toContain('PostgreSQL');
    }, 10000);

    it('should get current database name', async () => {
      const result = await database.query('SELECT current_database()');
      expect(result.rows).toBeDefined();
      expect(result.rows[0].current_database).toBe('node-db');
    }, 10000);
  });
});
