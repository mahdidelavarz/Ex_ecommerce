export type RevalidatePathEntry =
  | string
  | { path: string; type?: 'page' | 'layout' };

export const CATEGORY_REVALIDATE_PATHS: RevalidatePathEntry[] = [
  '/',
  '/products',
  '/sitemap.xml',
  { path: '/categories/[slug]', type: 'page' },
];

export const PRODUCT_REVALIDATE_PATHS: RevalidatePathEntry[] = [
  '/',
  '/products',
  '/sitemap.xml',
  { path: '/products/[slug]', type: 'page' },
  { path: '/brands/[slug]', type: 'page' },
  { path: '/categories/[slug]', type: 'page' },
];

export const BRAND_REVALIDATE_PATHS: RevalidatePathEntry[] = [
  '/',
  '/brands',
  '/products',
  '/sitemap.xml',
  { path: '/brands/[slug]', type: 'page' },
  { path: '/products/[slug]', type: 'page' },
];

export const SETTINGS_REVALIDATE_PATHS: RevalidatePathEntry[] = [
  { path: '/', type: 'layout' },
  '/about',
  '/contact',
];

export const BLOG_REVALIDATE_PATHS: RevalidatePathEntry[] = [
  '/',
  '/blog',
  '/sitemap.xml',
  { path: '/blog/[slug]', type: 'page' },
];

export const REVIEW_REVALIDATE_PATHS: RevalidatePathEntry[] = [
  { path: '/products/[slug]', type: 'page' },
];

export async function revalidateStorefront(
  paths: RevalidatePathEntry[],
): Promise<void> {
  try {
    await fetch('/api/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paths }),
    });
  } catch {
    /* Revalidation must not block the admin mutation result. */
  }
}
