import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatCurrency, formatDateTime, formatOrderNumber, cn } from "@/lib/utils";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";
import type { OrderStatus } from "@/lib/constants";

export const dynamic = "force-dynamic";

const FILTERS = [
  { key: "today", label: "اليوم" },
  { key: "yesterday", label: "أمس" },
  { key: "week", label: "هذا الأسبوع" },
  { key: "month", label: "هذا الشهر" },
  { key: "all", label: "الكل" },
];

function getDateRange(filter: string): { gte?: Date; lt?: Date } {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  switch (filter) {
    case "today":
      return { gte: startOfToday };
    case "yesterday": {
      const start = new Date(startOfToday);
      start.setDate(start.getDate() - 1);
      return { gte: start, lt: startOfToday };
    }
    case "week": {
      const start = new Date(startOfToday);
      start.setDate(start.getDate() - start.getDay());
      return { gte: start };
    }
    case "month":
      return { gte: new Date(now.getFullYear(), now.getMonth(), 1) };
    default:
      return {};
  }
}

export default async function AdminOrdersPage({ searchParams }: { searchParams: { filter?: string } }) {
  const filter = searchParams.filter || "today";
  const range = getDateRange(filter);

  const orders = await prisma.order.findMany({
    where: Object.keys(range).length > 0 ? { createdAt: range } : {},
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-ink">الطلبات</h1>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={`/admin/orders?filter=${f.key}`}
            className={cn("chip whitespace-nowrap", filter === f.key && "chip-active")}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="card-surface divide-y divide-line">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/admin/orders/${order.id}`}
            className="flex items-center justify-between gap-3 p-4 hover:bg-blush/40"
          >
            <div>
              <p className="text-sm font-semibold text-ink">
                {formatOrderNumber(order.id)} — {order.customerName}
              </p>
              <p className="text-xs text-ink-2/60">{formatDateTime(order.createdAt)}</p>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-sm font-semibold text-caramel-dark">{formatCurrency(order.total)}</p>
              <OrderStatusBadge status={order.status as OrderStatus} />
            </div>
          </Link>
        ))}
        {orders.length === 0 && <p className="p-6 text-center text-sm text-ink-2/60">لا توجد طلبات في هذه الفترة.</p>}
      </div>
    </div>
  );
}
