import type { MetadataRoute } from 'next';

export const revalidate = 3600;

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yoursite.com';

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [productsRes, categoriesRes, brandsRes] = await Promise.all([
    fetchJson<{ data: Array<{ slug: string; created_at: string }> }>(
      `${API_BASE}/products?limit=5000&is_active=true&is_public=true`
    ),
    fetchJson<{ data: Array<{ slug: string; updated_at: string }> }>(
      `${API_BASE}/categories?limit=1000&is_active=true`
    ),
    fetchJson<{ data: Array<{ slug: string; updated_at: string }> }>(
      `${API_BASE}/brands?limit=1000&is_active=true`
    ),
  ]);

  const products = productsRes?.data ?? [];
  const categories = categoriesRes?.data ?? [];
  const brands = brandsRes?.data ?? [];

  return [
    { url: BASE, changeFrequency: 'daily', priority: 1.0 },
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
