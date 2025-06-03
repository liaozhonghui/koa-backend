import Router from 'koa-router';
import { authMiddleware } from '../middleware/auth';
import { AuthController } from '../modules/auth/auth.controller';
import { AuthService } from '../modules/auth/auth.service';

const router = new Router({ prefix: '/auth' });

// Create instances
const authService = new AuthService();
const authController = new AuthController(authService);

/**
 * POST /auth/login - User login/register
 * Registers new user or logs in existing user based on device_id
 */
router.post('/login', (ctx: any) => authController.login(ctx));

/**
 * GET /auth/user - Get current user info
 * Requires valid JWT token in Authorization header
 */
router.get('/user', authMiddleware(), (ctx: any) => authController.getUserInfo(ctx));

export default router;
