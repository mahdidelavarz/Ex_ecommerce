// src/app/orders/[id]/page.tsx
"use client";

import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useOrder, useCancelOrder } from "@/modules/orders/hooks/useOrders";
import { formatPrice } from "@/utils/formatPrice";
import { useQuery } from "@tanstack/react-query";
import { paymentService } from "@/modules/payment/services/payment.service";
import ShipmentTimeline from "@/modules/shipments/components/ShipmentTimeline";
import { useShipments } from "@/modules/shipments/hooks/useShipments";
import { MdiClipboardTextOff, MdiCheckCircle, SvgSpinnersRingResize } from "@/components/icons/Icons";
import toast from "react-hot-toast";

const statusLabels: Record<string, string> = {
  pending: "در انتظار",
  confirmed: "تایید شده",
  processing: "در حال پردازش",
  shipped: "ارسال شده",
  delivered: "تحویل شده",
  cancelled: "لغو شده",
  returned: "مرجوع شده",
};

const statusColors: Record<string, string> = {
  pending: "bg-warning-light text-warning",
  confirmed: "bg-info-light text-info",
  processing: "bg-info-light text-info",
  shipped: "bg-primary-light text-primary",
  delivered: "bg-success-light text-success",
  cancelled: "bg-error-light text-error",
  returned: "bg-error-light text-error",
};

const paymentStatusLabels: Record<string, string> = {
  pending: "در انتظار پرداخت",
  partially_paid: "پرداخت جزئی",
  paid: "پرداخت شده",
  refunded: "مسترد شده",
  failed: "ناموفق",
};

