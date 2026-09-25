import { prisma } from "./db";
import { ERROR_MESSAGES } from "./constants";

export class PricingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PricingError";
  }
}

type IncomingItem = {
  productId: number;
  quantity: number;
  selectedOptionValueIds: number[];
  cakeMessage?: string | null;
  note?: string | null;
};

export type PricedLine = {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  selectedOptions: { groupName: string; valueLabel: string; price: number }[];
  cakeMessage: string | null;
  note: string | null;
  lineTotal: number;
};

export type OrderPricing = {
  lines: PricedLine[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  deliveryZoneId: number;
  couponId: number | null;
};

/**
 * يحسب سعر عنصر واحد بالكامل من الخادم:
 * 1) يقرأ المنتج والخيارات من قاعدة البيانات (يتجاهل أي سعر قادم من العميل)
 * 2) يتحقق من التوفر ومن أن الخيارات المختارة تخص هذا المنتج فعلاً
 * 3) يتحقق من المجموعات المطلوبة (مثل الحجم) والاختيار الواحد
 * 4) يحسب السعر: مجموعات OVERRIDE تحدد السعر، ثم مجموعات DELTA تُضاف عليه
 */
export async function priceCheckoutItem(item: IncomingItem): Promise<PricedLine> {
  const product = await prisma.product.findUnique({
    where: { id: item.productId },
    include: { optionGroups: { include: { values: true } } },
  });

  if (!product) throw new PricingError(ERROR_MESSAGES.productUnavailable);
  if (!product.isAvailable) {
    throw new PricingError(`"${product.name}" ${ERROR_MESSAGES.productUnavailable}`);
  }
  if (item.quantity < 1) throw new PricingError(ERROR_MESSAGES.generic);

  const allValues = product.optionGroups.flatMap((g) => g.values.map((v) => ({ ...v, group: g })));

  const selectedValues = item.selectedOptionValueIds.map((id) => {
    const found = allValues.find((v) => v.id === id);
    if (!found) throw new PricingError(ERROR_MESSAGES.generic);
    return found;
  });

  for (const group of product.optionGroups) {
    const chosenInGroup = selectedValues.filter((v) => v.groupId === group.id);
    if (group.isRequired && chosenInGroup.length === 0) {
      throw new PricingError(`يرجى اختيار ${group.name}.`);
    }
    if (group.type === "SINGLE" && chosenInGroup.length > 1) {
      throw new PricingError(`يمكن اختيار قيمة واحدة فقط لـ ${group.name}.`);
    }
  }

  let unitPrice = product.basePrice;
  for (const value of selectedValues) {
    if (value.group.priceMode === "OVERRIDE") unitPrice = value.price;
  }
  for (const value of selectedValues) {
    if (value.group.priceMode === "DELTA") unitPrice += value.price;
  }
  if (unitPrice < 0) unitPrice = 0;

  return {
    productId: product.id,
    productName: product.name,
    unitPrice,
    quantity: item.quantity,
    selectedOptions: selectedValues.map((v) => ({
      groupName: v.group.name,
      valueLabel: v.label,
      price: v.group.priceMode === "DELTA" ? v.price : 0,
    })),
    cakeMessage: product.allowCakeMessage ? item.cakeMessage?.trim() || null : null,
    note: item.note?.trim() || null,
    lineTotal: unitPrice * item.quantity,
  };
}

/**
 * الدالة الرئيسية الآمنة لحساب سعر الطلب بالكامل: العناصر + التوصيل + الخصم.
 * هذه الدالة الوحيدة المخوّلة لتحديد السعر النهائي لأي طلب في المشروع.
 */
export async function computeOrderPricing(input: {
  items: IncomingItem[];
  deliveryZoneId: number;
  couponCode?: string | null;
}): Promise<OrderPricing> {
  if (input.items.length === 0) throw new PricingError("السلة فارغة");

  const lines: PricedLine[] = [];
  for (const item of input.items) {
    lines.push(await priceCheckoutItem(item));
  }

  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);

  const zone = await prisma.deliveryZone.findUnique({ where: { id: input.deliveryZoneId } });
  if (!zone || !zone.isActive) {
    throw new PricingError("منطقة التوصيل المختارة غير متاحة، يرجى اختيار منطقة أخرى.");
  }
  if (subtotal < zone.minOrderAmount) {
    throw new PricingError(
      `الحد الأدنى للطلب في هذه المنطقة هو ${zone.minOrderAmount.toLocaleString("en-US")} د.ع.`
    );
  }

  const settings = await prisma.businessSettings.findUnique({ where: { id: 1 } });
  let deliveryFee = zone.fee;
  if (settings?.freeDeliveryThreshold != null && subtotal >= settings.freeDeliveryThreshold) {
    deliveryFee = 0;
  }

  let discount = 0;
  let couponId: number | null = null;

  if (input.couponCode && input.couponCode.trim()) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: input.couponCode.trim().toUpperCase() },
    });
    if (!coupon || !coupon.isActive) throw new PricingError(ERROR_MESSAGES.invalidCoupon);
    if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new PricingError(ERROR_MESSAGES.invalidCoupon);
    if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
      throw new PricingError(ERROR_MESSAGES.invalidCoupon);
    }
    if (subtotal < coupon.minOrderAmount) {
      throw new PricingError(
        `هذا الكوبون يتطلب حداً أدنى للطلب ${coupon.minOrderAmount.toLocaleString("en-US")} د.ع.`
      );
    }
    discount = coupon.type === "PERCENTAGE" ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
    if (discount > subtotal) discount = subtotal;
    couponId = coupon.id;
  }

  const total = subtotal - discount + deliveryFee;

  return { lines, subtotal, deliveryFee, discount, total, deliveryZoneId: zone.id, couponId };
}
