// src/app/products/[slug]/page.tsx
import type { Metadata } from 'next';
import type { ProductDetail } from '@/modules/products/types/product.types';
import ProductPageClient from './ProductPageClient';

const API_BASE =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:5000/api/v1';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yoursite.com';
const FETCH_TIMEOUT_MS = 1500;

function canFetchFromServer(url: string): boolean {
  return /^https?:\/\//.test(url);
}

async function fetchProduct(slug: string): Promise<ProductDetail | null> {
  if (!canFetchFromServer(API_BASE)) return null;

  try {
    const res = await fetch(`${API_BASE}/products/${slug}`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as ProductDetail;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await fetchProduct(params.slug);
  if (!product) return { title: 'محصول' };

  const thumbnail =
    product.images.find((i) => i.is_thumbnail)?.image_url ??
    product.images[0]?.image_url ??
    '';
  return {
    title: product.seo?.title ?? product.title,
    description: product.seo?.description ?? product.short_description ?? undefined,
    openGraph: {
      title: product.seo?.title ?? product.title,
      description: product.seo?.description ?? product.short_description ?? undefined,
      images: thumbnail ? [{ url: thumbnail, alt: product.title }] : [],
    },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await fetchProduct(params.slug);

  const productJsonLd = product ? buildProductJsonLd(product) : null;
  const breadcrumbJsonLd = product ? buildBreadcrumbJsonLd(product) : null;

  return (
    <>
      {productJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
      )}
      {breadcrumbJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      )}
      <ProductPageClient />
    </>
  );
}

function buildBreadcrumbJsonLd(product: ProductDetail) {
  const items: Array<{ '@type': string; position: number; name: string; item: string }> = [
    { '@type': 'ListItem', position: 1, name: 'خانه', item: SITE_URL },
  ];

  if (product.category) {
    items.push({
      '@type': 'ListItem',
      position: 2,
      name: product.category.name,
      item: `${SITE_URL}/categories/${product.category.slug}`,
    });
  }

  items.push({
    '@type': 'ListItem',
    position: items.length + 1,
    name: product.title,
    item: `${SITE_URL}/products/${product.slug}`,
  });

  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items };
}

function buildProductJsonLd(product: ProductDetail) {
  const activeVariants = product.variants.filter((v) => v.is_active);
  const minPrice =
    activeVariants.length > 0
      ? Math.min(...activeVariants.map((v) => v.price))
      : 0;
  const inStock = activeVariants.some((v) => v.stock_quantity > 0);
  const firstSku = activeVariants[0]?.sku;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.short_description ?? undefined,
    image: product.images.map((i) => i.image_url),
    ...(firstSku && { sku: firstSku }),
    url: `${SITE_URL}/products/${product.slug}`,
    ...(product.brand && {
      brand: { '@type': 'Brand', name: product.brand.name },
    }),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'IRR',
      price: minPrice,
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `${SITE_URL}/products/${product.slug}`,
    },
    ...(product.reviews_count > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.avg_rating,
        reviewCount: product.reviews_count,
      },
    }),
  };
}
