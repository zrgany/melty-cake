import { prisma } from "@/lib/db";
import StatCard from "@/components/admin/StatCard";
import { formatCurrency } from "@/lib/utils";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/constants";

export const dynamic = "force-dynamic";

const STATUS_ORDER: OrderStatus[] = ["RECEIVED", "PREPARING", "READY", "OUT_FOR_DELIVERY", "COMPLETED", "CANCELLED"];
const WEEKDAY_SHORT = ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function AdminDashboardPage() {
  const todayStart = startOfToday();
  const sevenDaysAgo = new Date(todayStart);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const [todayOrders, statusGroups, avgAgg, customerGroups, topItems, recentOrders] = await Promise.all([
    prisma.order.findMany({ where: { createdAt: { gte: todayStart } }, select: { total: true } }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.order.aggregate({ where: { status: { not: "CANCELLED" } }, _avg: { total: true } }),
    prisma.order.groupBy({ by: ["customerPhone"] }),
    prisma.orderItem.groupBy({
      by: ["productName"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: sevenDaysAgo }, status: { not: "CANCELLED" } },
      select: { createdAt: true, total: true },
    }),
  ]);

  const todaySales = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const statusCounts: Record<string, number> = {};
  for (const g of statusGroups) statusCounts[g.status] = g._count._all;

  // تجميع مبيعات آخر 7 أيام في الكود (بدل SQL خام) لضمان الصحة عبر أي قاعدة بيانات
  const dayBuckets: { date: Date; total: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(todayStart);
    d.setDate(d.getDate() - i);
    dayBuckets.push({ date: d, total: 0 });
  }
  for (const order of recentOrders) {
    const orderDay = new Date(order.createdAt);
    orderDay.setHours(0, 0, 0, 0);
    const bucket = dayBuckets.find((b) => b.date.getTime() === orderDay.getTime());
    if (bucket) bucket.total += order.total;
  }
  const maxRevenue = Math.max(1, ...dayBuckets.map((b) => b.total));

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-ink">لوحة التحكم</h1>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="طلبات اليوم" value={String(todayOrders.length)} />
        <StatCard label="مبيعات اليوم" value={formatCurrency(todaySales)} />
        <StatCard label="عدد العملاء" value={String(customerGroups.length)} />
        <StatCard label="متوسط قيمة الطلب" value={formatCurrency(Math.round(avgAgg._avg.total || 0))} />
      </div>

      <h2 className="mb-3 mt-8 font-display text-lg font-semibold text-ink">حالات الطلبات</h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {STATUS_ORDER.map((s) => (
          <StatCard key={s} label={ORDER_STATUS_LABELS[s]} value={String(statusCounts[s] || 0)} />
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card-surface p-5">
          <h2 className="mb-4 font-display text-lg font-semibold text-ink">المبيعات — آخر 7 أيام</h2>
          {maxRevenue <= 1 && dayBuckets.every((b) => b.total === 0) ? (
            <p className="text-sm text-ink-2/60">لا توجد بيانات كافية بعد.</p>
          ) : (
            <div className="flex h-40 items-end gap-2">
              {dayBuckets.map((b) => (
                <div key={b.date.toISOString()} className="flex flex-1 flex-col items-center gap-1.5">
                  <div
                    className="w-full rounded-t-md bg-caramel"
                    style={{ height: `${Math.max(4, (b.total / maxRevenue) * 100)}%` }}
                    title={formatCurrency(b.total)}
                  />
                  <span className="text-[10px] text-ink-2/60">{WEEKDAY_SHORT[b.date.getDay()]}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card-surface p-5">
          <h2 className="mb-4 font-display text-lg font-semibold text-ink">الأكثر طلباً</h2>
          {topItems.length === 0 ? (
            <p className="text-sm text-ink-2/60">لا توجد طلبات بعد.</p>
          ) : (
            <ul className="space-y-3">
              {topItems.map((item, i) => (
                <li key={item.productName} className="flex items-center justify-between text-sm">
                  <span className="text-ink">
                    {i + 1}. {item.productName}
                  </span>
                  <span className="font-semibold text-caramel-dark">{item._sum.quantity} قطعة</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
