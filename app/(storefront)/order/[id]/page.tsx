import { notFound } from "next/navigation";
import { CheckCircle2, Circle, XCircle } from "lucide-react";
import { prisma } from "@/lib/db";
import { getCurrentCustomer } from "@/lib/auth";
import { formatCurrency, formatDateTime, formatOrderNumber } from "@/lib/utils";
import { ORDER_STATUS_FLOW, ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function OrderTrackingPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { token?: string };
}) {
  const orderId = Number(params.id);
  if (!Number.isInteger(orderId)) notFound();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, deliveryZone: true },
  });
  if (!order) notFound();

  // الوصول مسموح فقط لصاحب الحساب (userId مطابق) أو لمن يملك رمز المتابعة الصحيح (طلب ضيف)
  // هذا يمنع أي شخص من تصفح الطلبات بالتخمين عبر تغيير الرقم في الرابط
  const customer = await getCurrentCustomer();
  const isOwner = Boolean(customer && order.userId === customer.id);
  const hasValidToken = Boolean(searchParams.token && searchParams.token === order.trackingToken);
  if (!isOwner && !hasValidToken) notFound();

  const status = order.status as OrderStatus;
  const isCancelled = status === "CANCELLED";
  const currentStepIndex = ORDER_STATUS_FLOW.indexOf(status as (typeof ORDER_STATUS_FLOW)[number]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs text-ink-2/70">طلب رقم</p>
          <h1 className="font-display text-2xl font-bold text-ink">{formatOrderNumber(order.id)}</h1>
        </div>
        <span
          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
            isCancelled ? "bg-berry/10 text-berry" : "bg-caramel/10 text-caramel-dark"
          }`}
        >
          {ORDER_STATUS_LABELS[status]}
        </span>
      </div>

      {!isCancelled && (
        <div className="card-surface mb-6 p-5">
          <ol className="space-y-4">
            {ORDER_STATUS_FLOW.map((step, i) => {
              const done = i <= currentStepIndex;
              return (
                <li key={step} className="flex items-center gap-3">
                  {done ? (
                    <CheckCircle2 size={20} className="shrink-0 text-caramel" />
                  ) : (
                    <Circle size={20} className="shrink-0 text-ink-2/30" />
                  )}
                  <span className={done ? "text-sm font-medium text-ink" : "text-sm text-ink-2/50"}>
                    {ORDER_STATUS_LABELS[step]}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {isCancelled && (
        <div className="card-surface mb-6 flex items-center gap-3 p-5">
          <XCircle size={20} className="text-berry" />
          <span className="text-sm font-medium text-ink">تم إلغاء هذا الطلب</span>
        </div>
      )}

      <div className="card-surface mb-6 divide-y divide-line">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-3 p-4">
            <div>
              <p className="text-sm font-semibold text-ink">
                {item.quantity} × {item.productName}
              </p>
              {Array.isArray(item.selectedOptions) && item.selectedOptions.length > 0 && (
                <p className="mt-0.5 text-xs text-ink-2/70">
                  {(item.selectedOptions as { valueLabel: string }[]).map((o) => o.valueLabel).join(" · ")}
                </p>
              )}
              {item.cakeMessage && <p className="mt-0.5 text-xs text-ink-2/70">العبارة: {item.cakeMessage}</p>}
            </div>
            <p className="shrink-0 text-sm font-semibold text-ink">{formatCurrency(item.lineTotal)}</p>
          </div>
        ))}
      </div>

      <div className="card-surface mb-6 space-y-2 p-5 text-sm">
        <div className="flex justify-between text-ink-2">
          <span>المجموع الفرعي</span>
          <span>{formatCurrency(order.subtotal)}</span>
        </div>
        <div className="flex justify-between text-ink-2">
          <span>التوصيل{order.deliveryZone ? ` (${order.deliveryZone.name})` : ""}</span>
          <span>{formatCurrency(order.deliveryFee)}</span>
        </div>
        {order.discount > 0 && (
          <div className="flex justify-between text-emerald-700">
            <span>الخصم</span>
            <span>-{formatCurrency(order.discount)}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-line pt-2 text-base font-bold text-ink">
          <span>الإجمالي</span>
          <span>{formatCurrency(order.total)}</span>
        </div>
      </div>

      <div className="card-surface space-y-1.5 p-5 text-sm text-ink-2">
        <p className="font-semibold text-ink">عنوان التوصيل</p>
        <p>
          {order.customerName} — {order.customerPhone}
        </p>
        <p>{order.detailedAddress}</p>
        {order.deliveryNotes && <p>ملاحظات: {order.deliveryNotes}</p>}
        <p className="pt-2 text-xs text-ink-2/60">تم الطلب في {formatDateTime(order.createdAt)}</p>
      </div>
    </div>
  );
}
