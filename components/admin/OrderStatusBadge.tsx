import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/constants";
import { cn } from "@/lib/utils";

const COLORS: Record<OrderStatus, string> = {
  RECEIVED: "bg-blue-50 text-blue-700",
  PREPARING: "bg-amber-50 text-amber-700",
  READY: "bg-purple-50 text-purple-700",
  OUT_FOR_DELIVERY: "bg-caramel/10 text-caramel-dark",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-berry/10 text-berry",
};

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold", COLORS[status])}>
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
