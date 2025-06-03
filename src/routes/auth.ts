import Router from 'koa-router';
import { authMiddleware } from '../middleware/auth';
import { AuthController } from '../modules/auth/auth.controller';

const router = new Router({ prefix: '/auth' });

/**
 * POST /auth/login - User login/register
 * Registers new user or logs in existing user based on device_id
 */
router.post('/login', AuthController.login);

/**
 * GET /auth/user - Get current user info
 * Requires valid JWT token in Authorization header
 */
router.get('/user', authMiddleware(), AuthController.getUserInfo);

export default router;
