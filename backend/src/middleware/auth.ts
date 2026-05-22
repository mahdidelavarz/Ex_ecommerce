// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppDataSource } from '../config/database';
import { User } from '../database/entities/user.entity';
import { UnauthorizedError, ForbiddenError } from '../shared/utils/errors';
import { JwtPayload } from '../shared/types/common.types';
import { UserRole } from '../shared/constants/enums';
import { asyncHandler } from './asyncHandler';

export const authenticate = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication required');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, env.jwt.accessSecret) as JwtPayload;
      
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { id: decoded.userId, is_active: true },
      });

      if (!user) {
        throw new UnauthorizedError('User not found or account disabled');
      }

      req.user = user;
      req.userId = user.id;
      next();
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      throw new UnauthorizedError('Invalid or expired token');
    }
  }
);

export const optionalAuth = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, env.jwt.accessSecret) as JwtPayload;
      
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { id: decoded.userId, is_active: true },
      });

      if (user) {
        req.user = user;
        req.userId = user.id;
      }
    } catch (error) {
      // Ignore auth errors for optional auth
    }
    
    next();
  }
);

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError('Insufficient permissions');
    }

    next();
  };
};