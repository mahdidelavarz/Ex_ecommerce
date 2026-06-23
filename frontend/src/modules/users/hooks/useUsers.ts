// src/modules/users/hooks/useUsers.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { userService } from '../services/user.service';
import type { UserListParams, UserRole } from '../types/user.types';

export function useUsers(params?: UserListParams) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => userService.list(params),
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) => userService.updateRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('نقش کاربر بروزرسانی شد');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'خطا در تغییر نقش'),
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      userService.updateStatus(id, is_active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('وضعیت کاربر بروزرسانی شد');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'خطا در تغییر وضعیت'),
  });
}
