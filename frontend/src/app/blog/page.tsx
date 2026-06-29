// src/app/blog/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import BlogClient from "./BlogClient";
import { fetchBlogPosts } from "@/lib/server-fetch";
import { breadcrumbJsonLd, blogItemListJsonLd } from "@/lib/seo";
import { MdiChevronLeft, SvgSpinnersRingResize } from "@/components/icons/Icons";

type SearchParams = Record<string, string | string[] | undefined>;

function str(v: string | string[] | undefined): string {
  return Array.isArray(v) ? v[0] ?? "" : v ?? "";
}

function toApiParams(sp: SearchParams) {
  return {
    page: Number(str(sp.page)) || 1,
    limit: 12,
    search: str(sp.search) || undefined,
    tag: str(sp.tag) || undefined,
    sort_by: "published_at",
    sort_order: "DESC" as const,
  };
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const search = str(sp.search);
  const tag = str(sp.tag);
  const title = search
    ? `نتایج جستجو برای «${search}» در وبلاگ`
    : tag
      ? `مطالب با برچسب «${tag}»`
      : "وبلاگ";
  return {
    title,
    description:
      "جدیدترین مقالات، راهنماها و نکات آرایشی و بهداشتی را در وبلاگ نازی شاپ بخوانید.",
    alternates: { canonical: "/blog" },
    openGraph: {
      type: "website",
      title,
      description:
        "جدیدترین مقالات، راهنماها و نکات آرایشی و بهداشتی را در وبلاگ نازی شاپ بخوانید.",
    },
  };
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const initialData = await fetchBlogPosts(toApiParams(sp));

  const breadcrumb = breadcrumbJsonLd([
    { name: "خانه", path: "/" },
    { name: "وبلاگ", path: "/blog" },
  ]);
  const itemList = blogItemListJsonLd(initialData.data, "/blog");

  return (
    <main className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumb, itemList]),
        }}
      />
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-2 text-sm text-text-muted">
          <a href="/" className="transition-colors hover:text-primary">
            خانه
          </a>
          <MdiChevronLeft className="h-4 w-4" />
          <span className="text-text-primary">وبلاگ</span>
        </nav>

        {/* Header band */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary">وبلاگ نازی شاپ</h1>
          <div className="mt-2 h-1 w-16 rounded-full bg-gradient-to-l from-secondary to-primary" />
          <p className="mt-3 text-sm text-text-secondary">
            جدیدترین مقالات، راهنماها و نکات آرایشی و بهداشتی
          </p>
        </header>

        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <SvgSpinnersRingResize className="text-primary" width={48} />
            </div>
          }
        >
          <BlogClient initialData={initialData} />
        </Suspense>
      </div>
    </main>
  );
}
