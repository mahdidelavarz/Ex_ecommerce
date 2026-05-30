// src/modules/shipments/hooks/useShipments.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shipmentService } from '../services/shipment.service';
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
    mutationFn: ({ id, data }: { id: string; data: any }) => shipmentService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('بروزرسانی شد');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'خطا');
    },
  });
}