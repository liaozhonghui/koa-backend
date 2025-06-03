import { ApiResponse } from '../types';

/**
 * Koa error handling middleware
 */
export function createErrorResponse(message: string, code: number = 500): ApiResponse<null> {
  return {
    code,
    msg: message,
    data: null
  };
}

export function handleError(error: unknown): { message: string; status: number } {
  let message = 'An unknown error occurred';
  let status = 500;
  if (error instanceof Error) {
    message = error.message;
  }
  return { message, status };
}

const errorHandler = async (ctx: any, next: () => Promise<any>) => {
  try {
    await next();
  } catch (error) {
    const { message, status } = handleError(error);
    ctx.status = status;
    ctx.body = createErrorResponse(message, status);
    ctx.app.emit('error', error, ctx);
  }
};

export default errorHandler;
