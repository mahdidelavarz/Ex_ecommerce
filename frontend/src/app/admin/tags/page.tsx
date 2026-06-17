// src/app/(admin)/admin/tags/page.tsx
'use client';

import { useState } from 'react';
import { useTags, useCreateTag, useUpdateTag, useDeleteTag } from '@/modules/tags/hooks/useTags';
import { useAdminRoute } from '@/modules/auth/hooks/useAdminRoute';
import AdminSidebar from '@/components/layout/AdminSidebar';
import Button from '@/components/ui/Button';
import type { Tag } from '@/modules/tags/types/tag.types';
import { LucidePencil, LucidePlus, LucideSearch, MdiCheck, MdiChevronLeft, MdiChevronRight, MdiClose, MdiTag, MdiTrashCan, SvgSpinnersRingResize } from '@/components/icons/Icons';

const LIMIT = 50;

export default function AdminTagsPage() {
  const { isLoading: isAuthLoading } = useAdminRoute();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [newTagError, setNewTagError] = useState('');
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [editName, setEditName] = useState('');
  const [editError, setEditError] = useState('');

  const { data, isLoading } = useTags({ page, limit: LIMIT, search: search || undefined });
  const createMutation = useCreateTag();
  const updateMutation = useUpdateTag();
  const deleteMutation = useDeleteTag();

  const totalPages = data?.meta ? Math.ceil(data.meta.total / LIMIT) : 1;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleCreate = () => {
    const name = newTagName.trim();
    if (!name) {
      setNewTagError('نام تگ نمی‌تواند خالی باشد');
      return;
    }
    setNewTagError('');
    createMutation.mutate({ name }, {
      onSuccess: () => setNewTagName(''),
    });
  };

  const handleUpdate = () => {
    const name = editName.trim();
    if (!editingTag) return;
    if (!name) {
      setEditError('نام تگ نمی‌تواند خالی باشد');
      return;
    }
    setEditError('');
    updateMutation.mutate({ id: editingTag.id, data: { name } }, {
      onSuccess: () => setEditingTag(null),
    });
  };

  const handleDelete = (tag: Tag) => {
    if (!window.confirm(`حذف "${tag.name}"؟`)) return;
    deleteMutation.mutate(tag.id);
  };

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <SvgSpinnersRingResize className="text-primary" width={48} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 lg:mr-64 p-4 lg:p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-text-primary mb-8">تگ‌ها</h1>

          {/* Create */}
          <div className="bg-surface rounded-card shadow-card p-4 mb-6">
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  value={newTagName}
                  onChange={(e) => { setNewTagName(e.target.value); setNewTagError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  placeholder="نام تگ جدید..."
                  className={`w-full px-4 py-2 bg-surface border rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                    newTagError ? 'border-error' : 'border-border'
                  }`}
                />
                {newTagError && <p className="text-xs text-error mt-1">{newTagError}</p>}
              </div>
              <Button onClick={handleCreate} icon={LucidePlus} loading={createMutation.isPending}>
                ایجاد
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <LucideSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" width={20} />
            <input
              value={search}
              onChange={handleSearch}
              placeholder="جستجو..."
              className="w-full pr-10 pl-4 py-2 bg-surface border border-border rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Tags List */}
          <div className="bg-surface rounded-card shadow-card">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-surface-raised rounded animate-pulse-soft" />)}
              </div>
            ) : (
              <div className="divide-y divide-border">
                {data?.data?.map((tag) => (
                  <div key={tag.id} className="flex items-center justify-between p-4 hover:bg-surface-raised/50">
                    {editingTag?.id === tag.id ? (
                      <div className="flex flex-col gap-1 flex-1">
                        <div className="flex items-center gap-3">
                          <input
                            value={editName}
                            onChange={(e) => { setEditName(e.target.value); setEditError(''); }}
                            onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                            className={`flex-1 px-3 py-1 border rounded-input text-sm ${editError ? 'border-error' : 'border-border'}`}
                            autoFocus
                          />
                          <button
                            onClick={handleUpdate}
                            disabled={updateMutation.isPending}
                            className="text-success p-1 disabled:opacity-50"
                          >
                            <MdiCheck className="w-5 h-5" />
                          </button>
                          <button onClick={() => { setEditingTag(null); setEditError(''); }} className="text-error p-1">
                            <MdiClose className="w-5 h-5" />
                          </button>
                        </div>
                        {editError && <p className="text-xs text-error">{editError}</p>}
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <MdiTag className="w-5 h-5 text-text-muted" />
                          <div>
                            <span className="font-medium text-text-primary">{tag.name}</span>
                            <code className="text-xs text-text-muted mr-2">{tag.slug}</code>
                          </div>
                          <span className="text-xs text-text-muted">({tag.products_count} محصول)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => { setEditingTag(tag); setEditName(tag.name); setEditError(''); }}
                            className="p-2 hover:bg-primary-light rounded-button text-primary"
                          >
                            <LucidePencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(tag)}
                            disabled={deleteMutation.isPending}
                            className="p-2 hover:bg-error-light rounded-button text-error disabled:opacity-50"
                          >
                            <MdiTrashCan className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {data?.data?.length === 0 && (
                  <p className="text-center text-text-muted py-8">هیچ تگی یافت نشد</p>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm text-text-secondary">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 px-3 py-1.5 border border-border rounded-button hover:bg-surface-raised disabled:opacity-40"
              >
                <MdiChevronRight className="w-4 h-4" />
                قبلی
              </button>
              <span>صفحه {page} از {totalPages}</span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages}
                className="flex items-center gap-1 px-3 py-1.5 border border-border rounded-button hover:bg-surface-raised disabled:opacity-40"
              >
                بعدی
                <MdiChevronLeft className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
