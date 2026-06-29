// src/app/brands/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { fetchBrands } from '@/lib/server-fetch';
import { absoluteUrl, breadcrumbJsonLd } from '@/lib/seo';
import { MdiChevronLeft } from '@/components/icons/Icons';
import BrandsPagination from './BrandsPagination';

type SearchParams = Record<string, string | string[] | undefined>;

export const metadata: Metadata = {
  title: 'همه برندها',
  description: 'فهرست برندهای آرایشی و بهداشتی موجود در نازی شاپ.',
  alternates: { canonical: '/brands' },
};

export default async function BrandsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const page = Number(Array.isArray(sp.page) ? sp.page[0] : sp.page) || 1;

  const { data: brands, meta } = await fetchBrands({
    page,
    limit: 24,
    is_active: true,
  });

  const breadcrumb = breadcrumbJsonLd([
    { name: 'خانه', path: '/' },
    { name: 'برندها', path: '/brands' },
  ]);
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    url: absoluteUrl('/brands'),
    itemListElement: brands.map((brand, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: absoluteUrl(`/brands/${brand.slug}`),
      name: brand.name,
    })),
  };

  return (
    <main className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumb, itemList]) }}
      />
      <div className="container mx-auto px-4 py-8" dir="rtl">
        <nav className="flex items-center gap-2 text-sm text-text-muted mb-6">
          <Link href="/" className="hover:text-primary">خانه</Link>
          <MdiChevronLeft className="w-4 h-4 rotate-180" />
          <span className="text-text-primary">برندها</span>
        </nav>

        <h1 className="text-2xl font-bold text-text-primary mb-8">همه برندها</h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/brands/${brand.slug}`}
              className="bg-surface border border-border rounded-card p-4 flex flex-col items-center gap-3 hover:border-primary hover:shadow-card transition-all"
            >
              {brand.logo ? (
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  width={64}
                  height={64}
                  className="w-16 h-16 object-contain"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-primary-light flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">
                    {brand.name.charAt(0)}
                  </span>
                </div>
              )}
              <span className="text-sm font-medium text-text-primary text-center line-clamp-2">
                {brand.name}
              </span>
              <span className="text-xs text-text-muted">{brand.products_count} محصول</span>
            </Link>
          ))}
        </div>

        <BrandsPagination currentPage={page} totalPages={meta?.totalPages ?? 1} />
      </div>
    </main>
  );
}
