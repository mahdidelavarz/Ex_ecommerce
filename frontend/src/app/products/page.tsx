// src/app/products/page.tsx
import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import ProductsClient from './ProductsClient';
import { fetchProducts } from '@/lib/server-fetch';
import { breadcrumbJsonLd, itemListJsonLd } from '@/lib/seo';
import { MdiChevronLeft, SvgSpinnersRingResize } from '@/components/icons/Icons';

type SearchParams = Record<string, string | string[] | undefined>;

function str(v: string | string[] | undefined): string {
  return Array.isArray(v) ? v[0] ?? '' : v ?? '';
}

/** Map URL search params to the product list API params (matches ProductsClient). */
function toApiParams(sp: SearchParams) {
  const sortBy = str(sp.sort_by) || 'created_at';
  const sortOrder = (str(sp.sort_order) as 'ASC' | 'DESC') || 'DESC';
  return {
    page: Number(str(sp.page)) || 1,
    limit: 20,
    search: str(sp.search) || undefined,
    category_id: str(sp.category) || undefined,
    brand_id: str(sp.brand) || undefined,
    min_price: str(sp.min_price) || undefined,
    max_price: str(sp.max_price) || undefined,
    tag: str(sp.tag) || undefined,
    has_stock: str(sp.has_stock) === 'true' ? true : undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
  };
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const search = str(sp.search);
  const title = search
    ? `نتایج جستجو برای «${search}»`
    : 'فروشگاه آرایشی و زیبایی';
  return {
    title,
    description:
      'جدیدترین محصولات آرایشی و بهداشتی اصل را با بهترین قیمت در نازی شاپ کشف کنید.',
    // Canonicalize filtered/paginated variants to the base listing to avoid
    // duplicate-content from filter combinations (categories have their own pages).
    alternates: { canonical: '/products' },
  };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const initialData = await fetchProducts(toApiParams(sp));

  const breadcrumb = breadcrumbJsonLd([
    { name: 'خانه', path: '/' },
    { name: 'محصولات', path: '/products' },
  ]);
  const itemList = itemListJsonLd(initialData.data, '/products');

  return (
    <main className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumb, itemList]) }}
      />
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-text-muted mb-4">
          <Link href="/" className="hover:text-primary transition-colors">خانه</Link>
          <MdiChevronLeft className="w-4 h-4" />
          <span className="text-text-primary">محصولات</span>
        </nav>

        {/* Header band */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary">فروشگاه آرایشی و زیبایی</h1>
          <div className="mt-2 h-1 w-16 rounded-full bg-gradient-to-l from-secondary to-primary" />
          <p className="mt-3 text-sm text-text-secondary">جدیدترین محصولات اصل را با بهترین قیمت کشف کنید</p>
        </header>

        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <SvgSpinnersRingResize className="text-primary" width={48} />
            </div>
          }
        >
          <ProductsClient initialData={initialData} />
        </Suspense>
      </div>
    </main>
  );
}
