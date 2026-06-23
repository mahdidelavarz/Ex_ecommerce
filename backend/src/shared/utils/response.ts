// src/shared/utils/response.ts
import { Response } from 'express';

interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
    [key: string]: unknown;
  };
  errors?: Record<string, string[]>;
}

export class ApiResponseHelper {
  static success<T>(
    res: Response,
    data: T,
    message: string = 'Success',
    statusCode: number = 200,
    meta?: ApiResponse['meta']
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      statusCode,
      message,
      data,
    };

    if (meta) {
      response.meta = meta;
    }

    return res.status(statusCode).json(response);
  }

  static created<T>(
    res: Response,
    data: T,
    message: string = 'Created successfully'
  ): Response {
    return this.success(res, data, message, 201);
  }

  static noContent(res: Response, message: string = 'No content'): Response {
    return res.status(204).json({
      success: true,
      statusCode: 204,
      message,
    });
  }

  static error(
    res: Response,
    message: string = 'Internal server error',
    statusCode: number = 500,
    errors?: Record<string, string[]>
  ): Response {
    const response: ApiResponse = {
      success: false,
      statusCode,
      message,
    };

    if (errors) {
      response.errors = errors;
    }

    return res.status(statusCode).json(response);
  }

  static paginated<T>(
    res: Response,
    data: T[],
    total: number,
    page: number,
    limit: number,
    message: string = 'Success'
  ): Response {
    const totalPages = Math.ceil(total / limit);
    
    return this.success(res, data, message, 200, {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    });
  }
}