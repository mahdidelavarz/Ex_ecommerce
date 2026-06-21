// src/modules/settings/hooks/useSettings.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingService } from '../services/setting.service';
import toast from 'react-hot-toast';

export function useAdminSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: settingService.list,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSetting(key: string) {
  return useQuery({
    queryKey: ['settings', key],
    queryFn: () => settingService.getByKey(key),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      settingService.update(key, value),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.setQueryData(['settings', data.key], data);
      toast.success('تنظیمات ذخیره شد');
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'خطا در ذخیره'),
  });
}
