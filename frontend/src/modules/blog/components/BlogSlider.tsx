"use client";

import { useRef } from "react";
import Link from "next/link";
import BlogCard from "./BlogCard";
import { MdiChevronLeft, MdiChevronRight, MdiArrowRight } from "@/components/icons/Icons";
import type { BlogPostListItem } from "../types/blog.types";

interface BlogSliderProps {
  posts: BlogPostListItem[];
  title?: string;
}

export default function BlogSlider({ posts, title = "از وبلاگ ما" }: BlogSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  if (!posts || posts.length === 0) return null;

  // RTL-aware scrolling: scrollBy with negative/positive deltas works the same
  // in an RTL container (browser flips the sign), so "next" moves to newer cards.
  const scrollByCards = (dir: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-blog-card]");
    const amount = card ? card.offsetWidth + 24 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">{title}</h2>
            <div className="mt-2 h-1 w-16 rounded-full bg-gradient-to-l from-secondary to-primary" />
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/blog"
              className="flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary-hover"
            >
              مشاهده همه
              <MdiArrowRight className="h-4 w-4" />
            </Link>
            <div className="hidden items-center gap-2 sm:flex">
              <button
                type="button"
                onClick={() => scrollByCards(1)}
                aria-label="بعدی"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-text-primary shadow-card transition-colors hover:bg-surface-raised"
              >
                <MdiChevronRight className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => scrollByCards(-1)}
                aria-label="قبلی"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-text-primary shadow-card transition-colors hover:bg-surface-raised"
              >
                <MdiChevronLeft className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div
          ref={trackRef}
          className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {posts.map((post) => (
            <div
              key={post.id}
              data-blog-card
              className="w-[80%] shrink-0 snap-start sm:w-[45%] lg:w-[31%]"
            >
              <BlogCard post={post} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
