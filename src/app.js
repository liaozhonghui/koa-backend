const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const logger = require('koa-logger');
const json = require('koa-json');
require('dotenv').config();

// Import routes
const userRoutes = require('./routes/users');
const apiRoutes = require('./routes/api');

const app = new Koa();
const router = new Router();

// Middleware
app.use(logger());
app.use(cors());
app.use(json());
app.use(bodyParser());

// Error handling middleware
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = {
      error: {
        message: err.message || 'Internal Server Error',
        status: ctx.status
      }
    };
    console.error('Error:', err);
  }
});

// Health check endpoint
router.get('/', async (ctx) => {
  ctx.body = {
    message: 'Koa Backend API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  };
});

// Route middleware
app.use(router.routes());
app.use(router.allowedMethods());
app.use(userRoutes.routes());
app.use(userRoutes.allowedMethods());
app.use(apiRoutes.routes());
app.use(apiRoutes.allowedMethods());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/`);
});

module.exports = app;
