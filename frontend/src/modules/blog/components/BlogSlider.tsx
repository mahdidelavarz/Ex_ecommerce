"use client";

import { useRef } from "react";
import BlogCard from "./BlogCard";
import { SectionHeading } from "@/components/ui";
import { MdiChevronLeft, MdiChevronRight } from "@/components/icons/Icons";
import { scrollCarouselByCards } from "@/lib/carousel-scroll";
import type { BlogPostListItem } from "../types/blog.types";

interface BlogSliderProps {
  posts: BlogPostListItem[];
  title?: string;
}

export default function BlogSlider({ posts, title = "از وبلاگ ما" }: BlogSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  if (!posts || posts.length === 0) return null;

  const scrollByCards = (dir: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    scrollCarouselByCards(el, "[data-blog-card]", dir);
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <SectionHeading
          title={title}
          eyebrow="مجله زیبایی"
          href="/blog"
          actions={
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
          }
        />

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
