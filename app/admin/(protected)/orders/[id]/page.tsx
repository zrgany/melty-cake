import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatCurrency, formatDateTime, formatOrderNumber } from "@/lib/utils";
import OrderStatusUpdater from "@/components/admin/OrderStatusUpdater";
import type { OrderStatus } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: Number(params.id) },
    include: { items: true, deliveryZone: true, coupon: true },
  });

  if (!order) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink">{formatOrderNumber(order.id)}</h1>
        <a href={`tel:${order.customerPhone}`} className="btn-secondary text-xs">
          اتصال بالعميل
        </a>
      </div>

      <div className="card-surface mb-4 p-5">
        <OrderStatusUpdater orderId={order.id} currentStatus={order.status as OrderStatus} />
      </div>

      <div className="card-surface mb-4 space-y-1.5 p-5 text-sm text-ink-2">
        <p className="font-semibold text-ink">بيانات العميل</p>
        <p>
          {order.customerName} — {order.customerPhone}
        </p>
        {(order.governorate || order.district) && (
          <p>{[order.governorate, order.district].filter(Boolean).join(" - ")}</p>
        )}
        <p>{order.detailedAddress}</p>
        {order.deliveryNotes && <p>ملاحظات: {order.deliveryNotes}</p>}
        <p className="pt-1 text-xs text-ink-2/50">تم الطلب في {formatDateTime(order.createdAt)}</p>
      </div>

      <div className="card-surface mb-4 divide-y divide-line">
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
              {item.cakeMessage && <p className="mt-0.5 text-xs text-ink-2/70">العبارة على الكيك: {item.cakeMessage}</p>}
              {item.note && <p className="mt-0.5 text-xs text-ink-2/70">ملاحظة: {item.note}</p>}
            </div>
            <p className="shrink-0 text-sm font-semibold text-ink">{formatCurrency(item.lineTotal)}</p>
          </div>
        ))}
      </div>

      <div className="card-surface space-y-2 p-5 text-sm">
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
            <span>الخصم{order.coupon ? ` (${order.coupon.code})` : ""}</span>
            <span>-{formatCurrency(order.discount)}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-line pt-2 text-base font-bold text-ink">
          <span>الإجمالي</span>
          <span>{formatCurrency(order.total)}</span>
        </div>
      </div>
    </div>
  );
}
