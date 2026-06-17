// src/modules/tags/types/tag.types.ts
export interface Tag {
  id: string;
  name: string;
  slug: string;
  products_count: number;
}

export interface TagsResponse {
  data: Tag[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
