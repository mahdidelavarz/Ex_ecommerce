// src/components/layout/CategoryBar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { useCategoryTree } from "@/modules/categories/hooks/useCategories";
import type { CategoryTreeNode } from "@/modules/categories/types/category.types";
import { Skeleton } from "@/components/ui";
import { MdiMenu, MdiChevronDown, MdiNewspaperVariantOutline } from "../icons/Icons";

export default function CategoryBar() {
  const { data: categories, isLoading } = useCategoryTree();
  const [allOpen, setAllOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <div className="hidden lg:block  bg-surface">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 h-12">
          {/* All categories trigger + full panel */}
          <div
            className="relative h-full flex items-center"
            onMouseEnter={() => setAllOpen(true)}
            onMouseLeave={() => setAllOpen(false)}
          >
            <button
              className={`flex items-center gap-2 px-4 h-9 rounded-button text-sm font-bold transition-colors cursor-pointer ${
                allOpen
                  ? "bg-primary text-white"
                  : "bg-primary-light text-primary hover:bg-primary hover:text-white"
              }`}
              aria-expanded={allOpen}
            >
              <MdiMenu className="w-5 h-5" />
              همه دسته‌بندی‌ها
              <MdiChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  allOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {allOpen && (categories?.length ?? 0) > 0 && (
              <div className="absolute right-0 top-full w-[56rem] max-w-[calc(100vw-2rem)] bg-surface rounded-card shadow-modal border border-border p-6 z-50 animate-fade-in">
                <div className="grid grid-cols-3 gap-x-8 gap-y-6">
                  {categories?.map((category) => (
                    <CategoryColumn key={category.id} category={category} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="w-px h-6 bg-border" />

          {/* Blog link */}
          <Link
            href="/blog"
            className="flex items-center gap-1.5 px-3 py-2 rounded-button text-sm font-medium text-text-secondary transition-colors hover:text-primary"
          >
            <MdiNewspaperVariantOutline className="w-4 h-4" />
            وبلاگ
          </Link>

          <div className="w-px h-6 bg-border" />

          {/* Inline top-level category links */}
          {isLoading ? (
            <div className="flex items-center gap-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-24" />
              ))}
            </div>
          ) : (
            <nav aria-label="دسته‌بندی محصولات" className="flex items-center gap-1">
              {categories?.slice(0, 7).map((category) => (
                <div
                  key={category.id}
                  className="relative h-full flex items-center"
                  onMouseEnter={() => setActiveId(category.id)}
                  onMouseLeave={() => setActiveId(null)}
                >
                  <Link
                    href={`/categories/${category.slug}`}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-button text-sm font-medium transition-colors ${
                      activeId === category.id
                        ? "text-primary"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {category.icon && (
                      <Icon icon={category.icon} className="w-4 h-4" />
                    )}
                    {category.name}
                    {category.children.length > 0 && (
                      <MdiChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          activeId === category.id ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </Link>

                  {category.children.length > 0 && activeId === category.id && (
                    <div className="absolute right-0 top-full min-w-[14rem] bg-surface rounded-card shadow-modal border border-border p-4 z-50 animate-fade-in">
                      <CategoryColumn category={category} hideHeadingLink />
                    </div>
                  )}
                </div>
              ))}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}

function CategoryColumn({
  category,
  hideHeadingLink = false,
}: {
  category: CategoryTreeNode;
  hideHeadingLink?: boolean;
}) {
  return (
    <div className="min-w-[10rem]">
      <Link
        href={`/categories/${category.slug}`}
        className="flex items-center gap-2 font-bold text-text-primary hover:text-primary transition-colors mb-3 pb-2 border-b border-border"
      >
        {category.icon && <Icon icon={category.icon} className="w-4 h-4" />}
        {hideHeadingLink ? `همه ${category.name}` : category.name}
      </Link>
      {category.children.length > 0 && (
        <ul className="space-y-2">
          {category.children.map((sub) => (
            <li key={sub.id}>
              <Link
                href={`/categories/${sub.slug}`}
                className="text-text-secondary hover:text-primary transition-colors text-sm"
              >
                {sub.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
