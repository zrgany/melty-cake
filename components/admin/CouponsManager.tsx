"use client";

import { useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type Coupon = {
  id: number;
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minOrderAmount: number;
  isActive: boolean;
  usedCount: number;
  usageLimit: number | null;
};

export default function CouponsManager({ initialCoupons }: { initialCoupons: Coupon[] }) {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [code, setCode] = useState("");
  const [type, setType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [value, setValue] = useState(10);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, type, value, minOrderAmount: 0, isActive: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "حدث خطأ، حاول مرة أخرى.");
      } else {
        setCoupons((c) => [data.coupon, ...c]);
        setCode("");
        setValue(10);
      }
    } catch {
      setError("حدث خطأ، حاول مرة أخرى.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(coupon: Coupon) {
    const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...coupon, isActive: !coupon.isActive }),
    });
    if (res.ok) {
      const data = await res.json();
      setCoupons((cs) => cs.map((c) => (c.id === coupon.id ? data.coupon : c)));
    }
  }

  async function handleDelete(id: number) {
    const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    if (res.ok) setCoupons((cs) => cs.filter((c) => c.id !== id));
  }

  return (
    <div className="card-surface space-y-4 p-5">
      <h2 className="font-display text-lg font-semibold text-ink">الكوبونات</h2>

      <div className="divide-y divide-line rounded-xl border border-line">
        {coupons.map((c) => (
          <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 p-3">
            <div>
              <p className="text-sm font-semibold text-ink" dir="ltr">
                {c.code}
              </p>
              <p className="text-xs text-ink-2/60">
                {c.type === "PERCENTAGE" ? `خصم ${c.value}%` : `خصم ${formatCurrency(c.value)}`}
                {c.usageLimit ? ` — استُخدم ${c.usedCount}/${c.usageLimit}` : ` — استُخدم ${c.usedCount} مرة`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleActive(c)}
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  c.isActive ? "bg-emerald-50 text-emerald-700" : "bg-ink-2/10 text-ink-2"
                }`}
              >
                {c.isActive ? "فعّال" : "متوقف"}
              </button>
              <button onClick={() => handleDelete(c.id)} className="text-ink-2/40 hover:text-berry" aria-label="حذف">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {coupons.length === 0 && <p className="p-4 text-center text-sm text-ink-2/60">لا توجد كوبونات بعد.</p>}
      </div>

      <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-2">
        <div className="min-w-[120px] flex-1">
          <label className="mb-1 block text-xs font-medium text-ink-2">الرمز</label>
          <input
            dir="ltr"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="input-field"
            placeholder="MELTY10"
          />
        </div>
        <div className="w-32">
          <label className="mb-1 block text-xs font-medium text-ink-2">النوع</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value === "FIXED" ? "FIXED" : "PERCENTAGE")}
            className="input-field"
          >
            <option value="PERCENTAGE">نسبة %</option>
            <option value="FIXED">مبلغ ثابت</option>
          </select>
        </div>
        <div className="w-28">
          <label className="mb-1 block text-xs font-medium text-ink-2">القيمة</label>
          <input type="number" min={1} value={value} onChange={(e) => setValue(Number(e.target.value))} className="input-field" />
        </div>
        <button type="submit" disabled={saving} className="btn-secondary">
          <Plus size={16} /> إضافة
        </button>
      </form>
      {error && <p className="text-xs text-berry">{error}</p>}
    </div>
  );
}
