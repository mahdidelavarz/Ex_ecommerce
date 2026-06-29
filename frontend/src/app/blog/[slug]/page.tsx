// src/app/blog/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import DOMPurify from "isomorphic-dompurify";
import { fetchBlogPost } from "@/lib/server-fetch";
import {
  breadcrumbJsonLd,
  blogPostingJsonLd,
  absoluteUrl,
} from "@/lib/seo";
import { formatDate } from "@/utils/formatDate";
import { readingTimeLabel } from "@/lib/reading-time";
import BlogCard from "@/modules/blog/components/BlogCard";
import {
  MdiCalendar,
  MdiChevronLeft,
  MdiClockOutline,
  MdiEyeOutline,
  MdiImageOff,
} from "@/components/icons/Icons";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchBlogPost(slug);
  if (!post) return { title: "مطلب" };

  const title = post.seo.title ?? post.title;
  const description = post.seo.description ?? post.excerpt ?? undefined;
  return {
    title,
    description,
    keywords: post.seo.keywords ?? undefined,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: absoluteUrl(`/blog/${post.slug}`),
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at ?? undefined,
      images: post.cover_image
        ? [{ url: post.cover_image, alt: post.title }]
        : [],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await fetchBlogPost(slug);
  if (!post) notFound();

  const dateValue = post.published_at ?? post.created_at;
  const safeContent = DOMPurify.sanitize(post.content);

  const jsonLd = [
    blogPostingJsonLd(post),
    breadcrumbJsonLd([
      { name: "خانه", path: "/" },
      { name: "وبلاگ", path: "/blog" },
      { name: post.title, path: `/blog/${post.slug}` },
    ]),
  ];

  return (
    <main className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-sm text-text-muted">
            <Link href="/" className="transition-colors hover:text-primary">
              خانه
            </Link>
            <MdiChevronLeft className="h-4 w-4" />
            <Link href="/blog" className="transition-colors hover:text-primary">
              وبلاگ
            </Link>
            <MdiChevronLeft className="h-4 w-4" />
            <span className="line-clamp-1 text-text-primary">{post.title}</span>
          </nav>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="rounded-full bg-primary-light px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-white"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="mb-4 text-3xl font-bold leading-tight text-text-primary md:text-4xl">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-text-muted">
            {post.author?.full_name && (
              <span className="font-medium text-text-secondary">
                {post.author.full_name}
              </span>
            )}
            <span className="flex items-center gap-1">
              <MdiCalendar className="h-4 w-4" />
              {formatDate(dateValue)}
            </span>
            <span className="flex items-center gap-1">
              <MdiClockOutline className="h-4 w-4" />
              {readingTimeLabel(post.content)}
            </span>
            <span className="flex items-center gap-1">
              <MdiEyeOutline className="h-4 w-4" />
              {post.view_count.toLocaleString("fa-IR")} بازدید
            </span>
          </div>

          {/* Cover */}
          <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-card bg-surface-raised">
            {post.cover_image ? (
              <Image
                src={post.cover_image}
                alt={post.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <MdiImageOff className="h-16 w-16 text-text-muted" />
              </div>
            )}
          </div>

          {/* Content */}
          <div
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: safeContent }}
          />
        </div>

        {/* Related */}
        {post.related.length > 0 && (
          <section className="mx-auto mt-16 max-w-5xl">
            <h2 className="mb-6 text-xl font-bold text-text-primary">
              مطالب مرتبط
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {post.related.map((related) => (
                <BlogCard key={related.id} post={related} />
              ))}
            </div>
          </section>
        )}
      </article>
    </main>
  );
}
