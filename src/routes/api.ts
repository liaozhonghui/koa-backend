import Router from 'koa-router';
import { StatusData, InfoData, EchoData, ApiResponse, ResponseCodes } from '../types';
import { logger } from '../singleton/logger';

const router = new Router({ prefix: '/api' });

// GET /api/status - API status endpoint
router.get('/status', async (ctx: any) => {
  logger.app.info('API status requested', { 
    requestId: (ctx as any).requestId 
  });
  
  const statusData: StatusData = {
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env['NODE_ENV'] || 'development',
    version: '1.0.0'
  };

  const response: ApiResponse<StatusData> = {
    code: ResponseCodes.SUCCESS,
    msg: 'API status retrieved successfully',
    data: statusData
  };
  
  ctx.body = response;
});

// GET /api/info - API information
router.get('/info', async (ctx: any) => {
  logger.app.info('API info requested', { 
    requestId: (ctx as any).requestId 
  });
  
  const infoData: InfoData = {
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

  const response: ApiResponse<InfoData> = {
    code: ResponseCodes.SUCCESS,
    msg: 'API information retrieved successfully',
    data: infoData
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
  
  const echoData: EchoData = {
    echo: data,
    timestamp: new Date().toISOString(),
    method: ctx.method,
    url: ctx.url
  };

  const response: ApiResponse<EchoData> = {
    code: ResponseCodes.SUCCESS,
    msg: 'Echo request processed successfully',
    data: echoData
  };
  
  ctx.body = response;
});

export default router;
