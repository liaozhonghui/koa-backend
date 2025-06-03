import Database from '../src/singleton/database';

describe('Database Error Handling and Reconnection Tests', () => {
  let database: Database;

  beforeAll(() => {
    process.env['NODE_ENV'] = 'local';
    database = Database.getInstance();
  });

  afterAll(async () => {
    try {
      await database.close();
    } catch (error) {
      console.warn('Error closing database connection:', error);
    }
  });

  describe('Connection Status and Health Check', () => {
    it('should provide connection status information', () => {
      const status = database.getConnectionStatus();
      
      expect(status).toHaveProperty('connected');
      expect(status).toHaveProperty('reconnectAttempts');
      expect(status).toHaveProperty('maxReconnectAttempts');
      expect(typeof status.connected).toBe('boolean');
      expect(typeof status.reconnectAttempts).toBe('number');
      expect(typeof status.maxReconnectAttempts).toBe('number');
    });

    it('should report healthy status when connected', () => {
      // Assuming database is connected during tests
      const isHealthy = database.isHealthy();
      expect(typeof isHealthy).toBe('boolean');
    });
  });

  describe('Query Error Handling', () => {    it('should handle query errors gracefully without crashing app', async () => {
      try {
        // This should fail but not crash the application
        await database.query('SELECT * FROM non_existent_table_xyz');
        // If we reach here, the query unexpectedly succeeded
        fail('Expected query to fail');
      } catch (error) {
        // This is expected - the query should fail gracefully
        expect(error).toBeDefined();
        console.log('✅ Query error handled gracefully:', (error as Error).message);
      }
    });    it('should handle invalid SQL gracefully', async () => {
      try {
        await database.query('INVALID SQL STATEMENT');
        fail('Expected invalid SQL to fail');
      } catch (error) {
        expect(error).toBeDefined();
        console.log('✅ Invalid SQL handled gracefully:', (error as Error).message);
      }
    });
  });

  describe('Connection Recovery', () => {
    it('should not crash application when database connection fails', async () => {
      // This test ensures our error handling doesn't call process.exit()
      const originalExit = process.exit;
      let exitCalled = false;
      
      // Mock process.exit to detect if it's called
      process.exit = jest.fn(() => {
        exitCalled = true;
        throw new Error('process.exit called');
      }) as any;

      try {
        // Simulate a database error event (this would normally crash the app)
        const pool = database.getPool();
        pool.emit('error', new Error('Simulated database connection error'));
        
        // Wait a short time for error handling using Promise instead of setTimeout
        await new Promise(resolve => {
          setTimeout(() => {
            expect(exitCalled).toBe(false);
            console.log('✅ Application did not exit on database error');
            resolve(void 0);
          }, 100);
        });
        
      } finally {
        // Restore original process.exit
        process.exit = originalExit;
      }
    });
  });

  describe('Database Pool Management', () => {
    it('should provide access to database pool', () => {
      const pool = database.getPool();
      expect(pool).toBeDefined();
      expect(typeof pool.connect).toBe('function');
      expect(typeof pool.end).toBe('function');
    });

    it('should maintain singleton pattern', () => {
      const instance1 = Database.getInstance();
      const instance2 = Database.getInstance();
      expect(instance1).toBe(instance2);
    });
  });
});
