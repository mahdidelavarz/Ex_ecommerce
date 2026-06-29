// src/components/content/ContentPage.tsx
import Link from "next/link";
import { MdiChevronLeft } from "@/components/icons/Icons";

interface ContentPageProps {
  title: string;
  subtitle?: string;
  /** Last-segment breadcrumb label; defaults to the title. */
  breadcrumbLabel?: string;
  /** When true, render children directly without the prose article wrapper
   *  (for pages with custom layouts such as the contact page). */
  bare?: boolean;
  children: React.ReactNode;
}

/**
 * Shared storefront wrapper for informational/legal pages (about, terms,
 * privacy, shipping, returns policy, contact, faq). Server-component friendly:
 * no client hooks. Children are rendered inside a token-styled prose container,
 * so pages can simply pass plain <h2>/<p>/<ul> markup.
 */
export default function ContentPage({
  title,
  subtitle,
  breadcrumbLabel,
  bare = false,
  children,
}: ContentPageProps) {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <nav
        aria-label="مسیر صفحه"
        className="flex items-center gap-1 text-sm text-text-muted mb-6"
      >
        <Link href="/" className="hover:text-primary transition-colors">
          صفحه اصلی
        </Link>
        <MdiChevronLeft className="w-4 h-4 shrink-0" />
        <span className="text-text-secondary">{breadcrumbLabel ?? title}</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-text-secondary leading-relaxed">{subtitle}</p>
        )}
      </header>

      {bare ? (
        children
      ) : (
        <article
          className="
          max-w-3xl bg-surface border border-border rounded-card shadow-card
          p-6 md:p-8 leading-relaxed text-text-secondary
          [&_h2]:text-lg [&_h2]:md:text-xl [&_h2]:font-bold [&_h2]:text-text-primary
          [&_h2]:mt-8 [&_h2]:mb-3 [&_h2:first-child]:mt-0
          [&_h3]:font-bold [&_h3]:text-text-primary [&_h3]:mt-5 [&_h3]:mb-2
          [&_p]:mb-4
          [&_ul]:list-disc [&_ul]:pr-5 [&_ul]:mb-4 [&_ul]:space-y-2
          [&_ol]:list-decimal [&_ol]:pr-5 [&_ol]:mb-4 [&_ol]:space-y-2
          [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4
          [&_strong]:text-text-primary [&_strong]:font-bold
        "
        >
          {children}
        </article>
      )}
    </div>
  );
}
