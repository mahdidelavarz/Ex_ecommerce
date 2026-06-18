// src/modules/shipments/services/shipment.service.ts
import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/modules/auth/types/auth.type';
import type { Shipment, UpdateShipmentDto } from '../types/shipment.types';

export const shipmentService = {
  findByOrder: async (orderId: string): Promise<Shipment[]> => {
    const r = await apiClient.get<ApiResponse<Shipment[]>>(`/shipments/order/${orderId}`);
    return r.data.data;
  },

  getById: async (id: string): Promise<Shipment> => {
    const r = await apiClient.get<ApiResponse<Shipment>>(`/shipments/${id}`);
    return r.data.data;
  },

  create: async (data: {
    order_id: string;
    tracking_number: string;
    courier_name: string;
    tracking_url?: string;
    estimated_delivery_at?: string;
    notes?: string;
  }): Promise<Shipment> => {
    const r = await apiClient.post<ApiResponse<Shipment>>('/shipments', data);
    return r.data.data;
  },

  update: async (id: string, data: UpdateShipmentDto): Promise<Shipment> => {
    const r = await apiClient.patch<ApiResponse<Shipment>>(`/shipments/${id}`, data);
    return r.data.data;
  },
};