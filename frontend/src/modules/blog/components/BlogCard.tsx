// src/modules/blog/components/BlogCard.tsx
import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/utils/formatDate";
import { readingTimeLabel } from "@/lib/reading-time";
import { MdiCalendar, MdiClockOutline, MdiImageOff } from "@/components/icons/Icons";
import type { BlogPostListItem } from "../types/blog.types";

interface BlogCardProps {
  post: BlogPostListItem;
  /** Provide content to show a reading-time estimate (detail/related only). */
  content?: string;
}

export default function BlogCard({ post, content }: BlogCardProps) {
  const href = `/blog/${post.slug}`;
  const dateValue = post.published_at ?? post.created_at;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-card bg-surface shadow-card transition-shadow duration-200 hover:shadow-card-hover">
      <Link
        href={href}
        className="relative block aspect-[16/9] overflow-hidden bg-surface-raised"
        aria-label={post.title}
      >
        {post.cover_image ? (
          <Image
            src={post.cover_image}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <MdiImageOff className="h-12 w-12 text-text-muted" />
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        {post.tags.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {post.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-primary-light px-2.5 py-0.5 text-[11px] font-medium text-primary"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <Link href={href}>
          <h3 className="mb-2 line-clamp-2 font-bold leading-relaxed text-text-primary transition-colors group-hover:text-primary">
            {post.title}
          </h3>
        </Link>

        {post.excerpt && (
          <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-text-secondary">
            {post.excerpt}
          </p>
        )}

        <div className="mt-auto flex items-center gap-3 pt-2 text-xs text-text-muted">
          <span className="flex items-center gap-1">
            <MdiCalendar className="h-3.5 w-3.5" />
            {formatDate(dateValue)}
          </span>
          {content && (
            <span className="flex items-center gap-1">
              <MdiClockOutline className="h-3.5 w-3.5" />
              {readingTimeLabel(content)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
