// src/app/checkout/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/modules/cart/hooks/useCart';
import { useCreateOrder } from '@/modules/orders/hooks/useOrders';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { paymentService } from '@/modules/payment/services/payment.service';
import { useAddresses, useCreateAddress } from '@/modules/auth/hooks/useAddresses';
import { couponService } from '@/modules/coupons/services/coupon.service';
import type { CouponValidation } from '@/modules/coupons/types/coupon.types';
import Button from '@/components/ui/Button';
import { formatPrice } from '@/utils/formatPrice';
import { MdiCartOff, MdiStore } from '@/components/icons/Icons';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart } = useCart();
  const { isAuthenticated } = useAuth();
  const createOrder = useCreateOrder();
  const { data: addresses, isLoading: addressesLoading } = useAddresses();
  const createAddress = useCreateAddress();

  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    full_name: '', phone: '', state: '', city: '',
    address_line_1: '', address_line_2: '', postal_code: '',
  });

  const [note, setNote] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponResult, setCouponResult] = useState<CouponValidation | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    if (addresses?.length && !selectedAddressId) {
      const def = addresses.find((a) => a.is_default_shipping) ?? addresses[0];
      setSelectedAddressId(def.id);
    }
    if (addresses?.length === 0) {
      setShowAddressForm(true);
    }
  }, [addresses]);

  const applyCoupon = async () => {
    if (!couponCode.trim() || !cart) return;
    setIsValidating(true);
    try {
      const productIds = cart.items.map((i) => i.variant.product?.id).filter(Boolean) as string[];
      const result = await couponService.validate({
        code: couponCode,
        cart_total: cart.subtotal,
        product_ids: productIds,
      });
      setCouponResult(result);
      toast.success(`کد تخفیف اعمال شد: ${formatPrice(result.discount_amount)} تومان`);
    } catch (err: any) {
      setCouponResult(null);
      toast.error(err.response?.data?.message || 'کد تخفیف نامعتبر است');
    } finally {
      setIsValidating(false);
    }
  };

  const removeCoupon = () => {
    setCouponResult(null);
    setCouponCode('');
  };

  const handleSaveAddress = async () => {
    try {
      const saved = await createAddress.mutateAsync({
        ...newAddress,
        country: 'IR',
        is_default_shipping: !addresses?.length,
      });
      setSelectedAddressId(saved.id);
      setShowAddressForm(false);
      setNewAddress({ full_name: '', phone: '', state: '', city: '', address_line_1: '', address_line_2: '', postal_code: '' });
    } catch {
      // error handled by hook
    }
  };

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16 text-center">
          <MdiCartOff className="text-text-muted mx-auto mb-4" width={80} />
          <h1 className="text-2xl font-bold text-text-primary mb-2">سبد خرید خالی است</h1>
          <p className="text-text-secondary mb-8">برای ثبت سفارش، ابتدا محصولی به سبد خرید اضافه کنید.</p>
          <Button onClick={() => router.push('/products')} icon={MdiStore}>مشاهده محصولات</Button>
        </div>
      </main>
    );
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error('لطفاً یک آدرس ارسال انتخاب کنید');
      return;
    }
    setIsCheckingOut(true);
    try {
      const order = await createOrder.mutateAsync({
        shipping_address_id: selectedAddressId,
        billing_address_id: selectedAddressId,
        coupon_code: couponResult ? couponCode : undefined,
        customer_note: note || undefined,
      });
      const { gateway_url } = await paymentService.initiate(order.id);
      window.location.href = gateway_url;
    } catch (err: any) {
      setIsCheckingOut(false);
      if (!createOrder.isError) {
        toast.error(err.response?.data?.message || 'خطا در پردازش پرداخت');
      }
    }
  };

  const discountAmount = couponResult?.discount_amount ?? 0;
  const totalAmount = Math.max(0, cart?.subtotal ?? 0) - discountAmount + 50000;

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-text-primary mb-8">تکمیل سفارش</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-surface rounded-card shadow-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-text-primary">آدرس ارسال</h2>
                <button
                  onClick={() => setShowAddressForm((v) => !v)}
                  className="text-sm text-primary hover:underline"
                >
                  + آدرس جدید
                </button>
              </div>

              {addressesLoading ? (
                <div className="space-y-2">
                  {[1, 2].map((i) => <div key={i} className="h-16 bg-surface-raised rounded-card animate-pulse-soft" />)}
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses?.map((addr) => (
                    <label
                      key={addr.id}
                      className={`flex items-start gap-3 p-4 rounded-card border-2 cursor-pointer transition-colors ${
                        selectedAddressId === addr.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={addr.id}
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="mt-1 accent-primary"
                      />
                      <div className="flex-1 text-sm">
                        <p className="font-medium text-text-primary">{addr.full_name}</p>
                        <p className="text-text-secondary mt-0.5">{addr.phone}</p>
                        <p className="text-text-muted mt-0.5">
                          {addr.state}، {addr.city}، {addr.address_line_1}
                          {addr.address_line_2 ? `، ${addr.address_line_2}` : ''} — {addr.postal_code}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {showAddressForm && (
                <div className="mt-4 p-4 bg-surface-raised rounded-card space-y-3">
                  <h3 className="text-sm font-semibold text-text-primary">آدرس جدید</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <input value={newAddress.full_name} onChange={(e) => setNewAddress((s) => ({ ...s, full_name: e.target.value }))}
                      placeholder="نام و نام خانوادگی *" className="col-span-2 px-3 py-2 bg-surface border border-border rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    <input value={newAddress.phone} onChange={(e) => setNewAddress((s) => ({ ...s, phone: e.target.value }))}
                      placeholder="شماره تلفن *" className="px-3 py-2 bg-surface border border-border rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    <input value={newAddress.postal_code} onChange={(e) => setNewAddress((s) => ({ ...s, postal_code: e.target.value }))}
                      placeholder="کد پستی *" className="px-3 py-2 bg-surface border border-border rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    <input value={newAddress.state} onChange={(e) => setNewAddress((s) => ({ ...s, state: e.target.value }))}
                      placeholder="استان *" className="px-3 py-2 bg-surface border border-border rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    <input value={newAddress.city} onChange={(e) => setNewAddress((s) => ({ ...s, city: e.target.value }))}
                      placeholder="شهر *" className="px-3 py-2 bg-surface border border-border rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    <input value={newAddress.address_line_1} onChange={(e) => setNewAddress((s) => ({ ...s, address_line_1: e.target.value }))}
                      placeholder="آدرس *" className="col-span-2 px-3 py-2 bg-surface border border-border rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    <input value={newAddress.address_line_2} onChange={(e) => setNewAddress((s) => ({ ...s, address_line_2: e.target.value }))}
                      placeholder="واحد / طبقه (اختیاری)" className="col-span-2 px-3 py-2 bg-surface border border-border rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={() => setShowAddressForm(false)}>انصراف</Button>
                    <Button size="sm" loading={createAddress.isPending} onClick={handleSaveAddress}>ذخیره آدرس</Button>
                  </div>
                </div>
              )}
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
                          <span key={i} className="text-xs text-text-muted bg-surface-raised px-1.5 py-0.5 rounded">{attr.value}</span>
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
                {discountAmount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>تخفیف ({couponResult?.coupon?.code}):</span>
                    <span>- {formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-text-secondary">هزینه ارسال:</span>
                  <span>
                    {couponResult?.coupon?.type === 'free_shipping'
                      ? <span className="text-success line-through">{formatPrice(50000)}</span>
                      : formatPrice(50000)}
                  </span>
                </div>
                <hr className="border-border" />
                <div className="flex justify-between text-lg font-bold">
                  <span>مبلغ قابل پرداخت:</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>
              </div>

              {/* Coupon */}
              <div className="mb-6">
                <label className="text-sm font-medium text-text-secondary block mb-2">کد تخفیف</label>
                {couponResult ? (
                  <div className="flex items-center justify-between bg-success-light rounded-input px-3 py-2">
                    <span className="text-sm text-success font-medium">{couponCode}</span>
                    <button onClick={removeCoupon} className="text-xs text-error hover:underline">حذف</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="کد تخفیف"
                      className="flex-1 px-3 py-2 bg-surface border border-border rounded-input text-sm uppercase focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Button type="button" variant="outline" onClick={applyCoupon} loading={isValidating} disabled={!couponCode.trim()}>
                      اعمال
                    </Button>
                  </div>
                )}
              </div>

              <Button
                onClick={handlePlaceOrder}
                loading={isCheckingOut}
                disabled={!selectedAddressId}
                className="w-full"
                size="lg"
              >
                ثبت و پرداخت سفارش
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
