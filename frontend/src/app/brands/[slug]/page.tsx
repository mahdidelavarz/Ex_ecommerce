// src/app/brands/[slug]/page.tsx
import type { Metadata } from 'next';
import type { Brand } from '@/modules/brands/types/brand.types';
import BrandPageClient from './BrandPageClient';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yoursite.com';

async function fetchBrand(slug: string): Promise<Brand | null> {
  try {
    const res = await fetch(`${API_BASE}/brands/${slug}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as Brand;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const brand = await fetchBrand(params.slug);
  if (!brand) return { title: 'برند' };

  const title = brand.name;
  const description = brand.description ?? undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: brand.logo ? [{ url: brand.logo, alt: `لوگوی ${brand.name}` }] : [],
      url: `${SITE_URL}/brands/${brand.slug}`,
    },
  };
}

export default async function BrandPage({ params }: { params: { slug: string } }) {
  const brand = await fetchBrand(params.slug);
  const breadcrumbJsonLd = brand ? buildBreadcrumbJsonLd(brand) : null;

  return (
    <>
      {breadcrumbJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      )}
      <BrandPageClient />
    </>
  );
}

function buildBreadcrumbJsonLd(brand: Brand) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'خانه', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'برندها', item: `${SITE_URL}/brands` },
      { '@type': 'ListItem', position: 3, name: brand.name, item: `${SITE_URL}/brands/${brand.slug}` },
    ],
  };
}
