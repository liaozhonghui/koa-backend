import Router from 'koa-router';
import { UserController } from '../modules/user/user.controller';

const router = new Router({ prefix: '/api/users' });

// GET /api/users - Get all users
router.get('/', UserController.getAllUsers);

// GET /api/users/:id - Get user by ID
router.get('/:id', UserController.getUserById);

// POST /api/users - Create new user
router.post('/', UserController.createUser);

// PUT /api/users/:id - Update user
router.put('/:id', UserController.updateUser);

// DELETE /api/users/:id - Delete user
router.delete('/:id', UserController.deleteUser);

export default router;