// src/modules/blog/types/blog.types.ts

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
  published_at: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
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

export interface BlogFormData {
  title: string;
  content: string;
  excerpt: string | null;
  cover_image: string | null;
  tags: string[];
  is_published: boolean;
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
}
