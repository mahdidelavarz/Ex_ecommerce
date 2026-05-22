// src/modules/categories/category.types.ts
export interface CategoryTreeNode {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  description: string | null;
  image: string | null;
  icon: string | null;
  color: string | null;
  sort_order: number;
  is_active: boolean;
  children: CategoryTreeNode[];
}

export interface CategoryListResponse {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  icon: string | null;
  color: string | null;
  sort_order: number;
  is_active: boolean;
  children_count: number;
  products_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCategoryDto {
  parent_id?: string | null;
  name: string;
  description?: string | null;
  image?: string | null;
  icon?: string | null;
  color?: string | null;
  sort_order?: number;
  is_active?: boolean;
  seo_title?: string | null;
  seo_description?: string | null;
}


export interface UpdateCategoryDto {
  parent_id?: string | null;
  name?: string;
  slug?: string; // ← اضافه کن
  description?: string | null;
  image?: string | null;
  icon?: string | null;
  color?: string | null;
  sort_order?: number;
  is_active?: boolean;
  seo_title?: string | null;
  seo_description?: string | null;
}

export interface BulkSortDto {
  items: Array<{
    id: string;
    sort_order: number;
  }>;
}