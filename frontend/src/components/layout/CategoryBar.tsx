// src/components/layout/CategoryBar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { useCategoryTree } from "@/modules/categories/hooks/useCategories";
import type { CategoryTreeNode } from "@/modules/categories/types/category.types";
import {
  MdiMenu,
  MdiChevronDown,
  MdiNewspaperVariantOutline,
  MdiTagMultiple,
} from "../icons/Icons";

export default function CategoryBar() {
  const { data: categories } = useCategoryTree();
  const [allOpen, setAllOpen] = useState(false);

  return (
    <div className="hidden lg:block">
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

            {(categories?.length ?? 0) > 0 && (
              <div
                className={`absolute right-0 top-full w-[56rem] max-w-[calc(100vw-2rem)] bg-surface rounded-card shadow-modal border border-border p-6 z-50 origin-top transition-all duration-200 ease-out ${
                  allOpen
                    ? "opacity-100 translate-y-0 visible"
                    : "opacity-0 -translate-y-1 invisible pointer-events-none"
                }`}
              >
                <div className="grid grid-cols-3 gap-x-8 gap-y-6">
                  {categories?.map((category) => (
                    <CategoryColumn key={category.id} category={category} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mx-2 h-6 w-px bg-border" />

          <nav aria-label="لینک‌های فروشگاه" className="flex items-center gap-1">
            <Link
              href="/brands"
              className="flex items-center gap-1.5 rounded-button px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-raised hover:text-primary"
            >
              <MdiTagMultiple className="h-4 w-4" />
              برندها
            </Link>
            <Link
              href="/blog"
              className="flex items-center gap-1.5 rounded-button px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-raised hover:text-primary"
            >
              <MdiNewspaperVariantOutline className="h-4 w-4" />
              وبلاگ
            </Link>
          </nav>
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
