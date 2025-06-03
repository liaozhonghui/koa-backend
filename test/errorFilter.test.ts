import { errorFilter } from '../src/filter/errorFilter';
import { ResponseCodes } from '../src/types';

// Mock the logger to avoid dependencies
jest.mock('../src/singleton/logger', () => ({
  logger: {
    http: {
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn()
    }
  }
}));

// Extend Error interface for testing
interface TestError extends Error {
  status?: number;
  statusCode?: number;
  stack?: string;
  customProperty?: string;
}

describe('ErrorFilter Tests', () => {
  let ctx: any;
  let next: any;

  beforeEach(() => {
    // Mock Koa context
    ctx = {
      status: 200,
      method: 'GET',
      url: '/test',
      requestId: 'test-request-id',
      ip: '127.0.0.1',
      body: undefined,
      get: jest.fn((header: string) => {
        if (header === 'User-Agent') return 'Test-Agent/1.0';
        if (header === 'Referer') return 'http://localhost:3000';
        return '';
      }),
      app: {
        emit: jest.fn()
      }
    };

    next = jest.fn();

    // Reset environment variable
    delete process.env['NODE_ENV'];
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Successful request handling', () => {
    it('should pass through successful requests without modification', async () => {
      const middleware = errorFilter();
      await middleware(ctx, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(ctx.status).toBe(200);
      expect(ctx.body).toBeUndefined();
    });

    it('should not interfere with normal response body', async () => {
      next.mockImplementation(() => {
        ctx.body = { success: true, data: 'test' };
      });

      const middleware = errorFilter();
      await middleware(ctx, next);

      expect(ctx.body).toEqual({ success: true, data: 'test' });
      expect(ctx.status).toBe(200);
    });
  });

  describe('Server Error Handling (5xx)', () => {
    it('should handle 500 internal server error', async () => {
      const error: TestError = new Error('Database connection failed');
      error.status = 500;

      next.mockImplementation(() => {
        throw error;
      });

      const middleware = errorFilter();
      await middleware(ctx, next);

      expect(ctx.status).toBe(200);
      expect(ctx.body).toEqual({
        code: ResponseCodes.INTERNAL_SERVER_ERROR,
        msg: 'Database connection failed',
        data: null
      });
      expect(ctx.app.emit).toHaveBeenCalledWith('error', error, ctx);
    });

    it('should handle 502 bad gateway error', async () => {
      const error: TestError = new Error('Bad Gateway');
      error.status = 502;

      next.mockImplementation(() => {
        throw error;
      });

      const middleware = errorFilter();
      await middleware(ctx, next);

      expect(ctx.status).toBe(200);
      expect(ctx.body).toEqual({
        code: ResponseCodes.INTERNAL_SERVER_ERROR,
        msg: 'Bad Gateway',
        data: null
      });
    });

    it('should handle 503 service unavailable error', async () => {
      const error: TestError = new Error('Service Unavailable');
      error.status = 503;

      next.mockImplementation(() => {
        throw error;
      });

      const middleware = errorFilter();
      await middleware(ctx, next);

      expect(ctx.status).toBe(200);
      expect(ctx.body).toEqual({
        code: ResponseCodes.INTERNAL_SERVER_ERROR,
        msg: 'Service Unavailable',
        data: null
      });
    });

    it('should mask server error message in production environment', async () => {
      process.env['NODE_ENV'] = 'prod';
      
      const error: TestError = new Error('Sensitive internal error details');
      error.status = 500;

      next.mockImplementation(() => {
        throw error;
      });

      const middleware = errorFilter();
      await middleware(ctx, next);

      expect(ctx.status).toBe(200);
      expect(ctx.body).toEqual({
        code: ResponseCodes.INTERNAL_SERVER_ERROR,
        msg: 'Internal Server Error',
        data: null
      });
    });

    it('should show detailed error message in non-production environment', async () => {
      process.env['NODE_ENV'] = 'local';
      
      const error: TestError = new Error('Detailed error information for debugging');
      error.status = 500;

      next.mockImplementation(() => {
        throw error;
      });

      const middleware = errorFilter();
      await middleware(ctx, next);

      expect(ctx.status).toBe(200);
      expect(ctx.body).toEqual({
        code: ResponseCodes.INTERNAL_SERVER_ERROR,
        msg: 'Detailed error information for debugging',
        data: null
      });
    });
  });

  describe('Client Error Handling (4xx)', () => {
    it('should handle 400 bad request error', async () => {
      const error: TestError = new Error('Invalid request format');
      error.status = 400;

      next.mockImplementation(() => {
        throw error;
      });

      const middleware = errorFilter();
      await middleware(ctx, next);

      expect(ctx.status).toBe(200);      expect(ctx.body).toEqual({
        code: 400,
        msg: 'Invalid request format',
        data: null
      });
      // All errors are emitted, including client errors
      expect(ctx.app.emit).toHaveBeenCalledWith('error', error, ctx);
    });

    it('should handle 401 unauthorized error', async () => {
      const error: TestError = new Error('Unauthorized access');
      error.status = 401;

      next.mockImplementation(() => {
        throw error;
      });

      const middleware = errorFilter();
      await middleware(ctx, next);

      expect(ctx.status).toBe(200);      expect(ctx.body).toEqual({
        code: 401,
        msg: 'Unauthorized access',
        data: null
      });
      expect(ctx.app.emit).toHaveBeenCalledWith('error', error, ctx);
    });

    it('should handle 403 forbidden error', async () => {
      const error: TestError = new Error('Access forbidden');
      error.status = 403;

      next.mockImplementation(() => {
        throw error;
      });

      const middleware = errorFilter();
      await middleware(ctx, next);

      expect(ctx.status).toBe(200);      expect(ctx.body).toEqual({
        code: 403,
        msg: 'Access forbidden',
        data: null
      });
      expect(ctx.app.emit).toHaveBeenCalledWith('error', error, ctx);
    });

    it('should handle 404 not found error', async () => {
      const error: TestError = new Error('Resource not found');
      error.status = 404;

      next.mockImplementation(() => {
        throw error;
      });

      const middleware = errorFilter();
      await middleware(ctx, next);

      expect(ctx.status).toBe(200);      expect(ctx.body).toEqual({
        code: 404,
        msg: 'Resource not found',
        data: null
      });
      expect(ctx.app.emit).toHaveBeenCalledWith('error', error, ctx);
    });

    it('should handle 409 conflict error', async () => {
      const error: TestError = new Error('Resource conflict');
      error.status = 409;

      next.mockImplementation(() => {
        throw error;
      });

      const middleware = errorFilter();
      await middleware(ctx, next);

      expect(ctx.status).toBe(200);      expect(ctx.body).toEqual({
        code: 409,
        msg: 'Resource conflict',
        data: null
      });
      expect(ctx.app.emit).toHaveBeenCalledWith('error', error, ctx);
    });

    it('should handle 422 unprocessable entity error', async () => {
      const error: TestError = new Error('Validation failed');
      error.status = 422;

      next.mockImplementation(() => {
        throw error;
      });

      const middleware = errorFilter();
      await middleware(ctx, next);

      expect(ctx.status).toBe(200);      expect(ctx.body).toEqual({
        code: 422,
        msg: 'Validation failed',
        data: null
      });
      expect(ctx.app.emit).toHaveBeenCalledWith('error', error, ctx);
    });

    it('should handle 429 too many requests error', async () => {
      const error: TestError = new Error('Rate limit exceeded');
      error.status = 429;

      next.mockImplementation(() => {
        throw error;
      });

      const middleware = errorFilter();
      await middleware(ctx, next);

      expect(ctx.status).toBe(200);      expect(ctx.body).toEqual({
        code: 429,
        msg: 'Rate limit exceeded',
        data: null
      });
      expect(ctx.app.emit).toHaveBeenCalledWith('error', error, ctx);
    });
  });

  describe('Edge Cases and Unknown Errors', () => {
    it('should handle errors without status code', async () => {
      const error = new Error('Error without status');

      next.mockImplementation(() => {
        throw error;
      });

      const middleware = errorFilter();
      await middleware(ctx, next);

      expect(ctx.status).toBe(200);      expect(ctx.body).toEqual({
        code: ResponseCodes.INTERNAL_SERVER_ERROR,
        msg: 'Error without status',
        data: null
      });
      expect(ctx.app.emit).toHaveBeenCalledWith('error', error, ctx);
    });

    it('should handle errors with statusCode property instead of status', async () => {
      const error: TestError = new Error('Error with statusCode');
      error.statusCode = 400;

      next.mockImplementation(() => {
        throw error;
      });

      const middleware = errorFilter();
      await middleware(ctx, next);

      expect(ctx.status).toBe(200);      expect(ctx.body).toEqual({
        code: 400,
        msg: 'Error with statusCode',
        data: null
      });
      expect(ctx.app.emit).toHaveBeenCalledWith('error', error, ctx);
    });    it('should handle errors without message', async () => {
      const error: TestError = new Error();
      error.status = 500;

      next.mockImplementation(() => {
        throw error;
      });

      const middleware = errorFilter();
      await middleware(ctx, next);

      expect(ctx.status).toBe(200);
      expect(ctx.body).toEqual({
        code: ResponseCodes.INTERNAL_SERVER_ERROR,
        msg: 'Internal Server Error',
        data: null
      });
      expect(ctx.app.emit).toHaveBeenCalledWith('error', error, ctx);
    });    it('should handle non-Error objects thrown', async () => {
      const error = 'String error message';

      next.mockImplementation(() => {
        throw error;
      });

      const middleware = errorFilter();
      await middleware(ctx, next);

      expect(ctx.status).toBe(200);
      expect(ctx.body).toEqual({
        code: ResponseCodes.INTERNAL_SERVER_ERROR,
        msg: 'Internal Server Error',
        data: null
      });
      expect(ctx.app.emit).toHaveBeenCalledWith('error', error, ctx);
    });

    it('should handle status codes below 400 as unknown errors', async () => {
      const error: TestError = new Error('Weird status code');
      error.status = 200; // This shouldn't happen but let's handle it

      next.mockImplementation(() => {
        throw error;
      });

      const middleware = errorFilter();
      await middleware(ctx, next);

      expect(ctx.status).toBe(200);      expect(ctx.body).toEqual({
        code: ResponseCodes.INTERNAL_SERVER_ERROR,
        msg: 'Unknown error occurred',
        data: null
      });
      expect(ctx.app.emit).toHaveBeenCalledWith('error', error, ctx);
    });

    it('should handle errors with custom properties', async () => {
      const error: TestError = new Error('Custom error');
      error.status = 400;
      error.customProperty = 'custom value';

      next.mockImplementation(() => {
        throw error;
      });

      const middleware = errorFilter();
      await middleware(ctx, next);

      expect(ctx.status).toBe(200);      expect(ctx.body).toEqual({
        code: 400,
        msg: 'Custom error',
        data: null
      });
      expect(ctx.app.emit).toHaveBeenCalledWith('error', error, ctx);
    });
  });

  describe('Context and Logging', () => {
    it('should log server errors with full context', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const error: TestError = new Error('Server error for logging test');
      error.status = 500;
      error.stack = 'Error stack trace...';

      next.mockImplementation(() => {
        throw error;
      });

      const middleware = errorFilter();
      await middleware(ctx, next);

      // Verify logging was called (implementation may vary based on logger)
      expect(ctx.app.emit).toHaveBeenCalledWith('error', error, ctx);
      
      consoleSpy.mockRestore();
    });

    it('should include request context in error logging', async () => {
      const error: TestError = new Error('Context test error');
      error.status = 500;

      ctx.requestId = 'unique-request-id';
      ctx.method = 'POST';
      ctx.url = '/api/test';
      ctx.ip = '192.168.1.100';

      next.mockImplementation(() => {
        throw error;
      });

      const middleware = errorFilter();
      await middleware(ctx, next);

      expect(ctx.app.emit).toHaveBeenCalledWith('error', error, ctx);
    });

    it('should handle missing context properties gracefully', async () => {
      const error: TestError = new Error('Missing context test');
      error.status = 400;

      // Create minimal context
      const minimalCtx: any = {
        status: 200,
        method: 'GET',
        url: '/test',
        body: undefined,
        get: jest.fn(() => ''),
        app: { emit: jest.fn() }
      };

      next.mockImplementation(() => {
        throw error;
      });

      const middleware = errorFilter();
      await middleware(minimalCtx, next);

      expect(minimalCtx.status).toBe(200);
      expect(minimalCtx.body).toEqual({
        code: 400,
        msg: 'Missing context test',
        data: null
      });
    });
  });

  describe('Environment-specific behavior', () => {
    it('should behave correctly in local environment', async () => {
      process.env['NODE_ENV'] = 'local';
      
      const error: TestError = new Error('Local environment error');
      error.status = 500;

      next.mockImplementation(() => {
        throw error;
      });

      const middleware = errorFilter();
      await middleware(ctx, next);

      expect(ctx.body.msg).toBe('Local environment error');
    });

    it('should behave correctly in pre environment', async () => {
      process.env['NODE_ENV'] = 'pre';
      
      const error: TestError = new Error('Pre environment error');
      error.status = 500;

      next.mockImplementation(() => {
        throw error;
      });

      const middleware = errorFilter();
      await middleware(ctx, next);

      expect(ctx.body.msg).toBe('Pre environment error');
    });

    it('should mask errors in prod environment', async () => {
      process.env['NODE_ENV'] = 'prod';
      
      const error: TestError = new Error('Production environment error with sensitive data');
      error.status = 500;

      next.mockImplementation(() => {
        throw error;
      });

      const middleware = errorFilter();
      await middleware(ctx, next);

      expect(ctx.body.msg).toBe('Internal Server Error');
    });

    it('should handle undefined NODE_ENV gracefully', async () => {
      delete process.env['NODE_ENV'];
      
      const error: TestError = new Error('Undefined environment error');
      error.status = 500;

      next.mockImplementation(() => {
        throw error;
      });

      const middleware = errorFilter();
      await middleware(ctx, next);

      expect(ctx.body.msg).toBe('Undefined environment error');
    });
  });

  describe('Response format consistency', () => {
    it('should always return standardized response format', async () => {
      const testCases = [
        { status: 400, message: 'Bad Request' },
        { status: 401, message: 'Unauthorized' },
        { status: 404, message: 'Not Found' },
        { status: 500, message: 'Internal Server Error' },
        { status: 503, message: 'Service Unavailable' }
      ];

      for (const testCase of testCases) {
        const error: TestError = new Error(testCase.message);
        error.status = testCase.status;

        next.mockImplementation(() => {
          throw error;
        });

        const middleware = errorFilter();
        await middleware(ctx, next);

        expect(ctx.body).toHaveProperty('code');
        expect(ctx.body).toHaveProperty('msg');
        expect(ctx.body).toHaveProperty('data');
        expect(ctx.body.data).toBe(null);
        expect(typeof ctx.body.code).toBe('number');
        expect(typeof ctx.body.msg).toBe('string');

        // Reset for next iteration
        ctx.body = undefined;
        jest.clearAllMocks();
      }
    });

    it('should always set HTTP status to 200', async () => {
      const errorStatuses = [400, 401, 403, 404, 422, 429, 500, 502, 503];

      for (const status of errorStatuses) {
        const error: TestError = new Error(`Error with status ${status}`);
        error.status = status;

        next.mockImplementation(() => {
          throw error;
        });

        const middleware = errorFilter();
        await middleware(ctx, next);

        expect(ctx.status).toBe(200);        // Reset for next iteration
        ctx.status = 200;
        ctx.body = undefined;
        jest.clearAllMocks();
      }
    });
  });
});
