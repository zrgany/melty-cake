"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, GripVertical } from "lucide-react";

type OptionValueForm = { id?: number; label: string; price: number; isDefault: boolean };
type OptionGroupForm = {
  id?: number;
  name: string;
  type: "SINGLE" | "MULTI";
  priceMode: "OVERRIDE" | "DELTA";
  isRequired: boolean;
  values: OptionValueForm[];
};

export type ProductFormInitial = {
  name: string;
  description: string;
  basePrice: number;
  categoryId: number;
  isFeatured: boolean;
  isBestSeller: boolean;
  isAvailable: boolean;
  allowCakeMessage: boolean;
  sortOrder: number;
  optionGroups: OptionGroupForm[];
};

const emptyValue = (): OptionValueForm => ({ label: "", price: 0, isDefault: false });
const emptyGroup = (): OptionGroupForm => ({
  name: "",
  type: "SINGLE",
  priceMode: "DELTA",
  isRequired: true,
  values: [emptyValue()],
});

export default function ProductForm({
  categories,
  productId,
  initial,
}: {
  categories: { id: number; name: string }[];
  productId?: number;
  initial?: ProductFormInitial;
}) {
  const router = useRouter();

  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [basePrice, setBasePrice] = useState(initial?.basePrice ?? 0);
  const [categoryId, setCategoryId] = useState<number | "">(initial?.categoryId ?? categories[0]?.id ?? "");
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false);
  const [isBestSeller, setIsBestSeller] = useState(initial?.isBestSeller ?? false);
  const [isAvailable, setIsAvailable] = useState(initial?.isAvailable ?? true);
  const [allowCakeMessage, setAllowCakeMessage] = useState(initial?.allowCakeMessage ?? false);
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? 0);
  const [optionGroups, setOptionGroups] = useState<OptionGroupForm[]>(initial?.optionGroups ?? []);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateGroup(index: number, patch: Partial<OptionGroupForm>) {
    setOptionGroups((groups) => groups.map((g, i) => (i === index ? { ...g, ...patch } : g)));
  }
  function updateValue(groupIndex: number, valueIndex: number, patch: Partial<OptionValueForm>) {
    setOptionGroups((groups) =>
      groups.map((g, i) =>
        i !== groupIndex ? g : { ...g, values: g.values.map((v, vi) => (vi === valueIndex ? { ...v, ...patch } : v)) }
      )
    );
  }
  function addGroup() {
    setOptionGroups((groups) => [...groups, emptyGroup()]);
  }
  function removeGroup(index: number) {
    setOptionGroups((groups) => groups.filter((_, i) => i !== index));
  }
  function addValue(groupIndex: number) {
    setOptionGroups((groups) =>
      groups.map((g, i) => (i === groupIndex ? { ...g, values: [...g.values, emptyValue()] } : g))
    );
  }
  function removeValue(groupIndex: number, valueIndex: number) {
    setOptionGroups((groups) =>
      groups.map((g, i) => (i === groupIndex ? { ...g, values: g.values.filter((_, vi) => vi !== valueIndex) } : g))
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!categoryId) {
      setError("يرجى اختيار التصنيف.");
      return;
    }
    for (const g of optionGroups) {
      if (!g.name.trim()) {
        setError("يرجى تسمية كل مجموعة خيارات.");
        return;
      }
      if (g.values.length === 0 || g.values.some((v) => !v.label.trim())) {
        setError(`مجموعة "${g.name}" تحتاج قيمة واحدة على الأقل بعنوان.`);
        return;
      }
    }

    setSaving(true);
    const payload = {
      name,
      description: description || null,
      basePrice: Number(basePrice),
      categoryId: Number(categoryId),
      isFeatured,
      isBestSeller,
      isAvailable,
      allowCakeMessage,
      sortOrder: Number(sortOrder),
      optionGroups: optionGroups.map((g) => ({
        ...(g.id ? { id: g.id } : {}),
        name: g.name,
        type: g.type,
        priceMode: g.priceMode,
        isRequired: g.isRequired,
        sortOrder: 0,
        values: g.values.map((v) => ({
          ...(v.id ? { id: v.id } : {}),
          label: v.label,
          price: Number(v.price),
          isDefault: v.isDefault,
          sortOrder: 0,
        })),
      })),
    };

    try {
      const url = productId ? `/api/admin/products/${productId}` : "/api/admin/products";
      const method = productId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "حدث خطأ، حاول مرة أخرى.");
        setSaving(false);
        return;
      }
      if (productId) {
        router.refresh();
        setSaving(false);
      } else {
        router.push(`/admin/products/${data.product.id}`);
      }
    } catch {
      setError("حدث خطأ، حاول مرة أخرى.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="card-surface space-y-4 p-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">اسم المنتج</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">الوصف</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-field resize-none"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">السعر الأساسي (د.ع)</label>
            <input
              required
              type="number"
              min={0}
              value={basePrice}
              onChange={(e) => setBasePrice(Number(e.target.value))}
              className="input-field"
            />
            <p className="mt-1 text-xs text-ink-2/60">
              إذا وُجدت مجموعة خيارات من نوع "تحدد السعر" (مثل الحجم)، فسعرها هو المُعتمد بدل هذا الرقم.
            </p>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">التصنيف</label>
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="input-field"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm text-ink-2">
            <input
              type="checkbox"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
              className="h-4 w-4 rounded border-line accent-caramel"
            />
            متوفر
          </label>
          <label className="flex items-center gap-2 text-sm text-ink-2">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="h-4 w-4 rounded border-line accent-caramel"
            />
            مميز
          </label>
          <label className="flex items-center gap-2 text-sm text-ink-2">
            <input
              type="checkbox"
              checked={isBestSeller}
              onChange={(e) => setIsBestSeller(e.target.checked)}
              className="h-4 w-4 rounded border-line accent-caramel"
            />
            الأكثر طلباً
          </label>
          <label className="flex items-center gap-2 text-sm text-ink-2">
            <input
              type="checkbox"
              checked={allowCakeMessage}
              onChange={(e) => setAllowCakeMessage(e.target.checked)}
              className="h-4 w-4 rounded border-line accent-caramel"
            />
            يسمح بكتابة عبارة على الكيك
          </label>
        </div>
      </div>

      <div className="card-surface space-y-5 p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">مجموعات الخيارات (الحجم، النكهة...)</h2>
          <button type="button" onClick={addGroup} className="btn-secondary text-xs">
            <Plus size={14} /> إضافة مجموعة
          </button>
        </div>

        {optionGroups.length === 0 && (
          <p className="text-sm text-ink-2/60">لا توجد خيارات إضافية لهذا المنتج (سعر ثابت واحد فقط).</p>
        )}

        {optionGroups.map((group, gi) => (
          <div key={gi} className="rounded-2xl border border-line p-4">
            <div className="mb-3 flex items-start gap-3">
              <GripVertical size={18} className="mt-2.5 shrink-0 text-ink-2/30" />
              <div className="grid flex-1 gap-3 sm:grid-cols-2">
                <input
                  placeholder="اسم المجموعة (مثال: الحجم)"
                  value={group.name}
                  onChange={(e) => updateGroup(gi, { name: e.target.value })}
                  className="input-field"
                />
                <div className="flex gap-2">
                  <select
                    value={group.priceMode}
                    onChange={(e) => updateGroup(gi, { priceMode: e.target.value === "OVERRIDE" ? "OVERRIDE" : "DELTA" })}
                    className="input-field"
                  >
                    <option value="DELTA">يُضاف على السعر</option>
                    <option value="OVERRIDE">يحدد السعر</option>
                  </select>
                  <select
                    value={group.type}
                    onChange={(e) => updateGroup(gi, { type: e.target.value === "MULTI" ? "MULTI" : "SINGLE" })}
                    className="input-field"
                  >
                    <option value="SINGLE">اختيار واحد</option>
                    <option value="MULTI">عدة اختيارات</option>
                  </select>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeGroup(gi)}
                className="mt-2 shrink-0 text-ink-2/50 hover:text-berry"
                aria-label="حذف المجموعة"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <label className="mb-3 flex items-center gap-2 text-xs text-ink-2">
              <input
                type="checkbox"
                checked={group.isRequired}
                onChange={(e) => updateGroup(gi, { isRequired: e.target.checked })}
                className="h-4 w-4 rounded border-line accent-caramel"
              />
              مطلوب (يجب على العميل الاختيار)
            </label>

            <div className="space-y-2">
              {group.values.map((v, vi) => (
                <div key={vi} className="flex items-center gap-2">
                  <input
                    placeholder="القيمة (مثال: كبير)"
                    value={v.label}
                    onChange={(e) => updateValue(gi, vi, { label: e.target.value })}
                    className="input-field"
                  />
                  <input
                    type="number"
                    placeholder="السعر"
                    value={v.price}
                    onChange={(e) => updateValue(gi, vi, { price: Number(e.target.value) })}
                    className="input-field w-28"
                  />
                  <label className="flex shrink-0 items-center gap-1 text-xs text-ink-2">
                    <input
                      type="checkbox"
                      checked={v.isDefault}
                      onChange={(e) => updateValue(gi, vi, { isDefault: e.target.checked })}
                      className="h-4 w-4 rounded border-line accent-caramel"
                    />
                    افتراضي
                  </label>
                  <button
                    type="button"
                    onClick={() => removeValue(gi, vi)}
                    className="shrink-0 text-ink-2/40 hover:text-berry"
                    aria-label="حذف القيمة"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => addValue(gi)} className="btn-ghost text-xs">
                <Plus size={14} /> إضافة قيمة
              </button>
            </div>
          </div>
        ))}
      </div>

      {error && <p className="rounded-xl bg-berry/10 px-3 py-2 text-sm text-berry">{error}</p>}

      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? "جارٍ الحفظ..." : productId ? "حفظ التعديلات" : "إضافة المنتج"}
      </button>
    </form>
  );
}
