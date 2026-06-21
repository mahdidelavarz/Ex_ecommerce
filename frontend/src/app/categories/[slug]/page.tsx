// src/app/categories/[slug]/page.tsx
import type { Metadata } from 'next';
import type { CategoryDetail } from '@/modules/categories/types/category.types';
import CategoryPageClient from './CategoryPageClient';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yoursite.com';

async function fetchCategory(slug: string): Promise<CategoryDetail | null> {
  try {
    const res = await fetch(`${API_BASE}/categories/${slug}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as CategoryDetail;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const category = await fetchCategory(params.slug);
  if (!category) return { title: 'دسته‌بندی' };

  const title = category.seo?.title ?? category.name;
  const description = category.seo?.description ?? category.description ?? undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: category.image ? [{ url: category.image, alt: category.name }] : [],
      url: `${SITE_URL}/categories/${category.slug}`,
    },
  };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await fetchCategory(params.slug);
  const breadcrumbJsonLd = category ? buildBreadcrumbJsonLd(category) : null;

  return (
    <>
      {breadcrumbJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      )}
      <CategoryPageClient />
    </>
  );
}

function buildBreadcrumbJsonLd(category: CategoryDetail) {
  const items: Array<{ '@type': string; position: number; name: string; item: string }> = [
    { '@type': 'ListItem', position: 1, name: 'خانه', item: SITE_URL },
  ];

  if (category.parent) {
    items.push({
      '@type': 'ListItem',
      position: 2,
      name: category.parent.name,
      item: `${SITE_URL}/categories/${category.parent.slug}`,
    });
  }

  items.push({
    '@type': 'ListItem',
    position: items.length + 1,
    name: category.name,
    item: `${SITE_URL}/categories/${category.slug}`,
  });

  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items };
}
