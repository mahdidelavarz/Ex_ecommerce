// src/app/checkout/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { useCart } from '@/modules/cart/hooks/useCart';
import { useCreateOrder } from '@/modules/orders/hooks/useOrders';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import Button from '@/components/ui/Button';
import { formatPrice } from '@/utils/formatPrice';
import { MdiStore } from '@/components/icons/Icons';

// Temporary - will be replaced with real address management
const tempAddress = {
  id: 'temp',
  full_name: 'کاربر تست',
  phone: '09123456789',
  address: 'تهران، خیابان ولیعصر',
};

export default function CheckoutPage() {
  const router = useRouter();
  const { cart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const createOrder = useCreateOrder();
  const [note, setNote] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [addressId] = useState('temp-address-id'); // Replace with real address selection

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16 text-center">
          <Icon icon="mdi:cart-off" className="text-text-muted mx-auto mb-4" width={80} />
          <h1 className="text-2xl font-bold text-text-primary mb-2">سبد خرید خالی است</h1>
          <p className="text-text-secondary mb-8">برای ثبت سفارش، ابتدا محصولی به سبد خرید اضافه کنید.</p>
          <Button onClick={() => router.push('/products')} icon={MdiStore}>
            مشاهده محصولات
          </Button>
        </div>
      </main>
    );
  }

  const handlePlaceOrder = () => {
    createOrder.mutate({
      shipping_address_id: addressId,
      billing_address_id: addressId,
      coupon_code: couponCode || undefined,
      customer_note: note || undefined,
    });
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-text-primary mb-8">تکمیل سفارش</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-surface rounded-card shadow-card p-6">
              <h2 className="font-bold text-text-primary mb-4">آدرس ارسال</h2>
              <div className="bg-surface-raised rounded-card p-4">
                <p className="font-medium">{tempAddress.full_name}</p>
                <p className="text-text-secondary text-sm mt-1">{tempAddress.phone}</p>
                <p className="text-text-secondary text-sm mt-1">{tempAddress.address}</p>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-surface rounded-card shadow-card p-6">
              <h2 className="font-bold text-text-primary mb-4">محصولات سفارش</h2>
              <div className="divide-y divide-border">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex gap-4 py-4">
                    <img
                      src={item.variant.image || ''}
                      alt={item.variant.product?.title}
                      className="w-16 h-16 rounded-lg object-cover bg-surface-raised"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-text-primary">{item.variant.product?.title}</p>
                      <div className="flex gap-1 mt-1">
                        {item.variant.attributes?.map((attr, i) => (
                          <span key={i} className="text-xs text-text-muted bg-surface-raised px-1.5 py-0.5 rounded">
                            {attr.value}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{formatPrice(item.variant.price * item.quantity)}</p>
                      <p className="text-xs text-text-muted">تعداد: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Note */}
            <div className="bg-surface rounded-card shadow-card p-6">
              <h2 className="font-bold text-text-primary mb-4">یادداشت سفارش</h2>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="توضیحات اضافی برای سفارش..."
                rows={3}
                className="w-full px-4 py-2 bg-surface border border-border rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-surface rounded-card shadow-card p-6 sticky top-24">
              <h2 className="font-bold text-text-primary mb-6">خلاصه سفارش</h2>

              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-text-secondary">جمع سبد خرید:</span>
                  <span>{formatPrice(cart.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">هزینه ارسال:</span>
                  <span>{formatPrice(50000)}</span>
                </div>
                <hr className="border-border" />
                <div className="flex justify-between text-lg font-bold">
                  <span>مبلغ قابل پرداخت:</span>
                  <span>{formatPrice(cart.subtotal + 50000)}</span>
                </div>
              </div>

              {/* Coupon */}
              <div className="mb-6">
                <label className="text-sm font-medium text-text-secondary block mb-2">کد تخفیف</label>
                <div className="flex gap-2">
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="کد تخفیف"
                    className="flex-1 px-3 py-2 bg-surface border border-border rounded-input text-sm uppercase focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <Button
                onClick={handlePlaceOrder}
                loading={createOrder.isPending}
                className="w-full"
                size="lg"
              >
                ثبت سفارش
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}