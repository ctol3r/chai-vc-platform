import { Request, Response, NextFunction } from 'express';
import { logger } from '../services/logger';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  logger.error({
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  }, 'Unhandled error');

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    details: isDevelopment ? err.stack : undefined
  });
}