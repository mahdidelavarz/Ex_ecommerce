// src/modules/variants/hooks/useVariants.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { variantService } from '../services/variant.service';

export function useVariants(productId: string) {
  return useQuery({
    queryKey: ['variants', productId],
    queryFn: () => variantService.listByProduct(productId),
    enabled: !!productId,
    staleTime: 2 * 60 * 1000,
  });
}