import Router from 'koa-router';
import { User, CreateUserRequest, UpdateUserRequest, ApiResponse } from '../types';

const router = new Router({ prefix: '/api/users' });

// Mock data for demonstration
let users: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', createdAt: new Date() },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', createdAt: new Date() }
];

// GET /api/users - Get all users
router.get('/', async (ctx) => {
  const response: ApiResponse<User[]> = {
    success: true,
    data: users,
    count: users.length
  };
  
  ctx.body = response;
});

// GET /api/users/:id - Get user by ID
router.get('/:id', async (ctx) => {
  const id = parseInt(ctx.params['id'] as string);
  const user = users.find(u => u.id === id);
  
  if (!user) {
    ctx.status = 404;
    const response: ApiResponse = {
      success: false,
      error: 'User not found'
    };
    ctx.body = response;
    return;
  }
  
  const response: ApiResponse<User> = {
    success: true,
    data: user
  };
  
  ctx.body = response;
});

// POST /api/users - Create new user
router.post('/', async (ctx) => {
  const { name, email }: CreateUserRequest = ctx.request.body as CreateUserRequest;
  
  if (!name || !email) {
    ctx.status = 400;
    const response: ApiResponse = {
      success: false,
      error: 'Name and email are required'
    };
    ctx.body = response;
    return;
  }
  
  const newUser: User = {
    id: users.length + 1,
    name,
    email,
    createdAt: new Date()
  };
  
  users.push(newUser);
  
  ctx.status = 201;
  const response: ApiResponse<User> = {
    success: true,
    data: newUser,
    message: 'User created successfully'
  };
  
  ctx.body = response;
});

// PUT /api/users/:id - Update user
router.put('/:id', async (ctx) => {
  const id = parseInt(ctx.params['id'] as string);
  const { name, email }: UpdateUserRequest = ctx.request.body as UpdateUserRequest;
  const userIndex = users.findIndex(u => u.id === id);
  
  if (userIndex === -1) {
    ctx.status = 404;
    const response: ApiResponse = {
      success: false,
      error: 'User not found'
    };
    ctx.body = response;
    return;
  }
  
  if (name) users[userIndex]!.name = name;
  if (email) users[userIndex]!.email = email;
  users[userIndex]!.updatedAt = new Date();
  
  const response: ApiResponse<User> = {
    success: true,
    data: users[userIndex]!,
    message: 'User updated successfully'
  };
  
  ctx.body = response;
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', async (ctx) => {
  const id = parseInt(ctx.params['id'] as string);
  const userIndex = users.findIndex(u => u.id === id);
  
  if (userIndex === -1) {
    ctx.status = 404;
    const response: ApiResponse = {
      success: false,
      error: 'User not found'
    };
    ctx.body = response;
    return;
  }
  
  const deletedUser = users.splice(userIndex, 1)[0]!;
  
  const response: ApiResponse<User> = {
    success: true,
    data: deletedUser,
    message: 'User deleted successfully'
  };
  
  ctx.body = response;
});

export default router;
