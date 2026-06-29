'use client';

import { useQuery } from '@tanstack/react-query';
import { productService } from '@/modules/products/services/product.service';

/**
 * Live product suggestions for the search page. Reuses the products list
 * endpoint (no dedicated autocomplete API yet) with a small limit, gated so it
 * only fires once the term is meaningful. Shares the ['products', …] cache.
 */
export function useSearchSuggestions(term: string, limit = 6) {
  const q = term.trim();
  return useQuery({
    queryKey: ['products', { search: q, limit }],
    queryFn: () => productService.list({ search: q, limit }),
    enabled: q.length >= 2,
    staleTime: 60 * 1000,
  });
}
