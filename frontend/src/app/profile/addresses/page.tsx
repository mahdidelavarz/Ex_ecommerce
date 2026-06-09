// src/app/(profile)/profile/addresses/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useProtectedRoute } from '@/modules/auth/hooks/useProtectedRoute';
import Button from '@/components/ui/Button';
import type { ApiResponse } from '@/modules/auth/types/auth.type';
import { LucidePencil, LucidePlus, LucideTrash2, MdiMapMarkerOff, SvgSpinnersRingResize } from '@/components/icons/Icons';

interface Address {
  id: string;
  full_name: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  address_line_1: string;
  address_line_2: string | null;
  postal_code: string;
  is_default_shipping: boolean;
  is_default_billing: boolean;
}

export default function ProfileAddressesPage() {
  const { isLoading: isAuthLoading } = useProtectedRoute();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    country: 'ایران',
    state: '',
    city: '',
    address_line_1: '',
    address_line_2: '',
    postal_code: '',
    is_default_shipping: false,
    is_default_billing: false,
  });

  const { data: addresses, isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const r = await apiClient.get<ApiResponse<Address[]>>('/addresses');
      return r.data.data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingAddress) {
        return apiClient.patch(`/addresses/${editingAddress.id}`, data);
      }
      return apiClient.post('/addresses', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success(editingAddress ? 'آدرس بروزرسانی شد' : 'آدرس اضافه شد');
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'خطا');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/addresses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('آدرس حذف شد');
    },
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingAddress(null);
    setForm({
      full_name: '', phone: '', country: 'ایران', state: '', city: '',
      address_line_1: '', address_line_2: '', postal_code: '',
      is_default_shipping: false, is_default_billing: false,
    });
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setForm({
      full_name: address.full_name,
      phone: address.phone,
      country: address.country,
      state: address.state,
      city: address.city,
      address_line_1: address.address_line_1,
      address_line_2: address.address_line_2 || '',
      postal_code: address.postal_code,
      is_default_shipping: address.is_default_shipping,
      is_default_billing: address.is_default_billing,
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(form);
  };

  if (isAuthLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <SvgSpinnersRingResize className="animate-spin text-primary" width={48} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Profile Nav */}
      <div className="flex items-center gap-6 mb-8 border-b border-border pb-4">
        <Link href="/profile" className="text-text-secondary hover:text-primary transition-colors">پروفایل</Link>
        <Link href="/profile/orders" className="text-text-secondary hover:text-primary transition-colors">سفارش‌ها</Link>
        <Link href="/profile/addresses" className="text-primary font-medium border-b-2 border-primary pb-4 -mb-[17px]">آدرس‌ها</Link>
      </div>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-text-primary">آدرس‌های من</h1>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} icon={LucidePlus}>آدرس جدید</Button>
        )}
      </div>

      {/* Address Form */}
      {showForm && (
        <div className="bg-surface rounded-card shadow-card p-6 mb-6">
          <h2 className="font-bold text-text-primary mb-4">
            {editingAddress ? 'ویرایش آدرس' : 'آدرس جدید'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-text-secondary block mb-1">نام کامل *</label>
              <input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} required className="w-full px-3 py-2 bg-surface border rounded-input text-sm" />
            </div>
            <div>
              <label className="text-xs text-text-secondary block mb-1">شماره تماس *</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required className="w-full px-3 py-2 bg-surface border rounded-input text-sm" />
            </div>
            <div>
              <label className="text-xs text-text-secondary block mb-1">استان *</label>
              <input value={form.state} onChange={e => setForm({...form, state: e.target.value})} required className="w-full px-3 py-2 bg-surface border rounded-input text-sm" />
            </div>
            <div>
              <label className="text-xs text-text-secondary block mb-1">شهر *</label>
              <input value={form.city} onChange={e => setForm({...form, city: e.target.value})} required className="w-full px-3 py-2 bg-surface border rounded-input text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-text-secondary block mb-1">آدرس *</label>
              <input value={form.address_line_1} onChange={e => setForm({...form, address_line_1: e.target.value})} required className="w-full px-3 py-2 bg-surface border rounded-input text-sm" />
            </div>
            <div>
              <label className="text-xs text-text-secondary block mb-1">کد پستی *</label>
              <input value={form.postal_code} onChange={e => setForm({...form, postal_code: e.target.value})} required className="w-full px-3 py-2 bg-surface border rounded-input text-sm" />
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.is_default_shipping} onChange={e => setForm({...form, is_default_shipping: e.target.checked})} />
                آدرس پیش‌فرض ارسال
              </label>
            </div>
            <div className="md:col-span-2 flex gap-3">
              <Button type="submit" loading={saveMutation.isPending}>{editingAddress ? 'بروزرسانی' : 'ذخیره'}</Button>
              <Button type="button" variant="outline" onClick={resetForm}>انصراف</Button>
            </div>
          </form>
        </div>
      )}

      {/* Addresses List */}
      {addresses?.length === 0 && !showForm ? (
        <div className="text-center py-16 bg-surface rounded-card shadow-card">
          <MdiMapMarkerOff className="text-text-muted mx-auto mb-4" width={64} />
          <p className="text-text-secondary">هیچ آدرسی ثبت نشده</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses?.map((address) => (
            <div key={address.id} className="bg-surface rounded-card shadow-card p-6 relative">
              <div className="absolute top-3 left-3 flex gap-1">
                <button onClick={() => handleEdit(address)} className="p-2 hover:bg-primary-light rounded-button text-primary">
                  <LucidePencil className="w-4 h-4" />
                </button>
                <button onClick={() => deleteMutation.mutate(address.id)} className="p-2 hover:bg-error-light rounded-button text-error">
                  <LucideTrash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="font-bold text-text-primary mb-1">{address.full_name}</p>
              <p className="text-text-secondary text-sm">{address.phone}</p>
              <p className="text-text-secondary text-sm mt-2">
                {address.state}، {address.city}
              </p>
              <p className="text-text-secondary text-sm">{address.address_line_1}</p>
              <p className="text-text-muted text-xs mt-2">کد پستی: {address.postal_code}</p>
              <div className="flex gap-2 mt-3">
                {address.is_default_shipping && (
                  <span className="bg-primary-light text-primary text-xs px-2 py-1 rounded-full">ارسال پیش‌فرض</span>
                )}
                {address.is_default_billing && (
                  <span className="bg-success-light text-success text-xs px-2 py-1 rounded-full">صورتحساب پیش‌فرض</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}