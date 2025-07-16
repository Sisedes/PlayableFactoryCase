import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {

  let error = { ...err };
  error.message = err.message;

  console.error('❌ Error:', err);

  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { name: 'CastError', message, statusCode: 404 };
  }

  
  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    const message = 'Duplicate field value entered';
    error = { name: 'ValidationError', message, statusCode: 400 };
  }

  
  if (err.name === 'ValidationError') {
    const message = Object.values((err as any).errors).map((val: any) => val.message).join(', ');
    error = { name: 'ValidationError', message, statusCode: 400 };
  }

  
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token. Please log in again.';
    error = { name: 'JsonWebTokenError', message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired. Please log in again.';
    error = { name: 'TokenExpiredError', message, statusCode: 401 };
  }

  res.status(error.statusCode || 500).json({
    status: 'error',
    message: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const notFound = (req: Request, _res: Response, next: NextFunction): void => {
  const error = new Error(`Not Found - ${req.originalUrl}`) as CustomError;
  error.statusCode = 404;
  next(error);
};

export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
}; 