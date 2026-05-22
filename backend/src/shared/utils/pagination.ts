// src/shared/utils/pagination.ts
import { FindManyOptions, FindOptionsWhere, Repository, ObjectLiteral } from 'typeorm';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export async function paginate<T extends ObjectLiteral>(
  repository: Repository<T>,
  options: PaginationOptions,
  where?: FindOptionsWhere<T> | FindOptionsWhere<T>[],
  relations?: string[]
): Promise<PaginatedResult<T>> {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(100, Math.max(1, options.limit || 10));
  const skip = (page - 1) * limit;

  const findOptions: FindManyOptions<T> = {
    skip,
    take: limit,
    where,
    relations,
  };

  if (options.sortBy) {
    findOptions.order = {
      [options.sortBy]: options.sortOrder || 'DESC',
    } as any;
  }

  const [data, total] = await repository.findAndCount(findOptions);

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}