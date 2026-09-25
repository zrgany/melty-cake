"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { formatCurrency } from "@/lib/utils";
import { EMPTY_STATES } from "@/lib/constants";
import EmptyState from "@/components/storefront/EmptyState";

type DeliveryZone = { id: number; name: string; fee: number; minOrderAmount: number };

export default function CheckoutForm({ deliveryZones }: { deliveryZones: DeliveryZone[] }) {
  const { items, subtotalEstimate, clearCart } = useCart();
  const router = useRouter();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [district, setDistrict] = useState("");
  const [detailedAddress, setDetailedAddress] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [deliveryZoneId, setDeliveryZoneId] = useState<number | "">("");
  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState<{ valid: boolean; message: string; discount?: number } | null>(
    null
  );
  const [checkingCoupon, setCheckingCoupon] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedZone = deliveryZones.find((z) => z.id === deliveryZoneId);
  const estimatedDelivery = selectedZone?.fee ?? 0;
  const estimatedDiscount = couponResult?.valid ? couponResult.discount ?? 0 : 0;
  const estimatedTotal = subtotalEstimate + estimatedDelivery - estimatedDiscount;

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return;
    setCheckingCoupon(true);
    setCouponResult(null);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim(), subtotal: subtotalEstimate }),
      });
      const data = await res.json();
      if (res.ok) setCouponResult({ valid: true, message: "تم تطبيق الكوبون ✓", discount: data.discount });
      else setCouponResult({ valid: false, message: data.error || "رمز الخصم غير صالح." });
    } catch {
      setCouponResult({ valid: false, message: "حدث خطأ، حاول مرة أخرى." });
    } finally {
      setCheckingCoupon(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!deliveryZoneId) {
      setError("يرجى اختيار منطقة التوصيل.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone,
          governorate: governorate || null,
          district: district || null,
          detailedAddress,
          deliveryNotes: deliveryNotes || null,
          deliveryZoneId,
          couponCode: couponResult?.valid ? couponCode.trim() : null,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            selectedOptionValueIds: item.selectedOptions.map((o) => o.valueId),
            cakeMessage: item.cakeMessage,
            note: item.note,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "حدث خطأ، حاول مرة أخرى.");
        setSubmitting(false);
        return;
      }

      clearCart();
      router.push(`/order/${data.order.id}?token=${data.order.trackingToken}`);
    } catch {
      setError("حدث خطأ، حاول مرة أخرى.");
      setSubmitting(false);
    }
  }

  if (items.length === 0) return <EmptyState message={EMPTY_STATES.cart} icon="🛒" />;
  if (deliveryZones.length === 0) return <EmptyState message={EMPTY_STATES.noDeliveryZones} icon="🚚" />;

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 md:grid-cols-[1.3fr_1fr]">
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">الاسم</label>
            <input
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="input-field"
              placeholder="اسمك الكامل"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">رقم الهاتف</label>
            <input
              required
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="input-field"
              placeholder="07xxxxxxxxx"
              dir="ltr"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">المحافظة (اختياري)</label>
            <input value={governorate} onChange={(e) => setGovernorate(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">القضاء (اختياري)</label>
            <input value={district} onChange={(e) => setDistrict(e.target.value)} className="input-field" />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">منطقة التوصيل</label>
          <select
            required
            value={deliveryZoneId}
            onChange={(e) => setDeliveryZoneId(Number(e.target.value))}
            className="input-field"
          >
            <option value="" disabled>
              اختر منطقتك
            </option>
            {deliveryZones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name} — توصيل {formatCurrency(z.fee)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">العنوان التفصيلي</label>
          <textarea
            required
            rows={2}
            value={detailedAddress}
            onChange={(e) => setDetailedAddress(e.target.value)}
            className="input-field resize-none"
            placeholder="أقرب نقطة دالة، رقم البيت..."
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">ملاحظات التوصيل (اختياري)</label>
          <textarea
            rows={2}
            value={deliveryNotes}
            onChange={(e) => setDeliveryNotes(e.target.value)}
            className="input-field resize-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">طريقة الدفع</label>
          <div className="rounded-2xl border border-line bg-blush/30 px-4 py-3 text-sm text-ink-2">
            الدفع عند الاستلام
          </div>
        </div>
      </div>

      <div>
        <div className="card-surface sticky top-24 space-y-4 p-5">
          <h2 className="font-display text-lg font-semibold text-ink">ملخص الطلب</h2>

          <div className="flex gap-2">
            <input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="رمز الخصم (اختياري)"
              className="input-field"
            />
            <button
              type="button"
              onClick={handleApplyCoupon}
              disabled={checkingCoupon || !couponCode.trim()}
              className="btn-secondary shrink-0"
            >
              تطبيق
            </button>
          </div>
          {couponResult && (
            <p className={couponResult.valid ? "text-xs text-emerald-700" : "text-xs text-berry"}>
              {couponResult.message}
            </p>
          )}

          <div className="space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between text-ink-2">
              <span>المجموع الفرعي</span>
              <span>{formatCurrency(subtotalEstimate)}</span>
            </div>
            <div className="flex justify-between text-ink-2">
              <span>التوصيل</span>
              <span>{selectedZone ? formatCurrency(estimatedDelivery) : "—"}</span>
            </div>
            {estimatedDiscount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>الخصم</span>
                <span>-{formatCurrency(estimatedDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-line pt-2 text-base font-bold text-ink">
              <span>الإجمالي التقديري</span>
              <span>{formatCurrency(Math.max(0, estimatedTotal))}</span>
            </div>
          </div>

          {error && <p className="rounded-xl bg-berry/10 px-3 py-2 text-xs text-berry">{error}</p>}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? "جارٍ إرسال الطلب..." : "تأكيد الطلب"}
          </button>
          <p className="text-center text-[11px] text-ink-2/60">السعر النهائي يُحتسب بدقة عند إرسال الطلب.</p>
        </div>
      </div>
    </form>
  );
}
