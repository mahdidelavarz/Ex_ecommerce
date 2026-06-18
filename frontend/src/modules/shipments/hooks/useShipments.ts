// src/modules/shipments/hooks/useShipments.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shipmentService } from '../services/shipment.service';
import type { UpdateShipmentDto } from '../types/shipment.types';
import toast from 'react-hot-toast';

export function useShipments(orderId: string) {
  return useQuery({
    queryKey: ['shipments', orderId],
    queryFn: () => shipmentService.findByOrder(orderId),
    enabled: !!orderId,
  });
}

export function useCreateShipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: shipmentService.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['shipments', data.order_id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('ارسال ایجاد شد');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'خطا');
    },
  });
}

export function useUpdateShipment() {
  const queryClient = useQueryClient();

  return useMutation({
    // SHP-F2: orderId in variables so we can narrow the invalidation key
    // SHP-F5: typed data instead of any
    mutationFn: ({ id, data }: { id: string; orderId: string; data: UpdateShipmentDto }) =>
      shipmentService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['shipments', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('بروزرسانی شد');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'خطا');
    },
  });
}
