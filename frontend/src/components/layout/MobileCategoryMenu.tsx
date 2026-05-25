// src/components/layout/MobileCategoryMenu.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCategoryTree } from '@/modules/categories/hooks/useCategories';
import type { Category, CategoryTreeNode } from '@/modules/categories/types/category.types';
import { MdiChevronDown, MdiClose } from '../icons/Icons';
import { Icon } from '@iconify/react';

interface MobileCategoryMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileCategoryMenu({ isOpen, onClose }: MobileCategoryMenuProps) {
  const { data: categories } = useCategoryTree();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (id: string) => {
    const newSet = new Set(expandedCategories);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedCategories(newSet);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 right-0 h-full w-80 bg-surface z-50 lg:hidden
          transform transition-transform duration-300 shadow-modal
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold text-text-primary">دسته‌بندی‌ها</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-raised rounded-button transition-colors"
            aria-label="بستن منو"
          >
            <MdiClose className="w-6 h-6 text-text-primary" />
          </button>
        </div>

        <div className="overflow-y-auto h-[calc(100%-64px)] p-4">
          {categories?.map((category) => (
            <div key={category.id} className="mb-2">
              <div className="flex items-center">
                <Link
                  href={`/categories/${category.slug}`}
                  onClick={onClose}
                  className="flex-1 flex items-center gap-3 py-3 hover:text-primary transition-colors"
                >
                   {/* dynamic icon must add */}
                  {category.icon && (
                    <Icon icon={category.icon} className="w-5 h-5" />
                  )}
                  <span className="font-medium text-text-primary">{category.name}</span>
                </Link>
                {category.children.length > 0 && (
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="p-2 hover:bg-surface-raised rounded-button transition-colors"
                    aria-label={expandedCategories.has(category.id) ? 'بستن' : 'باز کردن'}
                  >
                    <MdiChevronDown
                      className={`w-5 h-5 text-text-secondary transition-transform duration-200 ${
                        expandedCategories.has(category.id) ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                )}
              </div>

              {/* Subcategories */}
              {category.children.length > 0 && expandedCategories.has(category.id) && (
                <div className="pr-8 border-r-2 border-border mr-4 animate-fade-in">
                  {category.children.map((child) => (
                    <Link
                      key={child.id}
                      href={`/categories/${child.slug}`}
                      onClick={onClose}
                      className="block py-2 text-text-secondary hover:text-primary transition-colors"
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}