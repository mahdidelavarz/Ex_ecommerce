// src/app/products/page.tsx
'use client';

import { useState, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useProducts } from '@/modules/products/hooks/useProducts';
import { useCategories } from '@/modules/categories/hooks/useCategories';
import { useAllBrands } from '@/modules/brands/hooks/useBrands';
import { useAllTags } from '@/modules/tags/hooks/useTags';
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
  const tagSlug = searchParams.get('tag') || '';
  const sortBy = searchParams.get('sort_by') || 'created_at';
  const sortOrder = (searchParams.get('sort_order') as 'ASC' | 'DESC') || 'DESC';

  // Local state only for search input to allow typing without per-keystroke navigation
  const [searchInput, setSearchInput] = useState(search);

  const { data: categoriesData } = useCategories({ limit: 100 });
  const { data: brandsData } = useAllBrands();
  const { data: tagsData } = useAllTags();

  const { data: productsData, isLoading } = useProducts({
    page,
    limit: 20,
    search: search || undefined,
    category_id: categoryId || undefined,
    brand_id: brandId || undefined,
    min_price: minPrice || undefined,
    max_price: maxPrice || undefined,
    tag: tagSlug || undefined,
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

  // Active filter chips (removable) — derived from URL state + lookup names
  const activeChips = useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = [];
    if (search) chips.push({ key: 'search', label: `جستجو: ${search}`, onRemove: () => { setSearchInput(''); updateParams({ search: null }); } });
    if (categoryId) {
      const name = categoriesData?.data?.find((c) => c.id === categoryId)?.name;
      if (name) chips.push({ key: 'category', label: name, onRemove: () => updateParams({ category: null }) });
    }
    if (brandId) {
      const name = brandsData?.find((b) => b.id === brandId)?.name;
      if (name) chips.push({ key: 'brand', label: name, onRemove: () => updateParams({ brand: null }) });
    }
    if (minPrice) chips.push({ key: 'min', label: `از ${Number(minPrice).toLocaleString('fa-IR')}`, onRemove: () => updateParams({ min_price: null }) });
    if (maxPrice) chips.push({ key: 'max', label: `تا ${Number(maxPrice).toLocaleString('fa-IR')}`, onRemove: () => updateParams({ max_price: null }) });
    if (tagSlug) {
      const name = tagsData?.find((t) => t.slug === tagSlug)?.name || tagSlug;
      chips.push({ key: 'tag', label: `#${name}`, onRemove: () => updateParams({ tag: null }) });
    }
    if (hasStock) chips.push({ key: 'stock', label: 'فقط موجود', onRemove: () => updateParams({ has_stock: null }) });
    return chips;
  }, [search, categoryId, brandId, minPrice, maxPrice, tagSlug, hasStock, categoriesData, brandsData, tagsData, updateParams]);

  const filterPanel = (
    <div className="bg-surface rounded-card shadow-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bold text-text-primary">فیلترها</h2>
        <button
          onClick={clearFilters}
          className="text-xs text-primary hover:underline cursor-pointer"
        >
          حذف همه
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
            placeholder="نام محصول..."
            className="w-full pr-9 pl-3 py-2.5 text-sm bg-surface-raised border border-border rounded-input focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface transition-colors"
          />
        </form>
      </div>

      <div className="h-px bg-border mb-6" />

      {/* Category Filter */}
      <div className="mb-6">
        <label className="text-sm font-medium text-text-secondary block mb-2">دسته‌بندی</label>
        <select
          value={categoryId}
          onChange={(e) => updateParams({ category: e.target.value || null })}
          className="w-full px-3 py-2.5 text-sm bg-surface-raised border border-border rounded-input focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
        >
          <option value="">همه دسته‌ها</option>
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
          className="w-full px-3 py-2.5 text-sm bg-surface-raised border border-border rounded-input focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
        >
          <option value="">همه برندها</option>
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
            className="w-full px-3 py-2.5 text-sm bg-surface-raised border border-border rounded-input focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <span className="text-text-muted">—</span>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => updateParams({ max_price: e.target.value || null })}
            placeholder="تا"
            className="w-full px-3 py-2.5 text-sm bg-surface-raised border border-border rounded-input focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Has Stock — toggle */}
      <div className="mb-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={hasStock}
            onChange={(e) => updateParams({ has_stock: e.target.checked ? 'true' : null })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-border rounded-full peer-checked:bg-primary relative after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-[-20px] transition-colors" />
          <span className="text-sm text-text-secondary">فقط کالاهای موجود</span>
        </label>
      </div>

      {/* Tag Filter */}
      {tagsData && tagsData.length > 0 && (
        <>
          <div className="h-px bg-border mb-6" />
          <div>
            <label className="text-sm font-medium text-text-secondary block mb-3">برچسب‌ها</label>
            <div className="flex flex-wrap gap-2">
              {tagsData.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => updateParams({ tag: tagSlug === tag.slug ? null : tag.slug })}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
                    tagSlug === tag.slug
                      ? 'bg-primary text-white border-primary'
                      : 'border-border text-text-secondary hover:border-primary hover:text-primary'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-text-muted mb-4">
          <a href="/" className="hover:text-primary transition-colors">خانه</a>
          <MdiChevronLeft className="w-4 h-4" />
          <span className="text-text-primary">محصولات</span>
        </nav>

        {/* Header band */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary">فروشگاه آرایشی و زیبایی</h1>
          <div className="mt-2 h-1 w-16 rounded-full bg-gradient-to-l from-secondary to-primary" />
          <p className="mt-3 text-sm text-text-secondary">جدیدترین محصولات اصل را با بهترین قیمت کشف کنید</p>
        </header>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0 sticky top-24 self-start">
            {filterPanel}
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Sort Bar */}
            <div className="flex items-center justify-between mb-4 bg-surface rounded-card shadow-card px-4 py-3">
              <div className="flex items-center gap-3">
                {/* Mobile filter toggle */}
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-1 text-sm text-text-secondary border border-border rounded-button px-3 py-1.5 cursor-pointer hover:border-primary"
                >
                  <MdiMenu className="w-4 h-4" />
                  فیلترها
                </button>
                <p className="text-sm text-text-secondary">
                  <span className="font-bold text-text-primary">{productsData?.meta?.total || 0}</span> محصول
                </p>
              </div>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [by, order] = e.target.value.split('-');
                  updateParams({ sort_by: by, sort_order: order }, false);
                }}
                className="px-3 py-2 text-sm bg-surface-raised border border-border rounded-input focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              >
                <option value="created_at-DESC">جدیدترین</option>
                <option value="created_at-ASC">قدیمی‌ترین</option>
                <option value="price-ASC">ارزان‌ترین</option>
                <option value="price-DESC">گران‌ترین</option>
                <option value="title-ASC">الفبا (الف-ی)</option>
              </select>
            </div>

            {/* Active filter chips */}
            {activeChips.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                {activeChips.map((chip) => (
                  <button
                    key={chip.key}
                    onClick={chip.onRemove}
                    className="group flex items-center gap-1.5 bg-primary-light text-primary text-xs font-medium pr-3 pl-2 py-1.5 rounded-full transition-colors hover:bg-primary hover:text-white cursor-pointer"
                  >
                    {chip.label}
                    <MdiClose className="w-3.5 h-3.5" />
                  </button>
                ))}
                <button
                  onClick={clearFilters}
                  className="text-xs text-text-muted hover:text-primary underline cursor-pointer"
                >
                  پاک کردن همه
                </button>
              </div>
            )}

            {/* Product Grid */}
            <ProductGrid
              products={productsData?.data || []}
              isLoading={isLoading}
              emptyMessage="محصولی با این فیلترها یافت نشد"
            />

            {/* Pagination */}
            {productsData?.meta && productsData.meta.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => updateParams({ page: String(page - 1) }, false)}
                  disabled={page === 1}
                  className="p-2 rounded-button hover:bg-primary-light disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-colors"
                >
                  <MdiChevronRight className="w-5 h-5" />
                </button>
                {Array.from({ length: productsData.meta.totalPages }, (_, i) => i + 1)
                  .slice(Math.max(0, page - 3), Math.min(productsData.meta.totalPages, page + 2))
                  .map((p) => (
                    <button
                      key={p}
                      onClick={() => updateParams({ page: String(p) }, false)}
                      className={`w-10 h-10 rounded-button text-sm font-medium transition-colors cursor-pointer ${
                        p === page ? 'bg-primary text-white shadow-card' : 'text-text-secondary hover:bg-primary-light'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                <button
                  onClick={() => updateParams({ page: String(page + 1) }, false)}
                  disabled={page === productsData.meta.totalPages}
                  className="p-2 rounded-button hover:bg-primary-light disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-colors"
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
            className="absolute inset-0 bg-text-primary/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 w-80 max-w-full bg-background overflow-y-auto animate-slide-in-right">
            <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-background">
              <h2 className="font-bold text-text-primary">فیلترها</h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-2 hover:bg-surface-raised rounded-button cursor-pointer"
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
