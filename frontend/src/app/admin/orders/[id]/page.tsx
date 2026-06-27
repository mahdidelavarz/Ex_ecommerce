// src/app/(admin)/admin/orders/[id]/page.tsx
"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import { useOrder } from "@/modules/orders/hooks/useOrders";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { shipmentService } from "@/modules/shipments/services/shipment.service";
import { orderService } from "@/modules/orders/services/order.service";
import { useAdminRoute } from "@/modules/auth/hooks/useAdminRoute";
import AdminPage from "@/components/layout/AdminPage";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Modal,
  PageHeader,
  Select,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TRow,
  Textarea,
} from "@/components/ui";
import { formatPrice } from "@/utils/formatPrice";
import { orderStatusBadge } from "@/utils/statusBadge";
import { shipmentStatusLabels, type ShipmentStatus } from "@/modules/shipments/types/shipment.types";
import { paymentService } from "@/modules/payment/services/payment.service";
import { LucidePencil, LucidePlus, MdiClipboardTextOff } from "@/components/icons/Icons";

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

  const [paymentForm, setPaymentForm] = useState<{
    provider: string;
    method: string;
    amount: number | "";
  }>({
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
      await paymentService.create({
        order_id: orderId,
        ...paymentForm,
        amount: paymentForm.amount === "" ? 0 : paymentForm.amount,
      });
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

  const handleUpdateShipment = async (shipmentId: string, status: ShipmentStatus) => {
    try {
      await shipmentService.update(shipmentId, { status });
      toast.success("وضعیت ارسال بروزرسانی شد");
      queryClient.invalidateQueries({ queryKey: ["shipments", orderId] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "خطا");
    }
  };

  // Not found (after loading resolves)
  if (!isAuthLoading && !isLoading && !order) {
    return (
      <AdminPage
        maxWidth="5xl"
        header={<PageHeader title="سفارش" onBack={() => router.push("/admin/orders")} />}
      >
        <EmptyState icon={MdiClipboardTextOff} title="سفارش یافت نشد" />
      </AdminPage>
    );
  }

  return (
    <AdminPage
      maxWidth="5xl"
      loading={isAuthLoading || isLoading}
      header={
        <PageHeader
          title={`سفارش ${order?.order_number ?? ""}`}
          subtitle={`${order?.shipping_address_snapshot?.full_name ?? ""} | ${order?.customer_phone ?? ""}`}
          onBack={() => router.push("/admin/orders")}
          action={{ label: "بروزرسانی وضعیت", icon: LucidePencil, onClick: () => setShowStatusForm(true) }}
        >
          {order && (
            <Badge variant={orderStatusBadge(order.order_status).variant}>
              {orderStatusBadge(order.order_status).label}
            </Badge>
          )}
        </PageHeader>
      }
    >
      {order && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Info */}
            <Card className="p-6">
              <h2 className="font-bold text-text-primary mb-4">اطلاعات سفارش</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-text-muted">وضعیت:</span>
                  <Badge variant={orderStatusBadge(order.order_status).variant} size="sm">
                    {orderStatusBadge(order.order_status).label}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">پرداخت:</span>
                  <span>
                    {paymentStatusLabels[order.payment_status] || order.payment_status}
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
                  <span className="text-error font-medium">{formatPrice(order.due_amount)}</span>
                </div>
              </div>
            </Card>

            {/* Customer Info */}
            <Card className="p-6">
              <h2 className="font-bold text-text-primary mb-4">اطلاعات مشتری</h2>
              <p className="font-medium">{order.shipping_address_snapshot?.full_name}</p>
              <p className="text-text-secondary text-sm">{order.shipping_address_snapshot?.phone}</p>
              <p className="text-text-secondary text-sm mt-2">
                {order.shipping_address_snapshot?.state}، {order.shipping_address_snapshot?.city}
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
            </Card>

            {/* Payments */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-text-primary">پرداخت‌ها</h2>
                <Button size="sm" onClick={() => setShowPaymentForm(true)} icon={LucidePlus}>
                  افزودن
                </Button>
              </div>
              {!payments || payments.length === 0 ? (
                <p className="text-text-muted text-sm">پرداختی ثبت نشده</p>
              ) : (
                <div className="space-y-2">
                  {payments.map((p) => (
                    <div key={p.id} className="flex justify-between bg-surface-raised p-3 rounded text-sm">
                      <div>
                        <span className="font-medium">{p.provider}</span>
                        <span className="text-text-muted mr-2">{p.method}</span>
                        {p.transaction_id && (
                          <code className="block text-xs mt-1">{p.transaction_id}</code>
                        )}
                      </div>
                      <div className="text-left">
                        <span className="font-bold">{formatPrice(p.amount)}</span>
                        <div className="mt-1">
                          <Badge
                            variant={
                              p.status === "completed"
                                ? "success"
                                : p.status === "failed"
                                  ? "error"
                                  : "warning"
                            }
                            size="sm"
                          >
                            {paymentStatusLabels[p.status] || p.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Shipments */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-text-primary">ارسال‌ها</h2>
                <Button size="sm" onClick={() => setShowShipmentForm(true)} icon={LucidePlus}>
                  افزودن
                </Button>
              </div>
              {!shipments || shipments.length === 0 ? (
                <p className="text-text-muted text-sm">ارسالی ثبت نشده</p>
              ) : (
                <div className="space-y-2">
                  {shipments.map((s) => (
                    <div key={s.id} className="bg-surface-raised p-3 rounded text-sm">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">{s.courier_name}</span>
                        <select
                          value={s.status}
                          onChange={(e) =>
                            handleUpdateShipment(s.id, e.target.value as ShipmentStatus)
                          }
                          className="text-xs px-2 py-1 rounded border border-border bg-surface cursor-pointer"
                        >
                          {Object.entries(shipmentStatusLabels).map(([key, label]) => (
                            <option key={key} value={key}>
                              {label}
                            </option>
                          ))}
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
            </Card>

            {/* Items */}
            <Card className="lg:col-span-2 p-6">
              <h2 className="font-bold text-text-primary mb-4">اقلام سفارش</h2>
              <Table className="text-sm">
                <THead>
                  <TH align="right">محصول</TH>
                  <TH align="center">کد</TH>
                  <TH align="center">تعداد</TH>
                  <TH align="center">فی</TH>
                  <TH align="center">جمع</TH>
                </THead>
                <TBody>
                  {order.items?.map((item) => (
                    <TRow key={item.id}>
                      <TD align="right" label="محصول" className="font-medium">{item.product_title}</TD>
                      <TD align="center" label="کد" className="text-text-muted text-xs">{item.sku}</TD>
                      <TD align="center" label="تعداد">{item.quantity}</TD>
                      <TD align="center" label="فی">{formatPrice(item.unit_price)}</TD>
                      <TD align="center" label="جمع" className="font-medium">{formatPrice(item.total_amount)}</TD>
                    </TRow>
                  ))}
                </TBody>
              </Table>
            </Card>
          </div>

          {/* Modals */}
          <Modal
            open={showPaymentForm}
            onClose={() => setShowPaymentForm(false)}
            title="ثبت پرداخت"
            footer={
              <>
                <Button variant="outline" onClick={() => setShowPaymentForm(false)}>انصراف</Button>
                <Button onClick={handleAddPayment}>ثبت</Button>
              </>
            }
          >
            <div className="space-y-3">
              <Input
                value={paymentForm.provider}
                onChange={(e) => setPaymentForm({ ...paymentForm, provider: e.target.value })}
                placeholder="درگاه"
              />
              <Input
                value={paymentForm.method}
                onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                placeholder="روش پرداخت"
              />
              <Input
                type="number"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value === "" ? "" : parseInt(e.target.value) })}
                placeholder="مبلغ (تومان)"
              />
            </div>
          </Modal>

          <Modal
            open={showShipmentForm}
            onClose={() => setShowShipmentForm(false)}
            title="ثبت ارسال"
            footer={
              <>
                <Button variant="outline" onClick={() => setShowShipmentForm(false)}>انصراف</Button>
                <Button onClick={handleAddShipment}>ثبت</Button>
              </>
            }
          >
            <div className="space-y-3">
              <Select
                value={shipmentForm.courier_name}
                onChange={(e) => setShipmentForm({ ...shipmentForm, courier_name: e.target.value })}
                options={[
                  { value: 'پست', label: 'پست' },
                  { value: 'تیپاکس', label: 'تیپاکس' },
                  { value: 'پیک', label: 'پیک' },
                ]}
              />
              <Input
                value={shipmentForm.tracking_number}
                onChange={(e) => setShipmentForm({ ...shipmentForm, tracking_number: e.target.value })}
                placeholder="کد پیگیری *"
              />
              <Input
                value={shipmentForm.tracking_url}
                onChange={(e) => setShipmentForm({ ...shipmentForm, tracking_url: e.target.value })}
                placeholder="لینک پیگیری"
              />
            </div>
          </Modal>

          <Modal
            open={showStatusForm}
            onClose={() => setShowStatusForm(false)}
            title="بروزرسانی وضعیت"
            footer={
              <>
                <Button variant="outline" onClick={() => setShowStatusForm(false)}>انصراف</Button>
                <Button onClick={handleUpdateStatus}>ذخیره</Button>
              </>
            }
          >
            <div className="space-y-3">
              <Select
                value={statusForm.order_status}
                onChange={(e) => setStatusForm({ ...statusForm, order_status: e.target.value })}
                options={Object.entries(statusLabels).map(([value, label]) => ({ value, label }))}
              />
              <Select
                value={statusForm.payment_status}
                onChange={(e) => setStatusForm({ ...statusForm, payment_status: e.target.value })}
                options={[
                  { value: 'pending', label: 'در انتظار' },
                  { value: 'partially_paid', label: 'پرداخت جزئی' },
                  { value: 'paid', label: 'پرداخت شده' },
                  { value: 'refunded', label: 'مسترد شده' },
                  { value: 'failed', label: 'ناموفق' },
                ]}
              />
              <Select
                value={statusForm.fulfillment_status}
                onChange={(e) => setStatusForm({ ...statusForm, fulfillment_status: e.target.value })}
                options={[
                  { value: 'unfulfilled', label: 'ارسال نشده' },
                  { value: 'partially_fulfilled', label: 'ارسال جزئی' },
                  { value: 'fulfilled', label: 'ارسال شده' },
                ]}
              />
              <Textarea
                value={statusForm.admin_note}
                onChange={(e) => setStatusForm({ ...statusForm, admin_note: e.target.value })}
                placeholder="یادداشت ادمین"
                rows={2}
              />
            </div>
          </Modal>
        </>
      )}
    </AdminPage>
  );
}
