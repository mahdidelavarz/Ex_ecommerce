// src/app/products/page.tsx
'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useProducts } from '@/modules/products/hooks/useProducts';
import { useCategories } from '@/modules/categories/hooks/useCategories';
import { useAllBrands } from '@/modules/brands/hooks/useBrands';
import ProductGrid from '@/modules/products/components/ProductGrid';
import { formatPrice } from '@/utils/formatPrice';
import { LucideSearch, MdiChevronLeft, MdiChevronRight } from '@/components/icons/Icons';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const initialBrand = searchParams.get('brand') || '';

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState(initialCategory);
  const [brandId, setBrandId] = useState(initialBrand);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [hasStock, setHasStock] = useState(false);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  const { data: categoriesData } = useCategories({ limit: 100 });
  const { data: brandsData } = useAllBrands();

  const { data: productsData, isLoading } = useProducts({
    page,
    limit: 20,
    search: search || undefined,
    category_id: categoryId || undefined,
    brand_id: brandId || undefined,
    min_price: minPrice || undefined,
    max_price: maxPrice || undefined,
    has_stock: hasStock || undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
  });

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-text-muted mb-6">
          <a href="/" className="hover:text-primary">خانه</a>
          <MdiChevronLeft className="w-4 h-4" />
          <span className="text-text-primary">محصولات</span>
        </nav>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-surface rounded-card shadow-card p-6 sticky top-24">
              <h2 className="font-bold text-text-primary mb-6">فیلترها</h2>

              {/* Search */}
              <div className="mb-6">
                <label className="text-sm font-medium text-text-secondary block mb-2">جستجو</label>
                <div className="relative">
                  <LucideSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" width={18} />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    placeholder="جستجو..."
                    className="w-full pr-9 pl-3 py-2 text-sm bg-surface border border-border rounded-input focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="text-sm font-medium text-text-secondary block mb-2">دسته‌بندی</label>
                <select
                  value={categoryId}
                  onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
                  className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-input focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">همه</option>
                  {categoriesData?.data?.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Brand Filter */}
              <div className="mb-6">
                <label className="text-sm font-medium text-text-secondary block mb-2">برند</label>
                <select
                  value={brandId}
                  onChange={(e) => { setBrandId(e.target.value); setPage(1); }}
                  className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-input focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">همه</option>
                  {brandsData?.map((brand) => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="text-sm font-medium text-text-secondary block mb-2">محدوده قیمت</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                    placeholder="از"
                    className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-input focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-text-muted">-</span>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                    placeholder="تا"
                    className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-input focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Has Stock */}
              <div className="mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasStock}
                    onChange={(e) => { setHasStock(e.target.checked); setPage(1); }}
                    className="rounded"
                  />
                  <span className="text-sm text-text-secondary">فقط کالاهای موجود</span>
                </label>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setSearch('');
                  setCategoryId('');
                  setBrandId('');
                  setMinPrice('');
                  setMaxPrice('');
                  setHasStock(false);
                  setSortBy('created_at');
                  setSortOrder('DESC');
                  setPage(1);
                }}
                className="w-full py-2 text-sm text-error hover:bg-error-light rounded-button transition-colors"
              >
                حذف فیلترها
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort Bar */}
            <div className="flex items-center justify-between mb-6 bg-surface rounded-card shadow-card px-4 py-3">
              <p className="text-sm text-text-secondary">
                {productsData?.meta?.total || 0} محصول یافت شد
              </p>
              <div className="flex items-center gap-4">
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [by, order] = e.target.value.split('-');
                    setSortBy(by);
                    setSortOrder(order as 'ASC' | 'DESC');
                  }}
                  className="px-3 py-2 text-sm bg-surface border border-border rounded-input focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="created_at-DESC">جدیدترین</option>
                  <option value="created_at-ASC">قدیمی‌ترین</option>
                  <option value="price-ASC">ارزان‌ترین</option>
                  <option value="price-DESC">گران‌ترین</option>
                  <option value="title-ASC">الفبا (الف-ی)</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            <ProductGrid
              products={productsData?.data || []}
              isLoading={isLoading}
              emptyMessage="محصولی با این فیلترها یافت نشد"
            />

            {/* Pagination */}
            {productsData?.meta && productsData.meta.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 hover:bg-surface rounded-button disabled:opacity-50"
                >
                  <MdiChevronRight className="w-5 h-5" />
                </button>
                {Array.from({ length: productsData.meta.totalPages }, (_, i) => i + 1)
                  .slice(Math.max(0, page - 3), Math.min(productsData.meta.totalPages, page + 2))
                  .map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-10 h-10 rounded-button text-sm font-medium ${
                        p === page ? 'bg-primary text-white' : 'hover:bg-surface'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                <button
                  onClick={() => setPage((p) => Math.min(productsData.meta.totalPages, p + 1))}
                  disabled={page === productsData.meta.totalPages}
                  className="p-2 hover:bg-surface rounded-button disabled:opacity-50"
                >
                  <MdiChevronLeft className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}