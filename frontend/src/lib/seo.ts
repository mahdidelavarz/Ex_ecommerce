// src/lib/seo.ts
// Single source of truth for SEO constants and JSON-LD structured-data builders.
import type { ProductListResponse } from "@/modules/products/types/product.types";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://thenazishop.ir";
export const SITE_NAME = "نازی شاپ";
export const DEFAULT_OG_IMAGE = "/og-image.png";

/** Build an absolute URL from a site-relative path. */
export function absoluteUrl(path = "/"): string {
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/logo.png"),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/products?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export interface BreadcrumbEntry {
  name: string;
  /** Site-relative path (e.g. "/products") or absolute URL. */
  path: string;
}

export function breadcrumbJsonLd(entries: BreadcrumbEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: entries.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      item: absoluteUrl(entry.path),
    })),
  };
}

/** ItemList of products for listing pages (home/products/category/brand). */
export function itemListJsonLd(
  products: ProductListResponse[],
  basePath = "/products",
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/products/${product.slug}`),
      name: product.title,
    })),
    ...(basePath ? { url: absoluteUrl(basePath) } : {}),
  };
}

/** ItemList of blog posts for the blog listing page. */
export function blogItemListJsonLd(
  posts: Array<{ slug: string; title: string }>,
  basePath = "/blog",
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: posts.map((post, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/blog/${post.slug}`),
      name: post.title,
    })),
    ...(basePath ? { url: absoluteUrl(basePath) } : {}),
  };
}

export interface BlogPostingJsonLdInput {
  slug: string;
  title: string;
  excerpt?: string | null;
  cover_image?: string | null;
  published_at?: string | null;
  updated_at?: string | null;
  author?: { full_name: string | null } | null;
  seo?: { description?: string | null } | null;
}

/** BlogPosting (Article) structured data for a blog detail page. */
export function blogPostingJsonLd(post: BlogPostingJsonLdInput) {
  const url = absoluteUrl(`/blog/${post.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seo?.description ?? post.excerpt ?? undefined,
    image: post.cover_image ? [post.cover_image] : undefined,
    datePublished: post.published_at ?? undefined,
    dateModified: post.updated_at ?? post.published_at ?? undefined,
    author: post.author?.full_name
      ? { "@type": "Person", name: post.author.full_name }
      : { "@type": "Organization", name: SITE_NAME },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: absoluteUrl("/logo.png") },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
  };
}

/** Renders one or more JSON-LD objects as a string for a <script> tag. */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data);
}
