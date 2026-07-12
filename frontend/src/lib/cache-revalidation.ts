export type RevalidatePathEntry =
  | string
  | { path: string; type?: 'page' | 'layout' };

export type RevalidateTagEntry = string;

export const PRODUCT_REVALIDATE_TAGS: RevalidateTagEntry[] = ['products'];
export const CATEGORY_REVALIDATE_TAGS: RevalidateTagEntry[] = [
  'categories',
  'products',
];
export const BRAND_REVALIDATE_TAGS: RevalidateTagEntry[] = [
  'brands',
  'products',
];
export const SETTINGS_REVALIDATE_TAGS: RevalidateTagEntry[] = ['settings'];
export const BLOG_REVALIDATE_TAGS: RevalidateTagEntry[] = ['blog-posts'];
export const REVIEW_REVALIDATE_TAGS: RevalidateTagEntry[] = ['products'];

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
  tags: RevalidateTagEntry[] = [],
): Promise<void> {
  try {
    await fetch('/api/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paths, tags }),
    });
  } catch {
    /* Revalidation must not block the admin mutation result. */
  }
}
