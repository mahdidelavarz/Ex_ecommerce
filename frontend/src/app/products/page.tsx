// src/app/products/page.tsx
'use client';

import { useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useProducts } from '@/modules/products/hooks/useProducts';
import { useCategories } from '@/modules/categories/hooks/useCategories';
import { useAllBrands } from '@/modules/brands/hooks/useBrands';
import ProductGrid from '@/modules/products/components/ProductGrid';
import { LucideSearch, MdiChevronLeft, MdiChevronRight, MdiClose, MdiMenu } from '@/components/icons/Icons';

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // All filter state is URL-derived — single source of truth
  const page = Number(searchParams.get('page')) || 1;
  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('category') || '';
  const brandId = searchParams.get('brand') || '';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';
  const hasStock = searchParams.get('has_stock') === 'true';
  const sortBy = searchParams.get('sort_by') || 'created_at';
  const sortOrder = (searchParams.get('sort_order') as 'ASC' | 'DESC') || 'DESC';

  // Local state only for search input to allow typing without per-keystroke navigation
  const [searchInput, setSearchInput] = useState(search);

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

  const updateParams = useCallback(
    (updates: Record<string, string | null>, resetPage = true) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) params.set(key, value);
        else params.delete(key);
      }
      if (resetPage) params.set('page', '1');
      router.push(`/products?${params.toString()}`);
    },
    [searchParams, router],
  );

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateParams({ search: searchInput || null });
  }

  function clearFilters() {
    setSearchInput('');
    router.push('/products');
  }

  const filterPanel = (
    <div className="bg-surface rounded-card shadow-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bold text-text-primary">فیلترها</h2>
        <button
          onClick={clearFilters}
          className="text-xs text-error hover:underline"
        >
          حذف فیلترها
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <label className="text-sm font-medium text-text-secondary block mb-2">جستجو</label>
        <form onSubmit={handleSearchSubmit} className="relative">
          <LucideSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" width={18} />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onBlur={() => updateParams({ search: searchInput || null })}
            placeholder="جستجو..."
            className="w-full pr-9 pl-3 py-2 text-sm bg-surface border border-border rounded-input focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </form>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <label className="text-sm font-medium text-text-secondary block mb-2">دسته‌بندی</label>
        <select
          value={categoryId}
          onChange={(e) => updateParams({ category: e.target.value || null })}
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
          onChange={(e) => updateParams({ brand: e.target.value || null })}
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
            onChange={(e) => updateParams({ min_price: e.target.value || null })}
            placeholder="از"
            className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-input focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <span className="text-text-muted">-</span>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => updateParams({ max_price: e.target.value || null })}
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
            onChange={(e) => updateParams({ has_stock: e.target.checked ? 'true' : null })}
            className="rounded"
          />
          <span className="text-sm text-text-secondary">فقط کالاهای موجود</span>
        </label>
      </div>
    </div>
  );

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
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0 sticky top-24 self-start">
            {filterPanel}
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Sort Bar */}
            <div className="flex items-center justify-between mb-6 bg-surface rounded-card shadow-card px-4 py-3">
              <div className="flex items-center gap-3">
                {/* Mobile filter toggle */}
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-1 text-sm text-text-secondary border border-border rounded-button px-3 py-1.5"
                >
                  <MdiMenu className="w-4 h-4" />
                  فیلترها
                </button>
                <p className="text-sm text-text-secondary">
                  {productsData?.meta?.total || 0} محصول
                </p>
              </div>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [by, order] = e.target.value.split('-');
                  updateParams({ sort_by: by, sort_order: order }, false);
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
                  onClick={() => updateParams({ page: String(page - 1) }, false)}
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
                      onClick={() => updateParams({ page: String(p) }, false)}
                      className={`w-10 h-10 rounded-button text-sm font-medium ${
                        p === page ? 'bg-primary text-white' : 'hover:bg-surface'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                <button
                  onClick={() => updateParams({ page: String(page + 1) }, false)}
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

      {/* Mobile Filter Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 w-80 max-w-full bg-background overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-bold text-text-primary">فیلترها</h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-2 hover:bg-surface rounded-button"
              >
                <MdiClose className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              {filterPanel}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
