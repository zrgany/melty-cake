"use client";

import { useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type Zone = { id: number; name: string; fee: number; minOrderAmount: number; isActive: boolean };

export default function DeliveryZonesManager({ initialZones }: { initialZones: Zone[] }) {
  const [zones, setZones] = useState(initialZones);
  const [name, setName] = useState("");
  const [fee, setFee] = useState(0);
  const [minOrderAmount, setMinOrderAmount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/delivery-zones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, fee, minOrderAmount, isActive: true, sortOrder: zones.length }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "حدث خطأ، حاول مرة أخرى.");
      } else {
        setZones((z) => [...z, data.zone]);
        setName("");
        setFee(0);
        setMinOrderAmount(0);
      }
    } catch {
      setError("حدث خطأ، حاول مرة أخرى.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(zone: Zone) {
    const res = await fetch(`/api/admin/delivery-zones/${zone.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...zone, isActive: !zone.isActive }),
    });
    if (res.ok) {
      const data = await res.json();
      setZones((zs) => zs.map((z) => (z.id === zone.id ? data.zone : z)));
    }
  }

  async function handleDelete(id: number) {
    const res = await fetch(`/api/admin/delivery-zones/${id}`, { method: "DELETE" });
    if (res.ok) {
      const data = await res.json();
      if (data.deleted) setZones((zs) => zs.filter((z) => z.id !== id));
      else setZones((zs) => zs.map((z) => (z.id === id ? { ...z, isActive: false } : z)));
    }
  }

  return (
    <div className="card-surface space-y-4 p-5">
      <h2 className="font-display text-lg font-semibold text-ink">مناطق التوصيل</h2>
      <p className="text-xs text-ink-2/60">بدون منطقة توصيل واحدة فعّالة على الأقل، لا يستطيع العملاء إكمال الطلب.</p>

      <div className="divide-y divide-line rounded-xl border border-line">
        {zones.map((zone) => (
          <div key={zone.id} className="flex flex-wrap items-center justify-between gap-2 p-3">
            <div>
              <p className="text-sm font-semibold text-ink">{zone.name}</p>
              <p className="text-xs text-ink-2/60">
                توصيل {formatCurrency(zone.fee)}
                {zone.minOrderAmount > 0 && ` — حد أدنى ${formatCurrency(zone.minOrderAmount)}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleActive(zone)}
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  zone.isActive ? "bg-emerald-50 text-emerald-700" : "bg-ink-2/10 text-ink-2"
                }`}
              >
                {zone.isActive ? "فعّالة" : "متوقفة"}
              </button>
              <button onClick={() => handleDelete(zone.id)} className="text-ink-2/40 hover:text-berry" aria-label="حذف">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {zones.length === 0 && <p className="p-4 text-center text-sm text-ink-2/60">لا توجد مناطق توصيل بعد.</p>}
      </div>

      <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-2">
        <div className="min-w-[140px] flex-1">
          <label className="mb-1 block text-xs font-medium text-ink-2">اسم المنطقة</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="مثال: مركز الدبس" />
        </div>
        <div className="w-28">
          <label className="mb-1 block text-xs font-medium text-ink-2">أجرة التوصيل</label>
          <input type="number" min={0} value={fee} onChange={(e) => setFee(Number(e.target.value))} className="input-field" />
        </div>
        <div className="w-32">
          <label className="mb-1 block text-xs font-medium text-ink-2">حد أدنى للطلب</label>
          <input
            type="number"
            min={0}
            value={minOrderAmount}
            onChange={(e) => setMinOrderAmount(Number(e.target.value))}
            className="input-field"
          />
        </div>
        <button type="submit" disabled={saving} className="btn-secondary">
          <Plus size={16} /> إضافة
        </button>
      </form>
      {error && <p className="text-xs text-berry">{error}</p>}
    </div>
  );
}
