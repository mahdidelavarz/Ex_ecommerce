# SEO Map — Road to Production

> Priority labels: 🔴 Critical | 🟠 High | 🟡 Medium | 🔵 Low
> All page paths are relative to `frontend/src/app/`.

---

## 1. Missing Pages (404s on Linked URLs)

These routes are linked from navigation but don't exist — crawlers and users hit 404.

| # | Missing Route | Linked From | Priority |
|---|--------------|-------------|----------|
| SEO-P1 | `/categories/[slug]` | Mega menu, mobile menu, breadcrumb | 🔴 Critical |
| SEO-P2 | `/brands/[slug]` | Product detail page (brand name link) | 🟠 High |
| SEO-P3 | `/brands` | No entry point exists | 🟡 Medium |

**Fix:** Create these pages as documented in [categories.md](modules/categories.md) (CAT-F1) and [brands.md](modules/brands.md) (BRD-F1).

---

## 2. Page Metadata (`generateMetadata`)

Next.js App Router requires `generateMetadata` per page for dynamic titles, descriptions, and OG tags. Currently missing on almost every page.

### 2a. Static Pages

| Page | title | description | og:image | Status |
|------|-------|-------------|---------|--------|
| `/` (home) | — | — | — | ❌ Missing |
| `/products` | — | — | — | ❌ Missing |
| `/cart` | — | — | — | ❌ Missing |
| `/checkout` | — | — | — | ❌ Missing |
| `/wishlist` | — | — | — | ❌ Missing |

**Fix for static pages** — add to each `layout.tsx` or `page.tsx`:
```tsx
// app/products/layout.tsx
export const metadata: Metadata = {
  title: 'محصولات | نام فروشگاه',
  description: 'خرید انواع محصولات با بهترین قیمت',
  openGraph: {
    title: 'محصولات | نام فروشگاه',
    description: 'خرید انواع محصولات با بهترین قیمت',
    locale: 'fa_IR',
    type: 'website',
  },
};
```

### 2b. Dynamic Pages

| Page | Issue | Priority |
|------|-------|----------|
| `products/[slug]` | No `generateMetadata` — tab title is the app default; no OG image | 🔴 Critical |
| `categories/[slug]` | Page doesn't exist yet | 🔴 Critical |
| `brands/[slug]` | Page doesn't exist yet | 🟠 High |

**Fix for product detail** (also documented as PRD-F8):
```tsx
// app/products/[slug]/page.tsx
export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const { data: product } = await productService.getBySlug(params.slug);
  const thumbnail = product.images.find(i => i.is_thumbnail)?.image_url ?? '';

  return {
    title: product.seo?.title ?? `${product.title} | نام فروشگاه`,
    description: product.seo?.description ?? product.short_description,
    openGraph: {
      title:       product.seo?.title ?? product.title,
      description: product.seo?.description ?? product.short_description,
      images:      thumbnail ? [{ url: thumbnail, alt: product.title }] : [],
      type:        'website',
      locale:      'fa_IR',
    },
    twitter: {
      card:        'summary_large_image',
      title:       product.seo?.title ?? product.title,
      description: product.seo?.description ?? product.short_description,
      images:      thumbnail ? [thumbnail] : [],
    },
  };
}
```

---

## 3. Structured Data (JSON-LD)

Google uses structured data for rich results (star ratings, price, availability in search results). Nothing is implemented yet.

| Schema | Page | Priority | Impact |
|--------|------|----------|--------|
| `Product` | `products/[slug]` | 🔴 Critical | Price, availability, rating in search results |
| `BreadcrumbList` | `products/[slug]`, `categories/[slug]` | 🟠 High | Breadcrumb path in search snippet |
| `Organization` | `app/layout.tsx` | 🟠 High | Brand identity, knowledge panel |
| `WebSite` + `SearchAction` | `app/layout.tsx` | 🟡 Medium | Sitelinks searchbox in Google |
| `ItemList` | `products/page.tsx`, `categories/[slug]` | 🟡 Medium | Product list in search results |

### Product Schema
```tsx
// app/products/[slug]/page.tsx — add inside <head> or as component:
const productJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name:        product.title,
  description: product.short_description,
  image:       product.images.map(i => i.image_url),
  sku:         product.sku,
  brand: {
    '@type': 'Brand',
    name: product.brand?.name,
  },
  offers: {
    '@type':           'Offer',
    priceCurrency:     'IRR',
    price:             product.min_price,
    availability:      product.in_stock
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock',
    url:               `https://yoursite.com/products/${product.slug}`,
  },
  aggregateRating: product.reviews_count > 0 ? {
    '@type':       'AggregateRating',
    ratingValue:   product.average_rating,
    reviewCount:   product.reviews_count,
  } : undefined,
};

