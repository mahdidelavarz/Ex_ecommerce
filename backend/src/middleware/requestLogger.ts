// src/middleware/requestLogger.ts
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../shared/utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  // Add request ID
  req.requestId = uuidv4();
  req.startTime = Date.now();

  // Log request
  logger.info({
    requestId: req.requestId,
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - (req.startTime || 0);
    
    logger.info({
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
};