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

const FETCH_TIMEOUT_MS = 1500;

function canFetchFromServer(url: string): boolean {
  return /^https?:\/\//.test(url);
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

type QueryValue = string | number | boolean | null | undefined;
type FetchCacheOptions = number | { revalidate?: number; tags?: string[] };

export const SERVER_CACHE_TAGS = {
  products: "products",
  categories: "categories",
  brands: "brands",
  blogPosts: "blog-posts",
} as const;

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

function resolveCacheOptions(options: FetchCacheOptions = 3600): {
  revalidate: number;
  tags?: string[];
} {
  if (typeof options === "number") {
    return { revalidate: options };
  }

  return {
    revalidate: options.revalidate ?? 3600,
    tags: options.tags,
  };
}

/**
 * Fetch a list endpoint that returns `{ data, meta }`. Cached for `revalidate`
 * seconds; on any failure returns empty data so pages render (and build) safely.
 */
async function fetchList<T>(
  path: string,
  params?: Record<string, QueryValue>,
  options?: FetchCacheOptions,
): Promise<{ data: T[]; meta: PageMeta | null }> {
  if (!canFetchFromServer(API_BASE)) {
    return { data: [], meta: null };
  }

  const cache = resolveCacheOptions(options);

  try {
    const res = await fetch(`${API_BASE}${path}${buildQuery(params)}`, {
      next: { revalidate: cache.revalidate, tags: cache.tags },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
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
  options?: FetchCacheOptions,
): Promise<T | null> {
  if (!canFetchFromServer(API_BASE)) {
    return null;
  }

  const cache = resolveCacheOptions(options);

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      next: { revalidate: cache.revalidate, tags: cache.tags },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: T };
    return json.data ?? null;
  } catch {
    return null;
  }
}

export function fetchProducts(
  params?: Record<string, QueryValue>,
  revalidate?: number,
) {
  return fetchList<ProductListResponse>("/products", params, {
    revalidate,
    tags: [SERVER_CACHE_TAGS.products],
  });
}

export function fetchCategories(
  params?: Record<string, QueryValue>,
  revalidate?: number,
) {
  return fetchList<Category>("/categories", params, {
    revalidate,
    tags: [SERVER_CACHE_TAGS.categories],
  });
}

export function fetchBrands(
  params?: Record<string, QueryValue>,
  revalidate?: number,
) {
  return fetchList<Brand>("/brands", params, {
    revalidate,
    tags: [SERVER_CACHE_TAGS.brands],
  });
}

export function fetchBlogPosts(
  params?: Record<string, QueryValue>,
  revalidate?: number,
) {
  return fetchList<BlogPostListItem>("/blog-posts", params, {
    revalidate,
    tags: [SERVER_CACHE_TAGS.blogPosts],
  });
}

export function fetchBlogPost(slug: string) {
  return fetchOne<BlogPostDetail>(`/blog-posts/${slug}`, {
    tags: [SERVER_CACHE_TAGS.blogPosts],
  });
}

export { fetchList, fetchOne };
