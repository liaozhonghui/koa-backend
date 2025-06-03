import { User, CreateUserRequest, UpdateUserRequest } from './user.entity';
import { UserService } from './user.service';
import { ApiResponse, ResponseCodes } from '../../types';
import { logger } from '../../singleton/logger';

export class UserController {
  /**
   * GET /api/users - Get all users
   */
  static async getAllUsers(ctx: any) {
    logger.business.info('Fetching all users', { 
      requestId: (ctx as any).requestId
    });
    
    const users = await UserService.getAllUsers();
    
    const response: ApiResponse<User[]> = {
      code: ResponseCodes.SUCCESS,
      msg: 'Users retrieved successfully',
      data: users
    };
    
    ctx.body = response;
  }

  /**
   * GET /api/users/:id - Get user by ID
   */
  static async getUserById(ctx: any) {
    const id = parseInt(ctx.params['id'] as string);
    
    logger.business.info('Fetching user by ID', { 
      requestId: (ctx as any).requestId,
      userId: id.toString()
    });
    
    const user = await UserService.getUserById(id);
    
    if (!user) {
      logger.business.warn('User not found', { 
        requestId: (ctx as any).requestId,
        userId: id.toString()
      });
      
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
  }

  /**
   * POST /api/users - Create new user
   */
  static async createUser(ctx: any) {
    const userData: CreateUserRequest = ctx.request.body as CreateUserRequest;
    const { name, email } = userData;
    
    logger.business.info('Creating new user', { 
      requestId: (ctx as any).requestId,
      name,
      email 
    });

    // Validate user data
    const validationError = UserService.validateUserData(userData);
    if (validationError) {
      logger.business.warn('User creation failed - validation error', { 
        requestId: (ctx as any).requestId,
        error: validationError
      });
      
      const response: ApiResponse<null> = {
        code: ResponseCodes.VALIDATION_ERROR,
        msg: validationError,
        data: null
      };
      ctx.body = response;
      return;
    }

    if (!name || !email) {
      logger.business.warn('User creation failed - missing required fields', { 
        requestId: (ctx as any).requestId,
        missingFields: { name: !name, email: !email }
      });
      
      const response: ApiResponse<null> = {
        code: ResponseCodes.VALIDATION_ERROR,
        msg: 'Name and email are required',
        data: null
      };
      ctx.body = response;
      return;
    }
    
    try {
      const newUser = await UserService.createUser(userData);
      
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
    } catch (error) {
      logger.business.error('User creation failed', error as Error, {
        requestId: (ctx as any).requestId,
        userData
      });

      const response: ApiResponse<null> = {
        code: ResponseCodes.INTERNAL_SERVER_ERROR,
        msg: 'Failed to create user',
        data: null
      };
      ctx.body = response;
    }
  }

  /**
   * PUT /api/users/:id - Update user
   */
  static async updateUser(ctx: any) {
    const id = parseInt(ctx.params['id'] as string);
    const updateData: UpdateUserRequest = ctx.request.body as UpdateUserRequest;
    const { name, email } = updateData;
    
    logger.business.info('Updating user', { 
      requestId: (ctx as any).requestId,
      userId: id.toString(),
      updates: { name, email }
    });

    // Validate update data
    const validationError = UserService.validateUserData(updateData);
    if (validationError) {
      logger.business.warn('User update failed - validation error', { 
        requestId: (ctx as any).requestId,
        userId: id.toString(),
        error: validationError
      });
      
      const response: ApiResponse<null> = {
        code: ResponseCodes.VALIDATION_ERROR,
        msg: validationError,
        data: null
      };
      ctx.body = response;
      return;
    }
    
    try {
      const updatedUser = await UserService.updateUser(id, updateData);
      
      if (!updatedUser) {
        logger.business.warn('User update failed - user not found', { 
          requestId: (ctx as any).requestId,
          userId: id.toString()
        });
        
        const response: ApiResponse<null> = {
          code: ResponseCodes.USER_NOT_FOUND,
          msg: 'User not found',
          data: null
        };
        ctx.body = response;
        return;
      }
      
      logger.business.info('User updated successfully', { 
        requestId: (ctx as any).requestId,
        userId: id.toString(),
        updatedUser
      });
      
      const response: ApiResponse<User> = {
        code: ResponseCodes.SUCCESS,
        msg: 'User updated successfully',
        data: updatedUser
      };
      
      ctx.body = response;
    } catch (error) {
      logger.business.error('User update failed', error as Error, {
        requestId: (ctx as any).requestId,
        userId: id.toString(),
        updateData
      });

      const response: ApiResponse<null> = {
        code: ResponseCodes.INTERNAL_SERVER_ERROR,
        msg: 'Failed to update user',
        data: null
      };
      ctx.body = response;
    }
  }

  /**
   * DELETE /api/users/:id - Delete user
   */
  static async deleteUser(ctx: any) {
    const id = parseInt(ctx.params['id'] as string);
    
    logger.business.info('Deleting user', { 
      requestId: (ctx as any).requestId,
      userId: id.toString()
    });
    
    try {
      const deletedUser = await UserService.deleteUser(id);
      
      if (!deletedUser) {
        logger.business.warn('User deletion failed - user not found', { 
          requestId: (ctx as any).requestId,
          userId: id.toString()
        });
        
        const response: ApiResponse<null> = {
          code: ResponseCodes.USER_NOT_FOUND,
          msg: 'User not found',
          data: null
        };
        ctx.body = response;
        return;
      }
      
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
    } catch (error) {
      logger.business.error('User deletion failed', error as Error, {
        requestId: (ctx as any).requestId,
        userId: id.toString()
      });

      const response: ApiResponse<null> = {
        code: ResponseCodes.INTERNAL_SERVER_ERROR,
        msg: 'Failed to delete user',
        data: null
      };
      ctx.body = response;
    }
  }
}
