// src/app/(admin)/admin/orders/[id]/page.tsx
"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import { useOrder } from "@/modules/orders/hooks/useOrders";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { shipmentService } from "@/modules/shipments/services/shipment.service";
import { orderService } from "@/modules/orders/services/order.service";
import { useAdminRoute } from "@/modules/auth/hooks/useAdminRoute";
import AdminSidebar from "@/components/layout/AdminSidebar";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/utils/formatPrice";
import { shipmentStatusLabels } from "@/modules/shipments/types/shipment.types";
import { paymentService } from "@/modules/payment/services/payment.service";
import { LucidePencil, LucidePlus } from "@/components/icons/Icons";

const statusLabels: Record<string, string> = {
  pending: "در انتظار",
  confirmed: "تایید شده",
  processing: "در حال پردازش",
  shipped: "ارسال شده",
  delivered: "تحویل شده",
  cancelled: "لغو شده",
  returned: "مرجوع شده",
};

const paymentStatusLabels: Record<string, string> = {
  pending: "در انتظار",
  processing: "در حال پردازش",
  completed: "تکمیل شده",
  failed: "ناموفق",
  refunded: "مسترد شده",
  partially_refunded: "مسترد جزئی",
  cancelled: "لغو شده",
};

export default function AdminOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  const queryClient = useQueryClient();
  const { isLoading: isAuthLoading } = useAdminRoute();

  const { data: order, isLoading } = useOrder(orderId);
  const { data: payments } = useQuery({
    queryKey: ["payments", orderId],
    queryFn: () => paymentService.findByOrder(orderId),
    enabled: !!orderId,
  });
  const { data: shipments } = useQuery({
    queryKey: ["shipments", orderId],
    queryFn: () => shipmentService.findByOrder(orderId),
    enabled: !!orderId,
  });

  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showShipmentForm, setShowShipmentForm] = useState(false);
  const [showStatusForm, setShowStatusForm] = useState(false);

  const [paymentForm, setPaymentForm] = useState({
    provider: "درگاه پرداخت",
    method: "آنلاین",
    amount: order?.total_amount || 0,
  });
  const [shipmentForm, setShipmentForm] = useState({
    courier_name: "پست",
    tracking_number: "",
    tracking_url: "",
  });
  // بالای کامپوننت، statusForm رو any بذار:
  const [statusForm, setStatusForm] = useState<any>({
    order_status: order?.order_status || "pending",
    payment_status: order?.payment_status || "pending",
    fulfillment_status: order?.fulfillment_status || "unfulfilled",
    admin_note: "",
  });

  const handleAddPayment = async () => {
    try {
      await paymentService.create({ order_id: orderId, ...paymentForm });
      toast.success("پرداخت ثبت شد");
      setShowPaymentForm(false);
      queryClient.invalidateQueries({ queryKey: ["payments", orderId] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "خطا");
    }
  };

  const handleAddShipment = async () => {
    try {
      await shipmentService.create({
        order_id: orderId,
        courier_name: shipmentForm.courier_name,
        tracking_number: shipmentForm.tracking_number,
        tracking_url: shipmentForm.tracking_url || undefined,
      });
      toast.success("ارسال ثبت شد");
      setShowShipmentForm(false);
      queryClient.invalidateQueries({ queryKey: ["shipments", orderId] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "خطا");
    }
  };

  const handleUpdateStatus = async () => {
    try {
      await orderService.updateStatus(orderId, statusForm);
      toast.success("وضعیت بروزرسانی شد");
      setShowStatusForm(false);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "خطا");
    }
  };

  const handleUpdateShipment = async (shipmentId: string, status: string) => {
    try {
      await shipmentService.update(shipmentId, { status });
      toast.success("وضعیت ارسال بروزرسانی شد");
      queryClient.invalidateQueries({ queryKey: ["shipments", orderId] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "خطا");
    }
  };

  if (isAuthLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Icon
          icon="mdi:loading"
          className="animate-spin text-primary"
          width={48}
        />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 lg:mr-64 p-8 text-center">
          <Icon
            icon="mdi:clipboard-text-off"
            className="text-text-muted mx-auto mb-4"
            width={64}
          />
          <h1 className="text-xl font-bold">سفارش یافت نشد</h1>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 lg:mr-64 p-4 lg:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/admin/orders")}
                className="p-2 hover:bg-surface-raised rounded-button"
              >
                <Icon icon="mdi:arrow-right" className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-text-primary">
                  سفارش {order.order_number}
                </h1>
                <p className="text-text-secondary text-sm">
                  {order.shipping_address_snapshot?.full_name} |{" "}
                  {order.customer_phone}
                </p>
              </div>
            </div>
            <Button onClick={() => setShowStatusForm(true)} icon={LucidePencil}>
              بروزرسانی وضعیت
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Info */}
            <div className="bg-surface rounded-card shadow-card p-6">
              <h2 className="font-bold text-text-primary mb-4">
                اطلاعات سفارش
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">وضعیت:</span>
                  <span>{statusLabels[order.order_status]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">پرداخت:</span>
                  <span>
                    {paymentStatusLabels[order.payment_status] ||
                      order.payment_status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">ارسال:</span>
                  <span>{order.fulfillment_status}</span>
                </div>
                <hr className="border-border" />
                <div className="flex justify-between">
                  <span className="text-text-muted">جمع:</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>تخفیف:</span>
                    <span>-{formatPrice(order.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-text-muted">ارسال:</span>
                  <span>{formatPrice(order.shipping_amount)}</span>
                </div>
                <div className="flex justify-between font-bold text-base">
                  <span>نهایی:</span>
                  <span>{formatPrice(order.total_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">پرداخت شده:</span>
                  <span>{formatPrice(order.paid_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">مانده:</span>
                  <span className="text-error font-medium">
                    {formatPrice(order.due_amount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-surface rounded-card shadow-card p-6">
              <h2 className="font-bold text-text-primary mb-4">
                اطلاعات مشتری
              </h2>
              <p className="font-medium">
                {order.shipping_address_snapshot?.full_name}
              </p>
              <p className="text-text-secondary text-sm">
                {order.shipping_address_snapshot?.phone}
              </p>
              <p className="text-text-secondary text-sm mt-2">
                {order.shipping_address_snapshot?.state}،{" "}
                {order.shipping_address_snapshot?.city}
              </p>
              <p className="text-text-secondary text-sm">
                {order.shipping_address_snapshot?.address_line_1}
              </p>
              {order.customer_note && (
                <div className="mt-4 bg-warning-light text-warning p-3 rounded text-sm">
                  {order.customer_note}
                </div>
              )}
              {order.admin_note && (
                <div className="mt-2 bg-info-light text-info p-3 rounded text-sm">
                  یادداشت: {order.admin_note}
                </div>
              )}
            </div>

            {/* Payments */}
            <div className="bg-surface rounded-card shadow-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-text-primary">پرداخت‌ها</h2>
                <Button
                  size="sm"
                  onClick={() => setShowPaymentForm(true)}
                  icon={LucidePlus}
                >
                  افزودن
                </Button>
              </div>
              {!payments || payments.length === 0 ? (
                <p className="text-text-muted text-sm">پرداختی ثبت نشده</p>
              ) : (
                <div className="space-y-2">
                  {payments.map((p) => (
                    <div
                      key={p.id}
                      className="flex justify-between bg-surface-raised p-3 rounded text-sm"
                    >
                      <div>
                        <span className="font-medium">{p.provider}</span>
                        <span className="text-text-muted mr-2">{p.method}</span>
                        {p.transaction_id && (
                          <code className="block text-xs mt-1">
                            {p.transaction_id}
                          </code>
                        )}
                      </div>
                      <div className="text-left">
                        <span className="font-bold">
                          {formatPrice(p.amount)}
                        </span>
                        <span
                          className={`block text-xs px-2 py-0.5 rounded-full mt-1 text-center ${
                            p.status === "completed"
                              ? "bg-success-light text-success"
                              : p.status === "failed"
                                ? "bg-error-light text-error"
                                : "bg-warning-light text-warning"
                          }`}
                        >
                          {paymentStatusLabels[p.status] || p.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Shipments */}
            <div className="bg-surface rounded-card shadow-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-text-primary">ارسال‌ها</h2>
                <Button
                  size="sm"
                  onClick={() => setShowShipmentForm(true)}
                  icon={LucidePlus}
                >
                  افزودن
                </Button>
              </div>
              {!shipments || shipments.length === 0 ? (
                <p className="text-text-muted text-sm">ارسالی ثبت نشده</p>
              ) : (
                <div className="space-y-2">
                  {shipments.map((s) => (
                    <div
                      key={s.id}
                      className="bg-surface-raised p-3 rounded text-sm"
                    >
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">{s.courier_name}</span>
                        <select
                          value={s.status}
                          onChange={(e) =>
                            handleUpdateShipment(s.id, e.target.value)
                          }
                          className="text-xs px-2 py-1 rounded border border-border bg-surface"
                        >
                          {Object.entries(shipmentStatusLabels).map(
                            ([key, label]) => (
                              <option key={key} value={key}>
                                {label}
                              </option>
                            ),
                          )}
                        </select>
                      </div>
                      <code className="text-xs bg-surface px-2 py-0.5 rounded">
                        {s.tracking_number}
                      </code>
                      {s.tracking_url && (
                        <a
                          href={s.tracking_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-primary text-xs mt-1"
                        >
                          پیگیری
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Items */}
            <div className="lg:col-span-2 bg-surface rounded-card shadow-card p-6">
              <h2 className="font-bold text-text-primary mb-4">اقلام سفارش</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-text-muted">
                    <th className="text-right py-2">محصول</th>
                    <th className="text-center py-2">کد</th>
                    <th className="text-center py-2">تعداد</th>
                    <th className="text-center py-2">فی</th>
                    <th className="text-center py-2">جمع</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item) => (
                    <tr key={item.id} className="border-b border-border">
                      <td className="py-3 font-medium">{item.product_title}</td>
                      <td className="text-center text-text-muted text-xs">
                        {item.sku}
                      </td>
                      <td className="text-center">{item.quantity}</td>
                      <td className="text-center">
                        {formatPrice(item.unit_price)}
                      </td>
                      <td className="text-center font-medium">
                        {formatPrice(item.total_amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modals */}
          {showPaymentForm && (
            <Modal onClose={() => setShowPaymentForm(false)} title="ثبت پرداخت">
              <input
                value={paymentForm.provider}
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, provider: e.target.value })
                }
                placeholder="درگاه"
                className="w-full px-3 py-2 border rounded-input text-sm mb-3"
              />
              <input
                value={paymentForm.method}
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, method: e.target.value })
                }
                placeholder="روش پرداخت"
                className="w-full px-3 py-2 border rounded-input text-sm mb-3"
              />
              <input
                type="number"
                value={paymentForm.amount}
                onChange={(e) =>
                  setPaymentForm({
                    ...paymentForm,
                    amount: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="مبلغ (تومان)"
                className="w-full px-3 py-2 border rounded-input text-sm mb-3"
              />
              <div className="flex gap-2">
                <Button onClick={handleAddPayment} className="flex-1">
                  ثبت
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowPaymentForm(false)}
                >
                  انصراف
                </Button>
              </div>
            </Modal>
          )}

          {showShipmentForm && (
            <Modal onClose={() => setShowShipmentForm(false)} title="ثبت ارسال">
              <select
                value={shipmentForm.courier_name}
                onChange={(e) =>
                  setShipmentForm({
                    ...shipmentForm,
                    courier_name: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded-input text-sm mb-3"
              >
                <option value="پست">پست</option>
                <option value="تیپاکس">تیپاکس</option>
                <option value="پیک">پیک</option>
              </select>
              <input
                value={shipmentForm.tracking_number}
                onChange={(e) =>
                  setShipmentForm({
                    ...shipmentForm,
                    tracking_number: e.target.value,
                  })
                }
                placeholder="کد پیگیری *"
                className="w-full px-3 py-2 border rounded-input text-sm mb-3"
              />
              <input
                value={shipmentForm.tracking_url}
                onChange={(e) =>
                  setShipmentForm({
                    ...shipmentForm,
                    tracking_url: e.target.value,
                  })
                }
                placeholder="لینک پیگیری"
                className="w-full px-3 py-2 border rounded-input text-sm mb-3"
              />
              <div className="flex gap-2">
                <Button onClick={handleAddShipment} className="flex-1">
                  ثبت
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowShipmentForm(false)}
                >
                  انصراف
                </Button>
              </div>
            </Modal>
          )}

          {showStatusForm && (
            <Modal
              onClose={() => setShowStatusForm(false)}
              title="بروزرسانی وضعیت"
            >
              <select
                value={statusForm.order_status}
                onChange={(e) =>
                  setStatusForm({ ...statusForm, order_status: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-input text-sm mb-3"
              >
                {Object.entries(statusLabels).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
              <select
                value={statusForm.payment_status}
                onChange={(e) =>
                  setStatusForm({
                    ...statusForm,
                    payment_status: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded-input text-sm mb-3"
              >
                <option value="pending">در انتظار</option>
                <option value="partially_paid">پرداخت جزئی</option>
                <option value="paid">پرداخت شده</option>
                <option value="refunded">مسترد شده</option>
                <option value="failed">ناموفق</option>
              </select>
              <select
                value={statusForm.fulfillment_status}
                onChange={(e) =>
                  setStatusForm({
                    ...statusForm,
                    fulfillment_status: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded-input text-sm mb-3"
              >
                <option value="unfulfilled">ارسال نشده</option>
                <option value="partially_fulfilled">ارسال جزئی</option>
                <option value="fulfilled">ارسال شده</option>
              </select>
              <textarea
                value={statusForm.admin_note}
                onChange={(e) =>
                  setStatusForm({ ...statusForm, admin_note: e.target.value })
                }
                placeholder="یادداشت ادمین"
                rows={2}
                className="w-full px-3 py-2 border rounded-input text-sm mb-3 resize-none"
              />
              <div className="flex gap-2">
                <Button onClick={handleUpdateStatus} className="flex-1">
                  ذخیره
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowStatusForm(false)}
                >
                  انصراف
                </Button>
              </div>
            </Modal>
          )}
        </div>
      </main>
    </div>
  );
}

function Modal({
  children,
  onClose,
  title,
}: {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-card shadow-modal p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-bold text-lg mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
}
