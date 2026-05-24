// src/modules/brands/brand.types.ts
export interface BrandResponse {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  products_count: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface BrandMinimal {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
}

export interface CreateBrandDto {
  name: string;
  logo?: string | null;
  description?: string | null;
}

export interface UpdateBrandDto {
  name?: string;
  logo?: string | null;
  description?: string | null;
}