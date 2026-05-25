// src/app/(admin)/admin/tags/page.tsx
'use client';

import { useState } from 'react';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';
import { useTags } from '@/modules/tags/hooks/useTags';
import { tagService } from '@/modules/tags/services/tag.service';
import { useAdminRoute } from '@/modules/auth/hooks/useAdminRoute';
import AdminSidebar from '@/components/layout/AdminSidebar';
import Button from '@/components/ui/Button';
import type { Tag } from '@/modules/tags/services/tag.service';
import { LucidePlus } from '@/components/icons/Icons';

export default function AdminTagsPage() {
  const { isLoading: isAuthLoading } = useAdminRoute();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [editName, setEditName] = useState('');

  const { data, isLoading, refetch } = useTags({ page, limit: 50, search: search || undefined });

  const handleCreate = async () => {
    if (!newTagName.trim()) return;
    try {
      await tagService.create({ name: newTagName.trim() });
      toast.success('تگ ایجاد شد');
      setNewTagName('');
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'خطا');
    }
  };

  const handleUpdate = async () => {
    if (!editingTag || !editName.trim()) return;
    try {
      await tagService.update(editingTag.id, { name: editName.trim() });
      toast.success('تگ بروزرسانی شد');
      setEditingTag(null);
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'خطا');
    }
  };

  const handleDelete = async (tag: Tag) => {
    if (!window.confirm(`حذف "${tag.name}"؟`)) return;
    try {
      await tagService.delete(tag.id);
      toast.success('تگ حذف شد');
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'خطا');
    }
  };

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Icon icon="mdi:loading" className="animate-spin text-primary" width={48} />
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
              <input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                placeholder="نام تگ جدید..."
                className="flex-1 px-4 py-2 bg-surface border border-border rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button onClick={handleCreate} icon={LucidePlus}>ایجاد</Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Icon icon="mdi:search" className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" width={20} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
                      <div className="flex items-center gap-3 flex-1">
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                          className="flex-1 px-3 py-1 border border-border rounded-input text-sm"
                          autoFocus
                        />
                        <button onClick={handleUpdate} className="text-success p-1"><Icon icon="mdi:check" className="w-5 h-5" /></button>
                        <button onClick={() => setEditingTag(null)} className="text-error p-1"><Icon icon="mdi:close" className="w-5 h-5" /></button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <Icon icon="mdi:tag" className="w-5 h-5 text-text-muted" />
                          <div>
                            <span className="font-medium text-text-primary">{tag.name}</span>
                            <code className="text-xs text-text-muted mr-2">{tag.slug}</code>
                          </div>
                          <span className="text-xs text-text-muted">({tag.products_count} محصول)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => { setEditingTag(tag); setEditName(tag.name); }}
                            className="p-2 hover:bg-primary-light rounded-button text-primary"
                          >
                            <Icon icon="mdi:pencil" className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(tag)}
                            className="p-2 hover:bg-error-light rounded-button text-error"
                          >
                            <Icon icon="mdi:delete" className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}