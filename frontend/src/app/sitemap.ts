import type { MetadataRoute } from 'next';
import { SITE_URL as BASE } from '@/lib/seo';

export const revalidate = 3600;

const API_BASE =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:5000/api/v1';

const FETCH_TIMEOUT_MS = 1500;

function canFetchFromServer(url: string): boolean {
  return /^https?:\/\//.test(url);
}

async function fetchJson<T>(url: string): Promise<T | null> {
  if (!canFetchFromServer(API_BASE)) return null;

  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [productsRes, categoriesRes, brandsRes, blogRes] = await Promise.all([
    fetchJson<{ data: Array<{ slug: string; created_at: string }> }>(
      `${API_BASE}/products?limit=5000&is_active=true&is_public=true`
    ),
    fetchJson<{ data: Array<{ slug: string; updated_at: string }> }>(
      `${API_BASE}/categories?limit=1000&is_active=true`
    ),
    fetchJson<{ data: Array<{ slug: string; updated_at: string }> }>(
      `${API_BASE}/brands?limit=1000&is_active=true`
    ),
    fetchJson<{ data: Array<{ slug: string; updated_at: string }> }>(
      `${API_BASE}/blog-posts?limit=5000&is_published=true`
    ),
  ]);

  const products = productsRes?.data ?? [];
  const categories = categoriesRes?.data ?? [];
  const brands = brandsRes?.data ?? [];
  const blogPosts = blogRes?.data ?? [];

  const staticPages = [
    '/about',
    '/contact',
    '/faq',
    '/shipping',
    '/returns-policy',
    '/terms',
    '/privacy',
  ];

  return [
    { url: BASE, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE}/blog`, changeFrequency: 'daily' as const, priority: 0.8 },
    ...staticPages.map((path) => ({
      url: `${BASE}${path}`,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
    ...blogPosts.map((p) => ({
      url: `${BASE}/blog/${p.slug}`,
      lastModified: p.updated_at,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...products.map((p) => ({
      url: `${BASE}/products/${p.slug}`,
      lastModified: p.created_at,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...categories.map((c) => ({
      url: `${BASE}/categories/${c.slug}`,
      lastModified: c.updated_at,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...brands.map((b) => ({
      url: `${BASE}/brands/${b.slug}`,
      lastModified: b.updated_at,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}
