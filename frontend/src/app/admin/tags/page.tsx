// src/app/(admin)/admin/tags/page.tsx
'use client';

import { useState } from 'react';
import { useTags, useCreateTag, useUpdateTag, useDeleteTag } from '@/modules/tags/hooks/useTags';
import { useAdminRoute } from '@/modules/auth/hooks/useAdminRoute';
import AdminPage from '@/components/layout/AdminPage';
import { Button, Input, Modal, PageFilters, PageHeader, Pagination, RowActions, Skeleton } from '@/components/ui';
import type { Tag } from '@/modules/tags/types/tag.types';
import { LucidePencil, LucidePlus, LucideSearch, MdiCheck, MdiClose, MdiTag, MdiTrashCan } from '@/components/icons/Icons';

const LIMIT = 50;

export default function AdminTagsPage() {
  const { isLoading: isAuthLoading } = useAdminRoute();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
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
      onSuccess: () => {
        setNewTagName('');
        setCreateOpen(false);
      },
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

  return (
    <AdminPage
      maxWidth="3xl"
      loading={isAuthLoading}
      header={
        <PageHeader
          title="تگ‌ها"
          action={{
            label: "تگ جدید",
            icon: LucidePlus,
            onClick: () => { setNewTagName(''); setNewTagError(''); setCreateOpen(true); },
          }}
        />
      }
      filters={
        <PageFilters>
          <Input
            value={search}
            onChange={handleSearch}
            placeholder="جستجو..."
            icon={LucideSearch}
          />
        </PageFilters>
      }
      footer={
        data?.meta && (
          <Pagination
            meta={{ page, limit: LIMIT, total: data.meta.total, totalPages }}
            onPageChange={setPage}
            itemLabel="تگ"
          />
        )
      }
    >
      {/* Create Tag Modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="تگ جدید"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              انصراف
            </Button>
            <Button onClick={handleCreate} loading={createMutation.isPending}>
              ایجاد
            </Button>
          </>
        }
      >
        <Input
          value={newTagName}
          onChange={(e) => { setNewTagName(e.target.value); setNewTagError(''); }}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          placeholder="نام تگ جدید..."
          error={newTagError || undefined}
          autoFocus
        />
      </Modal>

      {/* Tags List */}
      <div className="bg-surface rounded-card shadow-card">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : (
              <div className="divide-y divide-border">
                {data?.data?.map((tag) => (
                  <div key={tag.id} className="flex items-center justify-between p-4 hover:bg-surface-raised/50">
                    {editingTag?.id === tag.id ? (
                      <div className="flex flex-col gap-1 flex-1">
                        <div className="flex items-center gap-3">
                          <Input
                            wrapperClassName="flex-1"
                            value={editName}
                            onChange={(e) => { setEditName(e.target.value); setEditError(''); }}
                            onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                            error={editError || undefined}
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
                        <RowActions
                          actions={[
                            {
                              icon: LucidePencil,
                              title: 'ویرایش',
                              onClick: () => { setEditingTag(tag); setEditName(tag.name); setEditError(''); },
                            },
                            {
                              icon: MdiTrashCan,
                              title: 'حذف',
                              variant: 'error',
                              onClick: () => handleDelete(tag),
                              disabled: deleteMutation.isPending,
                            },
                          ]}
                        />
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
    </AdminPage>
  );
}
