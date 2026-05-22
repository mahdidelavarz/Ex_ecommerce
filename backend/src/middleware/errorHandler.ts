// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from "express";
import { AppError, ValidationError } from "../shared/utils/errors";
import { logger } from "../shared/utils/logger";
import { ApiResponseHelper } from "../shared/utils/response";
import { env } from "../config/env";
import { QueryFailedError } from "typeorm";

// Extend Request type locally
declare module "express" {
  interface Request {
    requestId?: string;
    startTime?: number;
    user?: any;
    userId?: string;
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // Log the error
  logger.error({
    message: err.message,
    stack: err.stack,
    requestId: req.requestId,
    path: req.path,
    method: req.method,
    body: JSON.stringify(req.body), // ← اضافه کن
    params: JSON.stringify(req.params), // ← اضافه کن
    query: JSON.stringify(req.query), // ← اضافه کن
    user: req.user?.id,
  });

  // Handle AppError instances
  if (err instanceof AppError) {
    if (err instanceof ValidationError) {
      ApiResponseHelper.error(res, err.message, err.statusCode, err.errors);
      return;
    }
    ApiResponseHelper.error(res, err.message, err.statusCode);
    return;
  }

  // Handle TypeORM errors
  if (err instanceof QueryFailedError) {
    // @ts-ignore - TypeORM types don't include code
    if (err.code === "23505") {
      ApiResponseHelper.error(res, "Duplicate entry found", 409);
      return;
    }
    // @ts-ignore
    if (err.code === "23503") {
      ApiResponseHelper.error(res, "Referenced resource not found", 404);
      return;
    }
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    ApiResponseHelper.error(res, "Invalid token", 401);
    return;
  }
  if (err.name === "TokenExpiredError") {
    ApiResponseHelper.error(res, "Token expired", 401);
    return;
  }

  // Handle Multer errors
  if (err.name === "MulterError") {
    ApiResponseHelper.error(res, err.message, 400);
    return;
  }

  // Default error
  const message =
    env.nodeEnv === "development" ? err.message : "Internal server error";

  ApiResponseHelper.error(res, message, 500);
};
