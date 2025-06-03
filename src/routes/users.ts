import Router from 'koa-router';
import { User, CreateUserRequest, UpdateUserRequest, ApiResponse, ResponseCodes } from '../types';
import { logger } from '../utils/logger';

const router = new Router({ prefix: '/api/users' });

// Mock data for demonstration
let users: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', createdAt: new Date() },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', createdAt: new Date() }
];

// GET /api/users - Get all users
router.get('/', async (ctx: any) => {
  logger.business.info('Fetching all users', { 
    requestId: (ctx as any).requestId,
    userCount: users.length 
  });
  
  const response: ApiResponse<User[]> = {
    code: ResponseCodes.SUCCESS,
    msg: 'Users retrieved successfully',
    data: users
  };
  
  ctx.body = response;
});

// GET /api/users/:id - Get user by ID
router.get('/:id', async (ctx: any) => {
  const id = parseInt(ctx.params['id'] as string);
  
  logger.business.info('Fetching user by ID', { 
    requestId: (ctx as any).requestId,
    userId: id.toString()
  });
  
  const user = users.find(u => u.id === id);
    if (!user) {
    logger.business.warn('User not found', { 
      requestId: (ctx as any).requestId,
      userId: id.toString()
    });
    
    // Always return HTTP 200, but with error code
    const response: ApiResponse<null> = {
      code: ResponseCodes.USER_NOT_FOUND,
      msg: 'User not found',
      data: null
    };
    ctx.body = response;
    return;
  }
  
  const response: ApiResponse<User> = {
    code: ResponseCodes.SUCCESS,
    msg: 'User retrieved successfully',
    data: user
  };
  
  ctx.body = response;
});

// POST /api/users - Create new user
router.post('/', async (ctx: any) => {
  const { name, email }: CreateUserRequest = ctx.request.body as CreateUserRequest;
  
  logger.business.info('Creating new user', { 
    requestId: (ctx as any).requestId,
    name,
    email 
  });
    if (!name || !email) {
    logger.business.warn('User creation failed - missing required fields', { 
      requestId: (ctx as any).requestId,
      missingFields: { name: !name, email: !email }
    });
    
    // Always return HTTP 200, but with validation error code
    const response: ApiResponse<null> = {
      code: ResponseCodes.VALIDATION_ERROR,
      msg: 'Name and email are required',
      data: null
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
    logger.business.info('User created successfully', { 
    requestId: (ctx as any).requestId,
    userId: newUser.id.toString(),
    name: newUser.name,
    email: newUser.email 
  });
  
  const response: ApiResponse<User> = {
    code: ResponseCodes.CREATED,
    msg: 'User created successfully',
    data: newUser
  };
  
  ctx.body = response;
});

// PUT /api/users/:id - Update user
router.put('/:id', async (ctx: any) => {
  const id = parseInt(ctx.params['id'] as string);
  const { name, email }: UpdateUserRequest = ctx.request.body as UpdateUserRequest;
  
  logger.business.info('Updating user', { 
    requestId: (ctx as any).requestId,
    userId: id.toString(),
    updates: { name, email }
  });
  
  const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
    logger.business.warn('User update failed - user not found', { 
      requestId: (ctx as any).requestId,
      userId: id.toString()
    });
    
    // Always return HTTP 200, but with not found error code
    const response: ApiResponse<null> = {
      code: ResponseCodes.USER_NOT_FOUND,
      msg: 'User not found',
      data: null
    };
    ctx.body = response;
    return;
  }
  
  if (name) users[userIndex]!.name = name;
  if (email) users[userIndex]!.email = email;
  users[userIndex]!.updatedAt = new Date();
  
  logger.business.info('User updated successfully', { 
    requestId: (ctx as any).requestId,
    userId: id.toString(),
    updatedUser: users[userIndex]
  });
  
  const response: ApiResponse<User> = {
    code: ResponseCodes.SUCCESS,
    msg: 'User updated successfully',
    data: users[userIndex]!
  };
  
  ctx.body = response;
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', async (ctx: any) => {
  const id = parseInt(ctx.params['id'] as string);
  
  logger.business.info('Deleting user', { 
    requestId: (ctx as any).requestId,
    userId: id.toString()
  });
  
  const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
    logger.business.warn('User deletion failed - user not found', { 
      requestId: (ctx as any).requestId,
      userId: id.toString()
    });
    
    // Always return HTTP 200, but with not found error code
    const response: ApiResponse<null> = {
      code: ResponseCodes.USER_NOT_FOUND,
      msg: 'User not found',
      data: null
    };
    ctx.body = response;
    return;
  }
  
  const deletedUser = users.splice(userIndex, 1)[0]!;
  
  logger.business.info('User deleted successfully', { 
    requestId: (ctx as any).requestId,
    userId: id.toString(),
    deletedUser: {
      name: deletedUser.name,
      email: deletedUser.email
    }
  });
  
  const response: ApiResponse<User> = {
    code: ResponseCodes.SUCCESS,
    msg: 'User deleted successfully',
    data: deletedUser
  };
  
  ctx.body = response;
});

export default router;
