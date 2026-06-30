// src/modules/products/product.types.ts
export interface ProductListResponse {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  brand: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
  } | null;
  thumbnail: string | null;
  price_range: {
    min: number;
    max: number;
  };
  total_stock: number;
  variants_count: number;
  discount_percent: number;
  avg_rating: number;
  reviews_count: number;
  is_active: boolean;
  is_public: boolean;
  created_at: Date;
}

export interface ProductDetailResponse {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  full_description: string | null;
  specification: Record<string, any> | null;
  category: { id: string; name: string; slug: string } | null;
  brand: { id: string; name: string; slug: string; logo: string | null } | null;
  images: ProductImageResponse[];
  variants: ProductVariantResponse[];
  tags: { id: string; name: string; slug: string }[];
  seo: { title: string | null; description: string | null };
  avg_rating: number;
  reviews_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface ProductImageResponse {
  id: string;
  image_url: string;
  alt_text: string | null;
  is_thumbnail: boolean;
  sort_order: number;
}

export interface ProductVariantResponse {
  id: string;
  sku: string;
  price: number;
  compare_at_price: number | null;
  stock_quantity: number;
  is_active: boolean;
  attributes: { id: string; name: string; value: string; color_code: string | null }[];
  images: { id: string; image_url: string }[];
}

export interface ProductFiltersResponse {
  brands: { id: string; name: string; slug: string; logo: string | null; count: number }[];
  price_range: { min: number; max: number };
  attributes: Record<string, string[]>;
}

export interface CreateProductDto {
  category_id: string;
  brand_id?: string | null;
  title: string;
  short_description?: string | null;
  full_description?: string | null;
  specification?: Record<string, any> | null;
  seo_title?: string | null;
  seo_description?: string | null;
  is_active?: boolean;
  is_public?: boolean;
  images?: { image_url: string; alt_text?: string; is_thumbnail?: boolean; sort_order?: number }[];
  tag_ids?: string[];
}

export interface UpdateProductDto {
  category_id?: string;
  brand_id?: string | null;
  title?: string;
  short_description?: string | null;
  full_description?: string | null;
  specification?: Record<string, any> | null;
  seo_title?: string | null;
  seo_description?: string | null;
  is_active?: boolean;
  is_public?: boolean;
}

export interface ProductQueryParams {
  category_id?: string;
  brand_id?: string;
  tag?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
  is_active?: boolean;
  is_public?: boolean;
  has_stock?: boolean;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'ASC' | 'DESC';
}