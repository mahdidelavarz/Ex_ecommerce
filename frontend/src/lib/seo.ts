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

/** Renders one or more JSON-LD objects as a string for a <script> tag. */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data);
}
