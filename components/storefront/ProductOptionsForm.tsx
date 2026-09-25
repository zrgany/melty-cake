"use client";

import { useMemo, useState } from "react";
import { Minus, Plus, ShoppingBag, Check } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatCurrency, cn } from "@/lib/utils";
import { ERROR_MESSAGES } from "@/lib/constants";

type OptionValue = {
  id: number;
  label: string;
  description: string | null;
  price: number;
  isDefault: boolean;
};
type OptionGroup = {
  id: number;
  name: string;
  type: "SINGLE" | "MULTI";
  priceMode: "OVERRIDE" | "DELTA";
  isRequired: boolean;
  values: OptionValue[];
};
type Product = {
  id: number;
  slug: string;
  name: string;
  basePrice: number;
  allowCakeMessage: boolean;
  isAvailable: boolean;
  optionGroups: OptionGroup[];
  image: string | null;
};

export default function ProductOptionsForm({ product }: { product: Product }) {
  const { addItem } = useCart();

  const initialSelection: Record<number, number[]> = {};
  for (const group of product.optionGroups) {
    if (group.type === "SINGLE") {
      const def = group.values.find((v) => v.isDefault) ?? (group.isRequired ? group.values[0] : undefined);
      initialSelection[group.id] = def ? [def.id] : [];
    } else {
      initialSelection[group.id] = group.values.filter((v) => v.isDefault).map((v) => v.id);
    }
  }

  const [selection, setSelection] = useState<Record<number, number[]>>(initialSelection);
  const [quantity, setQuantity] = useState(1);
  const [cakeMessage, setCakeMessage] = useState("");
  const [note, setNote] = useState("");
  const [justAdded, setJustAdded] = useState(false);

  function toggleValue(group: OptionGroup, valueId: number) {
    setSelection((prev) => {
      const current = prev[group.id] ?? [];
      if (group.type === "SINGLE") return { ...prev, [group.id]: [valueId] };
      const exists = current.includes(valueId);
      return { ...prev, [group.id]: exists ? current.filter((id) => id !== valueId) : [...current, valueId] };
    });
  }

  const { unitPrice, missingRequired } = useMemo(() => {
    let price = product.basePrice;
    const missing: string[] = [];

    for (const group of product.optionGroups) {
      const chosenIds = selection[group.id] ?? [];
      if (group.isRequired && chosenIds.length === 0) missing.push(group.name);
      if (group.priceMode !== "OVERRIDE") continue;
      const chosenValues = group.values.filter((v) => chosenIds.includes(v.id));
      if (chosenValues.length > 0) price = chosenValues[chosenValues.length - 1].price;
    }
    for (const group of product.optionGroups) {
      if (group.priceMode !== "DELTA") continue;
      const chosenIds = selection[group.id] ?? [];
      for (const v of group.values.filter((val) => chosenIds.includes(val.id))) price += v.price;
    }

    return { unitPrice: price, missingRequired: missing };
  }, [selection, product]);

  function handleAddToCart() {
    if (missingRequired.length > 0) return;

    const selectedOptions = product.optionGroups.flatMap((group) => {
      const chosenIds = selection[group.id] ?? [];
      return group.values
        .filter((v) => chosenIds.includes(v.id))
        .map((v) => ({
          groupId: group.id,
          groupName: group.name,
          valueId: v.id,
          valueLabel: v.label,
          price: group.priceMode === "DELTA" ? v.price : 0,
        }));
    });

    addItem({
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      productImage: product.image,
      unitPriceEstimate: unitPrice,
      quantity,
      selectedOptions,
      cakeMessage: product.allowCakeMessage ? cakeMessage.trim() || null : null,
      note: note.trim() || null,
    });

    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  }

  if (!product.isAvailable) {
    return <div className="rounded-2xl bg-blush/60 p-4 text-sm text-berry-dark">{ERROR_MESSAGES.productUnavailable}</div>;
  }

  return (
    <div className="space-y-6">
      {product.optionGroups.map((group) => (
        <div key={group.id}>
          <h3 className="mb-2 text-sm font-semibold text-ink">
            {group.name} {group.isRequired && <span className="text-berry">*</span>}
          </h3>
          <div className="flex flex-wrap gap-2">
            {group.values.map((v) => {
              const active = (selection[group.id] ?? []).includes(v.id);
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => toggleValue(group, v.id)}
                  title={v.description ?? undefined}
                  className={cn(
                    "rounded-2xl border px-4 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "border-caramel bg-caramel text-cream"
                      : "border-line bg-white text-ink-2 hover:border-caramel/50"
                  )}
                >
                  {v.label}
                  {group.priceMode === "DELTA" && v.price > 0 && (
                    <span className="mr-1 text-xs opacity-80">(+{formatCurrency(v.price)})</span>
                  )}
                  {group.priceMode === "OVERRIDE" && (
                    <span className="mr-1 text-xs opacity-80">({formatCurrency(v.price)})</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {product.allowCakeMessage && (
        <div>
          <label className="mb-2 block text-sm font-semibold text-ink">اكتب العبارة التي تريدها على الكيك</label>
          <input
            type="text"
            maxLength={60}
            value={cakeMessage}
            onChange={(e) => setCakeMessage(e.target.value)}
            placeholder="مثال: كل عام وأنت بخير"
            className="input-field"
          />
          {cakeMessage.trim() && (
            <div className="mt-2 rounded-xl border border-dashed border-caramel/40 bg-blush/40 px-4 py-3 text-center font-display text-lg text-ink">
              {cakeMessage}
            </div>
          )}
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-semibold text-ink">ملاحظات (اختياري)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={200}
          rows={2}
          placeholder="أي طلب خاص؟"
          className="input-field resize-none"
        />
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-line p-2">
        <span className="px-2 text-sm font-medium text-ink-2">الكمية</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="grid h-9 w-9 place-items-center rounded-full border border-line text-ink hover:bg-blush"
            aria-label="إنقاص الكمية"
          >
            <Minus size={16} />
          </button>
          <span className="w-6 text-center font-semibold text-ink">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(50, q + 1))}
            className="grid h-9 w-9 place-items-center rounded-full border border-line text-ink hover:bg-blush"
            aria-label="زيادة الكمية"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="sticky bottom-20 z-10 flex items-center justify-between gap-4 rounded-2xl border border-line bg-white/95 p-4 shadow-soft backdrop-blur md:static md:shadow-none">
        <div>
          <p className="text-xs text-ink-2/70">الإجمالي</p>
          <p className="font-display text-xl font-bold text-caramel-dark">{formatCurrency(unitPrice * quantity)}</p>
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={missingRequired.length > 0}
          className="btn-primary flex-1 md:flex-none md:px-10"
        >
          {justAdded ? (
            <>
              <Check size={18} /> أُضيف للسلة
            </>
          ) : (
            <>
              <ShoppingBag size={18} /> أضف للسلة
            </>
          )}
        </button>
      </div>
      {missingRequired.length > 0 && <p className="text-xs text-berry">يرجى اختيار: {missingRequired.join("، ")}</p>}
    </div>
  );
}
