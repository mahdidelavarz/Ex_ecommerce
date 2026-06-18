// src/modules/auth/services/address.service.ts
import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/modules/auth/types/auth.type';

export interface UserAddress {
  id: string;
  full_name: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  address_line_1: string;
  address_line_2: string | null;
  postal_code: string;
  is_default_shipping: boolean;
  is_default_billing: boolean;
  created_at: string;
}

export interface CreateAddressDto {
  full_name: string;
  phone: string;
  country?: string;
  state: string;
  city: string;
  address_line_1: string;
  address_line_2?: string;
  postal_code: string;
  is_default_shipping?: boolean;
  is_default_billing?: boolean;
}

export const addressService = {
  list: async (): Promise<UserAddress[]> => {
    const r = await apiClient.get<ApiResponse<UserAddress[]>>('/auth/addresses');
    return r.data.data;
  },

  create: async (data: CreateAddressDto): Promise<UserAddress> => {
    const r = await apiClient.post<ApiResponse<UserAddress>>('/auth/addresses', data);
    return r.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/auth/addresses/${id}`);
  },
};
