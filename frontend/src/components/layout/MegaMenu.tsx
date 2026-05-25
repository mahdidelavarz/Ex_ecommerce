// src/components/layout/MegaMenu.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useCategoryTree } from "@/modules/categories/hooks/useCategories";
import type {
  Category,
  CategoryTreeNode,
} from "@/modules/categories/types/category.types";
import { MdiChevronDown } from "../icons/Icons";
import { Icon } from "@iconify/react";

export default function MegaMenu() {
  const { data: categories, isLoading } = useCategoryTree();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="hidden lg:flex items-center gap-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-8 w-24 bg-surface-raised rounded animate-pulse-soft"
          />
        ))}
      </div>
    );
  }

  return (
    <nav className="hidden lg:block relative" aria-label="دسته‌بندی محصولات">
      <ul className="flex items-center gap-1" role="menubar">
        {categories?.map((category) => (
          <li
            key={category.id}
            role="none"
            onMouseEnter={() => setActiveCategory(category.id)}
            onMouseLeave={() => setActiveCategory(null)}
          >
            <Link
              href={`/categories/${category.slug}`}
              role="menuitem"
              className={`
                flex items-center gap-2 px-4 py-2 rounded-button text-sm font-medium
                transition-colors duration-200
                ${
                  activeCategory === category.id
                    ? "bg-primary-light text-primary"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-raised"
                }
              `}
            >
               {/* dynamic icon must add */}
              {category.icon && (
                <Icon icon={category.icon} className="w-4 h-4" />
              )}
              {category.name}
              {category.children.length > 0 && (
                <MdiChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    activeCategory === category.id ? "rotate-180" : ""
                  }`}
                />
              )}
            </Link>

            {/* Dropdown */}
            {category.children.length > 0 && activeCategory === category.id && (
              <div
                className="absolute right-0 left-0 top-full mt-2 bg-surface rounded-card shadow-modal border border-border p-6 z-50 animate-fade-in"
                onMouseEnter={() => setActiveCategory(category.id)}
                onMouseLeave={() => setActiveCategory(null)}
              >
                <div className="grid grid-cols-4 gap-8">
                  {category.children.map((child) => (
                    <CategoryColumn key={child.id} category={child} />
                  ))}
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

function CategoryColumn({ category }: { category: CategoryTreeNode }) {
  return (
    <div>
      <Link
        href={`/categories/${category.slug}`}
        className="block font-bold text-text-primary hover:text-primary transition-colors mb-3 pb-2 border-b border-border"
      >
         {/* dynamic icon must add */}
        {category.icon && (
          <Icon icon={category.icon} className="inline-block w-4 h-4 ms-1" />
        )}
        {category.name}
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
