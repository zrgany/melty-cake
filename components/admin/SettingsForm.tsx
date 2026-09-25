"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type Settings = {
  name: string;
  logo: string;
  description: string;
  phone: string;
  whatsapp: string;
  secondPhone: string;
  instagramUrl: string;
  facebookUrl: string;
  address: string;
  workingHours: string;
  welcomeMessage: string;
  freeDeliveryThreshold: string;
};

export default function SettingsForm({ initial }: { initial: Settings }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function set<K extends keyof Settings>(key: K, value: Settings[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          logo: form.logo || null,
          description: form.description || null,
          phone: form.phone || null,
          whatsapp: form.whatsapp || null,
          secondPhone: form.secondPhone || null,
          instagramUrl: form.instagramUrl || null,
          facebookUrl: form.facebookUrl || null,
          address: form.address || null,
          workingHours: form.workingHours || null,
          welcomeMessage: form.welcomeMessage || null,
          freeDeliveryThreshold: form.freeDeliveryThreshold ? Number(form.freeDeliveryThreshold) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "حدث خطأ، حاول مرة أخرى." });
      } else {
        setMessage({ type: "success", text: "تم حفظ الإعدادات ✓" });
        router.refresh();
      }
    } catch {
      setMessage({ type: "error", text: "حدث خطأ، حاول مرة أخرى." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card-surface space-y-4 p-5">
      <h2 className="font-display text-lg font-semibold text-ink">معلومات المشروع</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">اسم المشروع</label>
          <input value={form.name} onChange={(e) => set("name", e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">رسالة الترحيب بالصفحة الرئيسية</label>
          <input
            value={form.welcomeMessage}
            onChange={(e) => set("welcomeMessage", e.target.value)}
            className="input-field"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">وصف مختصر</label>
        <textarea
          rows={2}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          className="input-field resize-none"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">رقم الهاتف</label>
          <input
            dir="ltr"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            className="input-field"
            placeholder="07xxxxxxxxx"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">رقم واتساب</label>
          <input
            dir="ltr"
            value={form.whatsapp}
            onChange={(e) => set("whatsapp", e.target.value)}
            className="input-field"
            placeholder="07xxxxxxxxx"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">رقم إضافي</label>
          <input dir="ltr" value={form.secondPhone} onChange={(e) => set("secondPhone", e.target.value)} className="input-field" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">رابط Instagram</label>
          <input dir="ltr" value={form.instagramUrl} onChange={(e) => set("instagramUrl", e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">رابط Facebook (إن وجد)</label>
          <input dir="ltr" value={form.facebookUrl} onChange={(e) => set("facebookUrl", e.target.value)} className="input-field" />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">عنوان المشروع</label>
        <input value={form.address} onChange={(e) => set("address", e.target.value)} className="input-field" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">ساعات العمل</label>
          <input
            value={form.workingHours}
            onChange={(e) => set("workingHours", e.target.value)}
            className="input-field"
            placeholder="مثال: يومياً 10 صباحاً - 11 مساءً"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">توصيل مجاني عند تجاوز (د.ع) — اختياري</label>
          <input
            type="number"
            min={0}
            value={form.freeDeliveryThreshold}
            onChange={(e) => set("freeDeliveryThreshold", e.target.value)}
            className="input-field"
          />
        </div>
      </div>

      {message && (
        <p
          className={`rounded-xl px-3 py-2 text-sm ${
            message.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-berry/10 text-berry"
          }`}
        >
          {message.text}
        </p>
      )}

      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? "جارٍ الحفظ..." : "حفظ الإعدادات"}
      </button>
    </form>
  );
}
