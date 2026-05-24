// src/modules/brands/types/brand.types.ts
export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  products_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BrandMinimal {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
}

export interface BrandsResponse {
  data: Brand[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}