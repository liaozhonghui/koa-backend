const Router = require('koa-router');
const router = new Router({ prefix: '/api' });

// GET /api/status - API status endpoint
router.get('/status', async (ctx) => {
  ctx.body = {
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  };
});

// GET /api/info - API information
router.get('/info', async (ctx) => {
  ctx.body = {
    name: 'Koa Backend API',
    description: 'A modern REST API built with Koa 3.0.0',
    version: '1.0.0',
    author: 'Your Name',
    endpoints: {
      health: '/',
      status: '/api/status',
      users: '/api/users',
      info: '/api/info'
    }
  };
});

// POST /api/echo - Echo endpoint for testing
router.post('/echo', async (ctx) => {
  const data = ctx.request.body;
  
  ctx.body = {
    success: true,
    echo: data,
    timestamp: new Date().toISOString(),
    method: ctx.method,
    url: ctx.url
  };
});

module.exports = router;
