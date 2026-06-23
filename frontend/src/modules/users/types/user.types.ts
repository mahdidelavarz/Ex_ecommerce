// src/modules/users/types/user.types.ts
export type UserRole = 'customer' | 'admin' | 'support';

export interface AdminUser {
  id: string;
  full_name: string | null;
  email: string | null;
  phone_number: string | null;
  role: UserRole;
  is_active: boolean;
  profile_completed: boolean;
  last_login_at: string | null;
  created_at: string;
  orders_count?: number;
}

export interface UserListParams {
  search?: string;
  role?: UserRole;
  is_active?: boolean;
  page?: number;
  limit?: number;
}
