// src/modules/tags/tag.types.ts
export interface TagResponse {
  id: string;
  name: string;
  slug: string;
  products_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTagDto {
  name: string;
}

export interface UpdateTagDto {
  name?: string;
}