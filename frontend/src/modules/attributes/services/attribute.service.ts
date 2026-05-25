// src/modules/attributes/services/attribute.service.ts
import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/modules/auth/types/auth.type';
import type { Attribute, AttributeMinimal, AttributeValue, AttributesResponse } from '../types/attribute.types';

export const attributeService = {
  /**
   * List attributes
   */
  list: async (params?: { search?: string; page?: number; limit?: number }): Promise<AttributesResponse> => {
    const response = await apiClient.get<ApiResponse<Attribute[]> & { meta: any }>('/attributes', { params });
    return { data: response.data.data, meta: response.data.meta };
  },

  /**
   * Get all attributes minimal (for dropdowns)
   */
  all: async (): Promise<AttributeMinimal[]> => {
    const response = await apiClient.get<ApiResponse<AttributeMinimal[]>>('/attributes/all');
    return response.data.data;
  },

  /**
   * Get single attribute
   */
  getById: async (id: string): Promise<Attribute> => {
    const response = await apiClient.get<ApiResponse<Attribute>>(`/attributes/${id}`);
    return response.data.data;
  },

  /**
   * Create attribute (admin)
   */
  create: async (data: { name: string; values?: { value: string; color_code?: string }[] }): Promise<Attribute> => {
    const response = await apiClient.post<ApiResponse<Attribute>>('/attributes', data);
    return response.data.data;
  },

  /**
   * Update attribute (admin)
   */
  update: async (id: string, data: { name?: string }): Promise<Attribute> => {
    const response = await apiClient.patch<ApiResponse<Attribute>>(`/attributes/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete attribute (admin)
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/attributes/${id}`);
  },

  /**
   * Add value to attribute (admin)
   */
  addValue: async (attributeId: string, data: { value: string; color_code?: string }): Promise<AttributeValue> => {
    const response = await apiClient.post<ApiResponse<AttributeValue>>(`/attributes/${attributeId}/values`, data);
    return response.data.data;
  },

  /**
   * Update value (admin)
   */
  updateValue: async (valueId: string, data: { value?: string; color_code?: string | null }): Promise<AttributeValue> => {
    const response = await apiClient.patch<ApiResponse<AttributeValue>>(`/attributes/values/${valueId}`, data);
    return response.data.data;
  },

  /**
   * Delete value (admin)
   */
  deleteValue: async (valueId: string): Promise<void> => {
    await apiClient.delete(`/attributes/values/${valueId}`);
  },
};