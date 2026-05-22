// src/modules/categories/types/category.types.ts
export interface Category {
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
  created_at: string;
  updated_at: string;
}

export interface CategoryDetail extends Category {
  parent: {
    id: string;
    name: string;
    slug: string;
  } | null;
  children: Array<{
    id: string;
    name: string;
    slug: string;
    image: string | null;
  }>;
  seo: {
    title: string | null;
    description: string | null;
  };
}

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

export interface CategoriesResponse {
  data: Category[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}