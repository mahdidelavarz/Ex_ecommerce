// src/modules/blog/blog.types.ts

export interface BlogAuthor {
  id: string;
  full_name: string | null;
}

export interface BlogPostListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  tags: string[];
  author: BlogAuthor | null;
  is_published: boolean;
  published_at: Date | null;
  view_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface BlogPostDetail extends BlogPostListItem {
  content: string;
  seo: {
    title: string | null;
    description: string | null;
    keywords: string | null;
  };
  related: BlogPostListItem[];
}

export interface BlogQueryParams {
  search?: string;
  tag?: string;
  is_published?: boolean;
  page?: number;
  limit?: number;
  sort_by?: 'created_at' | 'published_at' | 'view_count' | 'title';
  sort_order?: 'ASC' | 'DESC';
}

export interface CreateBlogDto {
  title: string;
  content: string;
  excerpt?: string | null;
  cover_image?: string | null;
  tags?: string[];
  is_published?: boolean;
  published_at?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string | null;
}

export interface UpdateBlogDto {
  title?: string;
  content?: string;
  excerpt?: string | null;
  cover_image?: string | null;
  tags?: string[];
  is_published?: boolean;
  published_at?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string | null;
}