export default function OrderDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const paymentResult = searchParams.get('payment');
  const orderId = params.id as string;
  const { data: order, isLoading } = useOrder(orderId);
  const cancelOrder = useCancelOrder();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetryPayment = async () => {
    if (!order) return;
    setIsRetrying(true);
    try {
      const { gateway_url } = await paymentService.initiate(order.id);
      window.location.href = gateway_url;
    } catch (err: any) {
      setIsRetrying(false);
      toast.error(err.response?.data?.message || 'خطا در پردازش پرداخت');
    }
  };

  const { data: payments } = useQuery({
    queryKey: ["payments", orderId],
    queryFn: () => paymentService.findByOrder(orderId),
  });

  const { data: shipments, isLoading: shipmentsLoading } = useShipments(orderId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <SvgSpinnersRingResize
          className="animate-spin text-primary"
          width={48}
        />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <MdiClipboardTextOff
            className="text-text-muted mx-auto mb-4"
            width={64}
          />
          <h1 className="text-xl font-bold text-text-primary">
            سفارش یافت نشد
          </h1>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Payment result banners */}
        {paymentResult === 'success' && (
          <div className="bg-success-light border border-success/30 rounded-card p-4 mb-6 flex items-center gap-3">
            <MdiCheckCircle className="text-success shrink-0" width={24} />
            <span className="text-success font-medium">پرداخت شما با موفقیت انجام شد. سفارش تأیید شد.</span>
          </div>
        )}
        {paymentResult === 'cancelled' && (
          <div className="bg-error-light border border-error/30 rounded-card p-4 mb-6 flex items-center justify-between gap-3">
            <span className="text-error font-medium">پرداخت لغو شد. می‌توانید مجدداً تلاش کنید.</span>
            <button
              onClick={handleRetryPayment}
              disabled={isRetrying}
              className="shrink-0 px-4 py-2 text-sm font-medium bg-primary text-white rounded-button hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isRetrying ? 'در حال انتقال...' : 'پرداخت مجدد'}
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              سفارش {order.order_number}
            </h1>
            <p className="text-text-secondary text-sm mt-1">
              {new Date(order.created_at).toLocaleDateString("fa-IR")}
            </p>
          </div>
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium ${statusColors[order.order_status]}`}
          >
            {statusLabels[order.order_status]}
          </span>
        </div>

        {/* Status Timeline */}
        <div className="bg-surface rounded-card shadow-card p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-sm text-text-muted">وضعیت سفارش</p>
              <p className="font-medium text-text-primary mt-1">
                {statusLabels[order.order_status]}
              </p>
            </div>
            <div>
              <p className="text-sm text-text-muted">وضعیت پرداخت</p>
              <p className="font-medium text-text-primary mt-1">
                {paymentStatusLabels[order.payment_status]}
              </p>
            </div>
            <div>
              <p className="text-sm text-text-muted">مبلغ کل</p>
              <p className="font-bold text-text-primary mt-1">
                {formatPrice(order.total_amount)}
              </p>
            </div>
            <div>
              <p className="text-sm text-text-muted">تعداد اقلام</p>
              <p className="font-medium text-text-primary mt-1">
                {order.items?.length || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="bg-surface rounded-card shadow-card p-6 mb-6">
          <h2 className="font-bold text-text-primary mb-4">اقلام سفارش</h2>
          <div className="divide-y divide-border">
            {order.items?.map((item) => (
              <div key={item.id} className="flex items-center gap-4 py-4">
                <div className="flex-1">
                  <p className="font-medium text-text-primary">
                    {item.product_title}
                  </p>
                  <p className="text-sm text-text-muted">کد: {item.sku}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-text-secondary">
                    {item.quantity} عدد
                  </p>
                </div>
                <div className="text-left min-w-[120px]">
                  <p className="font-medium">
                    {formatPrice(item.total_amount)}
                  </p>
                  <p className="text-xs text-text-muted">
                    {formatPrice(item.unit_price)} هر عدد
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Price Summary */}
        <div className="bg-surface rounded-card shadow-card p-6 mb-6">
          <h2 className="font-bold text-text-primary mb-4">جزئیات پرداخت</h2>
          <div className="space-y-2 text-sm max-w-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">جمع اقلام:</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-success">
                <span>تخفیف:</span>
                <span>-{formatPrice(order.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-text-secondary">هزینه ارسال:</span>
              <span>{formatPrice(order.shipping_amount)}</span>
            </div>
            <hr className="border-border" />
            <div className="flex justify-between font-bold text-base">
              <span>مبلغ نهایی:</span>
              <span>{formatPrice(order.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-surface rounded-card shadow-card p-6 mb-6">
          <h2 className="font-bold text-text-primary mb-4">آدرس ارسال</h2>
          <p className="font-medium">
            {order.shipping_address_snapshot?.full_name}
          </p>
          <p className="text-text-secondary text-sm">
            {order.shipping_address_snapshot?.phone}
          </p>
          <p className="text-text-secondary text-sm mt-1">
            {order.shipping_address_snapshot?.state}،{" "}
            {order.shipping_address_snapshot?.city}،{" "}
            {order.shipping_address_snapshot?.address_line_1}
          </p>
        </div>

        {payments && payments.length > 0 && (
          <div className="bg-surface rounded-card shadow-card p-6 mb-6">
            <h2 className="font-bold text-text-primary mb-4">پرداخت‌ها</h2>
            <div className="space-y-3">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between bg-surface-raised rounded-card p-4"
                >
                  <div>
                    <p className="font-medium text-text-primary">
                      {payment.provider}
                    </p>
                    <p className="text-xs text-text-muted">{payment.method}</p>
                    {payment.transaction_id && (
                      <code className="text-xs bg-surface px-2 py-0.5 rounded mt-1 inline-block">
                        {payment.transaction_id}
                      </code>
                    )}
                  </div>
                  <div className="text-left">
                    <p className="font-bold">{formatPrice(payment.amount)}</p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        payment.status === "completed"
                          ? "bg-success-light text-success"
                          : payment.status === "failed"
                            ? "bg-error-light text-error"
                            : "bg-warning-light text-warning"
                      }`}
                    >
                      {payment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SHP-F4: always show shipments section with empty/loading state */}
        <div className="bg-surface rounded-card shadow-card p-6 mb-6">
          <h2 className="font-bold text-text-primary mb-4">پیگیری ارسال</h2>
          {shipmentsLoading ? (
            <p className="text-sm text-text-muted text-center py-4">در حال بارگذاری...</p>
          ) : (
            <ShipmentTimeline shipments={shipments ?? []} />
          )}
        </div>

        {/* Cancel Button */}
        {["pending", "confirmed"].includes(order.order_status) && (
          <div className="bg-surface rounded-card shadow-card p-6 text-center">
            {showCancelConfirm ? (
              <div>
                <p className="text-text-secondary text-sm mb-4">آیا از لغو این سفارش اطمینان دارید؟ این عملیات قابل برگشت نیست.</p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="px-6 py-2 text-sm font-medium border border-border rounded-button hover:bg-surface-raised transition-colors"
                  >
                    انصراف
                  </button>
                  <button
                    onClick={() => { cancelOrder.mutate(order.id); setShowCancelConfirm(false); }}
                    disabled={cancelOrder.isPending}
                    className="px-6 py-2 text-sm font-medium bg-error text-white rounded-button hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {cancelOrder.isPending ? 'در حال لغو...' : 'تأیید لغو سفارش'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="text-error hover:text-red-700 text-sm font-medium"
              >
                لغو سفارش
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
