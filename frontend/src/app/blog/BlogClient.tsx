"use client";

import { useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useBlogPosts } from "@/modules/blog/hooks/useBlog";
import BlogCard from "@/modules/blog/components/BlogCard";
import { Input, Pagination, EmptyState } from "@/components/ui";
import { LucideSearch, MdiClose, MdiNewspaperVariantOutline } from "@/components/icons/Icons";
import type { BlogPostListItem } from "@/modules/blog/types/blog.types";

interface BlogClientProps {
  initialData: { data: BlogPostListItem[]; meta: any };
}

export default function BlogClient({ initialData }: BlogClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || "";
  const tag = searchParams.get("tag") || "";

  const [searchInput, setSearchInput] = useState(search);

  const { data, isLoading } = useBlogPosts(
    {
      page,
      limit: 12,
      search: search || undefined,
      tag: tag || undefined,
      sort_by: "published_at",
      sort_order: "DESC",
    },
    { initialData },
  );

  const updateParams = useCallback(
    (updates: Record<string, string | null>, resetPage = true) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) params.set(key, value);
        else params.delete(key);
      }
      if (resetPage) params.set("page", "1");
      const qs = params.toString();
      router.push(qs ? `/blog?${qs}` : "/blog");
    },
    [searchParams, router],
  );

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateParams({ search: searchInput || null });
  }

  const posts = data?.data ?? [];

  return (
    <>
      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearchSubmit} className="w-full sm:max-w-xs">
          <Input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onBlur={() => updateParams({ search: searchInput || null })}
            placeholder="جستجو در مقالات..."
            icon={LucideSearch}
          />
        </form>
        {tag && (
          <button
            onClick={() => updateParams({ tag: null })}
            className="group flex items-center gap-1.5 self-start rounded-full bg-primary-light py-1.5 pl-2 pr-3 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-white"
          >
            #{tag}
            <MdiClose className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-72 animate-pulse rounded-card bg-surface-raised"
            />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={MdiNewspaperVariantOutline}
          title="مطلبی یافت نشد"
          message="هنوز مقاله‌ای با این شرایط منتشر نشده است."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data?.meta && (
        <Pagination
          meta={data.meta}
          onPageChange={(p) => updateParams({ page: String(p) }, false)}
          itemLabel="مطلب"
          className="mt-10"
        />
      )}
    </>
  );
}
