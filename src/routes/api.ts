import Router from 'koa-router';
import { StatusResponse, InfoResponse, EchoResponse } from '../types';
import { logger } from '../utils/logger';

const router = new Router({ prefix: '/api' });

// GET /api/status - API status endpoint
router.get('/status', async (ctx: any) => {
  logger.app.info('API status requested', { 
    requestId: (ctx as any).requestId 
  });
  
  const response: StatusResponse = {
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env['NODE_ENV'] || 'development',
    version: '1.0.0'
  };
  
  ctx.body = response;
});

// GET /api/info - API information
router.get('/info', async (ctx: any) => {
  logger.app.info('API info requested', { 
    requestId: (ctx as any).requestId 
  });
  
  const response: InfoResponse = {
    name: 'Koa Backend API',
    description: 'A modern REST API built with Koa 3.0.0 and TypeScript',
    version: '1.0.0',
    author: 'Your Name',
    endpoints: {
      health: '/',
      status: '/api/status',
      users: '/api/users',
      info: '/api/info'
    }
  };
  
  ctx.body = response;
});

// POST /api/echo - Echo endpoint for testing
router.post('/echo', async (ctx: any) => {
  const data = ctx.request.body;
  
  logger.app.info('Echo endpoint called', { 
    requestId: (ctx as any).requestId,
    bodyType: typeof data,
    hasBody: !!data
  });
  
  const response: EchoResponse = {
    success: true,
    echo: data,
    timestamp: new Date().toISOString(),
    method: ctx.method,
    url: ctx.url
  };
  
  ctx.body = response;
});

export default router;
