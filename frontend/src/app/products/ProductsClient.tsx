'use client';

import { useState, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useProducts } from '@/modules/products/hooks/useProducts';
import { useCategories } from '@/modules/categories/hooks/useCategories';
import { useAllBrands } from '@/modules/brands/hooks/useBrands';
import { useAllTags } from '@/modules/tags/hooks/useTags';
import ProductGrid from '@/modules/products/components/ProductGrid';
import { Drawer, Input, Pagination, Select, Toggle } from '@/components/ui';
import { LucideSearch, MdiChevronLeft, MdiClose, MdiMenu } from '@/components/icons/Icons';
import type { ProductListResponse } from '@/modules/products/types/product.types';

interface ProductsClientProps {
  /** Server-fetched first render of the product list for the current URL. */
  initialData: { data: ProductListResponse[]; meta: any };
}

export default function ProductsClient({ initialData }: ProductsClientProps) {
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
  const hasDiscount = searchParams.get('has_discount') === 'true';
  const tagSlug = searchParams.get('tag') || '';
  const sortBy = searchParams.get('sort_by') || 'created_at';
  const sortOrder = (searchParams.get('sort_order') as 'ASC' | 'DESC') || 'DESC';

  // Local state only for search input to allow typing without per-keystroke navigation
  const [searchInput, setSearchInput] = useState(search);

  const { data: categoriesData } = useCategories({ limit: 100 });
  const { data: brandsData } = useAllBrands();
  const { data: tagsData } = useAllTags();

  const { data: productsData, isLoading } = useProducts(
    {
      page,
      limit: 20,
      search: search || undefined,
      category_id: categoryId || undefined,
      brand_id: brandId || undefined,
      min_price: minPrice || undefined,
      max_price: maxPrice || undefined,
      tag: tagSlug || undefined,
      has_stock: hasStock || undefined,
      has_discount: hasDiscount || undefined,
      sort_by: sortBy,
      sort_order: sortOrder,
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
    if (hasDiscount) chips.push({ key: 'discount', label: 'فقط تخفیف‌دار', onRemove: () => updateParams({ has_discount: null }) });
    return chips;
  }, [search, categoryId, brandId, minPrice, maxPrice, tagSlug, hasStock, hasDiscount, categoriesData, brandsData, tagsData, updateParams]);

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
        <form onSubmit={handleSearchSubmit}>
          <Input
            label="جستجو"
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onBlur={() => updateParams({ search: searchInput || null })}
            placeholder="نام محصول..."
            icon={LucideSearch}
          />
        </form>
      </div>

      <div className="h-px bg-border mb-6" />

      {/* Category Filter */}
      <div className="mb-6">
        <Select
          label="دسته‌بندی"
          value={categoryId}
          onChange={(e) => updateParams({ category: e.target.value || null })}
        >
          <option value="">همه دسته‌ها</option>
          {categoriesData?.data?.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </Select>
      </div>

      {/* Brand Filter */}
      <div className="mb-6">
        <Select
          label="برند"
          value={brandId}
          onChange={(e) => updateParams({ brand: e.target.value || null })}
        >
          <option value="">همه برندها</option>
          {brandsData?.map((brand) => (
            <option key={brand.id} value={brand.id}>{brand.name}</option>
          ))}
        </Select>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <label className="text-sm font-medium text-text-secondary block mb-2">محدوده قیمت</label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={minPrice}
            onChange={(e) => updateParams({ min_price: e.target.value || null })}
            placeholder="از"
            className="text-sm"
          />
          <span className="text-text-muted">—</span>
          <Input
            type="number"
            value={maxPrice}
            onChange={(e) => updateParams({ max_price: e.target.value || null })}
            placeholder="تا"
            className="text-sm"
          />
        </div>
      </div>

      {/* Has Stock — toggle */}
      <div className="mb-6">
        <Toggle
          label="فقط کالاهای موجود"
          checked={hasStock}
          onChange={(e) => updateParams({ has_stock: e.target.checked ? 'true' : null })}
        />
      </div>

      {/* Has Discount — toggle */}
      <div className="mb-6">
        <Toggle
          label="فقط کالاهای تخفیف‌دار"
          checked={hasDiscount}
          onChange={(e) => updateParams({ has_discount: e.target.checked ? 'true' : null })}
        />
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
    <>
      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 sticky top-24 self-start">
          {filterPanel}
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Sort Bar */}
          <div className="flex items-center justify-between mb-4 bg-surface rounded-card shadow-card px-4 py-2.5">
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
            <Select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [by, order] = e.target.value.split('-');
                updateParams({ sort_by: by, sort_order: order }, false);
              }}
              wrapperClassName="w-44"
              options={[
                { value: 'created_at-DESC', label: 'جدیدترین' },
                { value: 'created_at-ASC', label: 'قدیمی‌ترین' },
                { value: 'sales-DESC', label: 'پرفروش‌ترین' },
                { value: 'rating-DESC', label: 'محبوب‌ترین' },
                { value: 'price-ASC', label: 'ارزان‌ترین' },
                { value: 'price-DESC', label: 'گران‌ترین' },
                { value: 'title-ASC', label: 'الفبا (الف-ی)' },
              ]}
            />
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
          {productsData?.meta && (
            <Pagination
              meta={productsData.meta}
              onPageChange={(p) => updateParams({ page: String(p) }, false)}
              itemLabel="محصول"
              className="mt-10"
            />
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <Drawer
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        title="فیلترها"
        side="right"
      >
        {filterPanel}
      </Drawer>
    </>
  );
}
