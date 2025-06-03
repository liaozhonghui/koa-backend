import Router from 'koa-router';
import { UserController } from '../modules/user/user.controller';
import { UserService } from '../modules/user/user.service';

const router = new Router({ prefix: '/api/users' });

// Create instances with dependency injection
const userService = new UserService();
const userController = new UserController(userService);

// GET /api/users - Get all users
router.get('/', (ctx: any) => userController.getAllUsers(ctx));

// GET /api/users/:id - Get user by ID
router.get('/:id', (ctx: any) => userController.getUserById(ctx));

// POST /api/users - Create new user
router.post('/', (ctx: any) => userController.createUser(ctx));

// PUT /api/users/:id - Update user
router.put('/:id', (ctx: any) => userController.updateUser(ctx));

// DELETE /api/users/:id - Delete user
router.delete('/:id', (ctx: any) => userController.deleteUser(ctx));

export default router;