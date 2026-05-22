// src/shared/types/common.types.ts
export interface JwtPayload {
  userId: string;
  email?: string;
  phone?: string;
  role: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface QueryFilters {
  search?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  [key: string]: any;
}

export type SortOrder = 'ASC' | 'DESC';