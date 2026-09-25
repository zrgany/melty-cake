"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ORDER_STATUS_OPTIONS, type OrderStatus } from "@/lib/constants";

export default function OrderStatusUpdater({
  orderId,
  currentStatus,
}: {
  orderId: number;
  currentStatus: OrderStatus;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(newStatus: OrderStatus) {
    const previous = status;
    setStatus(newStatus);
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "حدث خطأ، حاول مرة أخرى.");
        setStatus(previous);
      } else {
        router.refresh();
      }
    } catch {
      setError("حدث خطأ، حاول مرة أخرى.");
      setStatus(previous);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink">حالة الطلب</label>
      <select
        value={status}
        disabled={saving}
        onChange={(e) => handleChange(e.target.value as OrderStatus)}
        className="input-field"
      >
        {ORDER_STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-berry">{error}</p>}
    </div>
  );
}
