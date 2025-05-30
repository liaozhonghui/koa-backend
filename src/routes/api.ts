import Router from 'koa-router';
import { StatusResponse, InfoResponse, EchoResponse } from '../types';

const router = new Router({ prefix: '/api' });

// GET /api/status - API status endpoint
router.get('/status', async (ctx) => {
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
router.get('/info', async (ctx) => {
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
router.post('/echo', async (ctx) => {
  const data = ctx.request.body;
  
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
