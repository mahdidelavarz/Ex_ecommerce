// src/lib/server-fetch.ts
// Server-side data fetching for Server Components and route handlers (sitemap, etc.).
// Uses raw fetch with Next's data cache — NOT the axios apiClient, which imports the
// client auth store and is client-only. Resource-agnostic so new resources (e.g. blog
// posts) can be added with a one-line helper.
import type { ProductListResponse } from "@/modules/products/types/product.types";
import type { Category } from "@/modules/categories/types/category.types";
import type { Brand } from "@/modules/brands/types/brand.types";
import type {
  BlogPostListItem,
  BlogPostDetail,
} from "@/modules/blog/types/blog.types";

// Server Components run inside the container, where the browser-facing
// `localhost:5000` does NOT reach the backend. Prefer a server-only internal URL
// (the Docker service name, e.g. http://backend:5000/api/v1) and fall back to the
// public URL for local/non-docker runs.
const API_BASE =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api/v1";

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

type QueryValue = string | number | boolean | null | undefined;

function buildQuery(params?: Record<string, QueryValue>): string {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

/**
 * Fetch a list endpoint that returns `{ data, meta }`. Cached for `revalidate`
 * seconds; on any failure returns empty data so pages render (and build) safely.
 */
async function fetchList<T>(
  path: string,
  params?: Record<string, QueryValue>,
  revalidate = 3600,
): Promise<{ data: T[]; meta: PageMeta | null }> {
  try {
    const res = await fetch(`${API_BASE}${path}${buildQuery(params)}`, {
      next: { revalidate },
    });
    if (!res.ok) return { data: [], meta: null };
    const json = (await res.json()) as { data?: T[]; meta?: PageMeta };
    return { data: json.data ?? [], meta: json.meta ?? null };
  } catch {
    return { data: [], meta: null };
  }
}

/** Fetch a single resource by slug; null on failure. */
async function fetchOne<T>(
  path: string,
  revalidate = 3600,
): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, { next: { revalidate } });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: T };
    return json.data ?? null;
  } catch {
    return null;
  }
}

export function fetchProducts(params?: Record<string, QueryValue>) {
  return fetchList<ProductListResponse>("/products", params);
}

export function fetchCategories(params?: Record<string, QueryValue>) {
  return fetchList<Category>("/categories", params);
}

export function fetchBrands(params?: Record<string, QueryValue>) {
  return fetchList<Brand>("/brands", params);
}

export function fetchBlogPosts(params?: Record<string, QueryValue>) {
  return fetchList<BlogPostListItem>("/blog-posts", params);
}

export function fetchBlogPost(slug: string) {
  return fetchOne<BlogPostDetail>(`/blog-posts/${slug}`);
}

export { fetchList, fetchOne };