<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
/>
```

### Organization Schema (add once in root layout)
```tsx
// app/layout.tsx
const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name:    'نام فروشگاه',
  url:     'https://yoursite.com',
  logo:    'https://yoursite.com/logo.png',
  sameAs:  ['https://instagram.com/yourstore'],
};
```

### BreadcrumbList Schema
```tsx
// Reusable component — use on product detail and category pages:
const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'خانه', item: 'https://yoursite.com' },
    { '@type': 'ListItem', position: 2, name: category.name, item: `https://yoursite.com/categories/${category.slug}` },
    { '@type': 'ListItem', position: 3, name: product.title },
  ],
};
```

---

## 4. Sitemap

No `sitemap.xml` or `robots.txt` exists. Crawlers must discover all pages manually.

| # | File | Priority |
|---|------|----------|
| SEO-S1 | `app/sitemap.ts` — dynamic sitemap for products, categories, brands | 🔴 Critical |
| SEO-S2 | `app/robots.ts` — robots.txt with sitemap link | 🟠 High |

### Dynamic Sitemap
```ts
// app/sitemap.ts
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yoursite.com';

  const [products, categories, brands] = await Promise.all([
    productService.getAllSlugs(),    // GET /products?fields=slug,updated_at&limit=10000
    categoryService.getAllSlugs(),
    brandService.getAllSlugs(),
  ]);

  return [
    { url: BASE, lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE}/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    ...products.map(p => ({
      url:             `${BASE}/products/${p.slug}`,
      lastModified:    p.updated_at,
      changeFrequency: 'weekly' as const,
      priority:        0.8,
    })),
    ...categories.map(c => ({
      url:             `${BASE}/categories/${c.slug}`,
      lastModified:    c.updated_at,
      changeFrequency: 'weekly' as const,
      priority:        0.7,
    })),
    ...brands.map(b => ({
      url:             `${BASE}/brands/${b.slug}`,
      lastModified:    b.updated_at,
      changeFrequency: 'monthly' as const,
      priority:        0.6,
    })),
  ];
}
```

### Robots.txt
```ts
// app/robots.ts
export default function robots(): MetadataRoute.Robots {
  const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yoursite.com';
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin/', '/checkout/', '/api/'] },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
```

---

## 5. Image Optimization

Plain `<img>` tags block LCP (Largest Contentful Paint) — Next.js's `<Image>` gives lazy loading, modern formats (WebP/AVIF), and automatic sizing. Tracked as PRD-F9.

| Location | Issue | Priority |
|----------|-------|----------|
| `ProductCard.tsx` | `<img>` — no lazy load, no WebP, no size hints | 🟠 High |
| `products/[slug]/page.tsx` | `<img>` for main product image — directly affects LCP score | 🔴 Critical |
| `brands/[slug]/page.tsx` (to be created) | Should use `<Image>` from the start | 🟠 High |
| `categories/[slug]/page.tsx` (to be created) | Should use `<Image>` from the start | 🟠 High |

**Fix:**
```tsx
// next.config.ts — allow upload host:
images: {
  remotePatterns: [
    { hostname: process.env.UPLOAD_HOST ?? 'localhost' },
  ],
},

// ProductCard.tsx:
import Image from 'next/image';

<div className="relative aspect-square overflow-hidden">
  <Image
    src={imageUrl}
    alt={product.title}
    fill
    className="object-cover"
    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
    priority={false}
  />
</div>
```
Add `priority={true}` only on the first visible product image (hero/LCP element).

---

## 6. URL Structure & Canonical Tags

### Filter Parameters in URL (tracked as PRD-F6)
Product filters (category, brand, price, sort) currently live only in React state — reset on refresh and cannot be shared or indexed.

```tsx
// products/page.tsx — sync filters to searchParams:
// e.g. /products?category=electronics&brand=samsung&min=100000&sort=price_asc
```

This also enables **canonical URLs** for filter combinations:
```tsx
// products/page.tsx
export async function generateMetadata({ searchParams }) {
  return {
    alternates: {
      canonical: '/products', // always point to unfiltered URL to avoid duplicate content
    },
  };
}
```

### Pagination Canonical
```tsx
// products/page.tsx
alternates: {
  canonical: page > 1 ? `/products?page=${page}` : '/products',
}
```

---

## 7. HTML Language & RTL

The app is Persian/RTL but the `<html>` tag may not declare this.

```tsx
// app/layout.tsx
<html lang="fa" dir="rtl">
```

Also add to `<head>`:
```tsx
// app/layout.tsx — inside Metadata:
export const metadata: Metadata = {
  // ...
  other: {
    'content-language': 'fa',
  },
};
```

---

## 8. Alt Text on Images

All images should have meaningful alt text for accessibility and image search indexing.

| Location | Current | Fix |
|----------|---------|-----|
| `ProductCard.tsx` | `alt=""` or missing | `alt={product.title}` |
| `products/[slug]/page.tsx` | `alt=""` or image index | `alt={product.title}` + variant color for swatch images |
| Brand logos | `alt=""` | `alt={`لوگوی ${brand.name}`}` |
| Category images | None | `alt={category.name}` |

---

## 9. Heading Hierarchy

Each page should have exactly one `<h1>` (the main topic), with `<h2>`/`<h3>` for sub-sections.

| Page | Current | Expected |
|------|---------|---------|
| Product detail | Likely `<h1>` for title — verify | `<h1>` product name, `<h2>` description, `<h2>` reviews |
| Products listing | May have no `<h1>` | `<h1>` "محصولات" or category name |
| Home page | Unknown | `<h1>` brand tagline |
| Category page (new) | N/A | `<h1>` category name |

---

## 10. Internal Linking

Good internal linking helps crawlers discover pages and distributes link equity.

| # | Missing Link | Priority |
|---|-------------|----------|
| SEO-L1 | Related products on product detail (backend endpoint broken — PRD-B1) | 🟠 High |
| SEO-L2 | Tag chips on product detail page link to `/products?tag=slug` (rendered but invisible — TAG-F1) | 🟠 High |
| SEO-L3 | Breadcrumb on product detail already exists — add structured data for it | 🟠 High |
| SEO-L4 | Brand name on product detail should link to `/brands/[slug]` (page missing) | 🟡 Medium |
| SEO-L5 | Category name in breadcrumb should link to `/categories/[slug]` (page missing) | 🔴 Critical |

---

## 11. Core Web Vitals Checklist

| Metric | Target | Current Risk |
|--------|--------|-------------|
| LCP (Largest Contentful Paint) | < 2.5s | 🔴 Plain `<img>` on product detail, no priority hints |
| CLS (Cumulative Layout Shift) | < 0.1 | 🟡 Images without explicit dimensions shift layout |
| FID / INP (Interaction to Next Paint) | < 200ms | 🟡 No specific issues found |
| TTFB (Time to First Byte) | < 800ms | 🟡 Product detail is client-rendered — consider RSC or SSR |

**Quick wins:**
- Replace `<img>` with `next/image` everywhere (fixes LCP + CLS)
- Add `priority` to the first product image on detail page
- Product detail page should be a React Server Component or use `generateStaticParams` for popular products

---

## 12. `generateStaticParams` for Popular Pages

Pre-render top products/categories at build time for instant TTFB.

```tsx
// app/products/[slug]/page.tsx
export async function generateStaticParams() {
  const { data } = await productService.getAll({ limit: 200, sort: 'sales_desc' });
  return data.items.map(p => ({ slug: p.slug }));
}

export const revalidate = 3600; // ISR: re-generate every hour
```
Apply same pattern to `categories/[slug]` and `brands/[slug]`.

---

## Priority Summary

| # | Task | Priority | Depends On |
|---|------|----------|------------|
| SEO-P1 | Create `/categories/[slug]` page | 🔴 Critical | CAT-F1 |
| SEO-M1 | `generateMetadata` on `products/[slug]` | 🔴 Critical | — |
| SEO-M2 | `Product` JSON-LD on product detail | 🔴 Critical | — |
| SEO-S1 | `app/sitemap.ts` dynamic sitemap | 🔴 Critical | SEO-P1 |
| SEO-IMG | Replace `<img>` with `next/image` on product detail + cards | 🔴 Critical | PRD-F9 |
| SEO-L5 | Fix breadcrumb category link (page missing → 404) | 🔴 Critical | CAT-F1 |
| SEO-P2 | Create `/brands/[slug]` page | 🟠 High | BRD-F1 |
| SEO-S2 | `app/robots.ts` | 🟠 High | — |
| SEO-M3 | `generateMetadata` on category + brand pages | 🟠 High | SEO-P1, SEO-P2 |
| SEO-SD2 | `BreadcrumbList` JSON-LD | 🟠 High | — |
| SEO-SD3 | `Organization` JSON-LD in root layout | 🟠 High | — |
| SEO-L2 | Render tag chips with links on product detail | 🟠 High | TAG-F1 |
| SEO-L1 | Fix related products endpoint + render on page | 🟠 High | PRD-B1 |
| SEO-URL | Persist product filters to URL searchParams | 🟡 Medium | PRD-F6 |
| SEO-LANG | Set `lang="fa" dir="rtl"` on `<html>` | 🟡 Medium | — |
| SEO-ALT | Add meaningful alt text to all images | 🟡 Medium | — |
| SEO-SSG | `generateStaticParams` + ISR on product/category/brand pages | 🟡 Medium | SEO-P1, SEO-P2 |
| SEO-SD4 | `WebSite` + `SearchAction` JSON-LD | 🟡 Medium | — |
| SEO-H1 | Audit heading hierarchy on all pages | 🔵 Low | — |
| SEO-SD5 | `ItemList` JSON-LD on product listing + category pages | 🔵 Low | — |
