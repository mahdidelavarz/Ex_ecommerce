// src/modules/auth/hooks/useAddresses.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addressService, type CreateAddressDto } from '../services/address.service';
import toast from 'react-hot-toast';

export function useAddresses() {
  return useQuery({
    queryKey: ['addresses'],
    queryFn: addressService.list,
  });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAddressDto) => addressService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('آدرس با موفقیت اضافه شد');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'خطا در ذخیره آدرس');
    },
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addressService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('آدرس حذف شد');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'خطا در حذف آدرس');
    },
  });
}
