export type RevalidatePathEntry =
  | string
  | { path: string; type?: 'page' | 'layout' };

export const STOREFRONT_CACHE_SCOPES = [
  'products',
  'categories',
  'brands',
  'settings',
  'blog',
  'reviews',
] as const;

export type StorefrontCacheScope = (typeof STOREFRONT_CACHE_SCOPES)[number];

type RevalidationConfig = {
  paths: readonly RevalidatePathEntry[];
  tags: readonly string[];
};

/**
 * The server owns the actual paths and tags. Clients submit only named scopes,
 * preventing arbitrary cache keys from being purged through the route handler.
 */
export const STOREFRONT_REVALIDATION: Record<
  StorefrontCacheScope,
  RevalidationConfig
> = {
  categories: {
    tags: ['categories', 'products'],
    paths: [
      '/',
      '/products',
      '/sitemap.xml',
      { path: '/categories/[slug]', type: 'page' },
    ],
  },
  products: {
    tags: ['products'],
    paths: [
      '/',
      '/products',
      '/sitemap.xml',
      { path: '/products/[slug]', type: 'page' },
      { path: '/brands/[slug]', type: 'page' },
      { path: '/categories/[slug]', type: 'page' },
    ],
  },
  brands: {
    tags: ['brands', 'products'],
    paths: [
      '/',
      '/brands',
      '/products',
      '/sitemap.xml',
      { path: '/brands/[slug]', type: 'page' },
      { path: '/products/[slug]', type: 'page' },
    ],
  },
  settings: {
    tags: ['settings'],
    paths: [{ path: '/', type: 'layout' }, '/about', '/contact'],
  },
  blog: {
    tags: ['blog-posts'],
    paths: [
      '/',
      '/blog',
      '/sitemap.xml',
      { path: '/blog/[slug]', type: 'page' },
    ],
  },
  reviews: {
    tags: ['products'],
    paths: [{ path: '/products/[slug]', type: 'page' }],
  },
};

export function isStorefrontCacheScope(
  value: unknown,
): value is StorefrontCacheScope {
  return (
    typeof value === 'string' &&
    (STOREFRONT_CACHE_SCOPES as readonly string[]).includes(value)
  );
}

export async function revalidateStorefront(
  ...scopes: StorefrontCacheScope[]
): Promise<void> {
  try {
    await fetch('/api/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      cache: 'no-store',
      body: JSON.stringify({ scopes }),
    });
  } catch {
    /* Cache refresh must never turn a successful admin mutation into a failure. */
  }
}
