'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { settingService } from '../services/setting.service';
import toast from 'react-hot-toast';

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

function errorMessage(error: ApiError, fallback: string) {
  return error.response?.data?.message || fallback;
}

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
    onSuccess: async (data) => {
      queryClient.setQueryData(['settings', data.key], data);
      await queryClient.invalidateQueries({
        queryKey: ['settings'],
        refetchType: 'active',
      });
      toast.success('تنظیمات ذخیره شد');
    },
    onError: (error: ApiError) =>
      toast.error(errorMessage(error, 'خطا در ذخیره')),
  });
}
