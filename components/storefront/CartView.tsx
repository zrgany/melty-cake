"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatCurrency } from "@/lib/utils";
import { EMPTY_STATES } from "@/lib/constants";
import EmptyState from "@/components/storefront/EmptyState";

export default function CartView() {
  const { items, removeItem, updateQuantity, subtotalEstimate } = useCart();

  if (items.length === 0) {
    return (
      <EmptyState
        message={EMPTY_STATES.cart}
        icon="🛒"
        action={
          <Link href="/#categories" className="btn-primary">
            تصفح القائمة
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.clientId} className="card-surface flex gap-3 p-3">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-blush">
              {item.productImage ? (
                <Image src={item.productImage} alt={item.productName} fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-2xl">🍰</div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-ink">{item.productName}</h3>
                <button
                  onClick={() => removeItem(item.clientId)}
                  className="text-ink-2/50 hover:text-berry"
                  aria-label="حذف من السلة"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              {item.selectedOptions.length > 0 && (
                <p className="mt-0.5 text-xs text-ink-2/70">
                  {item.selectedOptions.map((o) => o.valueLabel).join(" · ")}
                </p>
              )}
              {item.cakeMessage && <p className="mt-0.5 text-xs text-ink-2/70">العبارة: {item.cakeMessage}</p>}
              {item.note && <p className="mt-0.5 text-xs text-ink-2/70">ملاحظة: {item.note}</p>}

              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.clientId, item.quantity - 1)}
                    className="grid h-7 w-7 place-items-center rounded-full border border-line text-ink hover:bg-blush"
                    aria-label="إنقاص الكمية"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-5 text-center text-sm font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.clientId, item.quantity + 1)}
                    className="grid h-7 w-7 place-items-center rounded-full border border-line text-ink hover:bg-blush"
                    aria-label="زيادة الكمية"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <p className="text-sm font-semibold text-caramel-dark">
                  {formatCurrency(item.unitPriceEstimate * item.quantity)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card-surface mt-6 space-y-2 p-4">
        <div className="flex justify-between text-sm text-ink-2">
          <span>المجموع الفرعي (تقديري)</span>
          <span>{formatCurrency(subtotalEstimate)}</span>
        </div>
        <p className="text-xs text-ink-2/60">رسوم التوصيل والخصومات تُحسب بدقة في صفحة إتمام الطلب.</p>
      </div>

      <Link href="/checkout" className="btn-primary mt-4 flex w-full items-center justify-center gap-2">
        <ShoppingBag size={18} /> إتمام الطلب
      </Link>
    </div>
  );
}
