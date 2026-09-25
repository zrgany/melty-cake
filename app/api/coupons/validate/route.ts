import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { couponValidateSchema } from "@/lib/validation";
import { ERROR_MESSAGES } from "@/lib/constants";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: ERROR_MESSAGES.generic }, { status: 400 });
  }

  const parsed = couponValidateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: ERROR_MESSAGES.invalidCoupon }, { status: 400 });
  }

  const { code, subtotal } = parsed.data;
  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });

  if (!coupon || !coupon.isActive) {
    return NextResponse.json({ error: ERROR_MESSAGES.invalidCoupon }, { status: 400 });
  }
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return NextResponse.json({ error: "انتهت صلاحية هذا الكوبون." }, { status: 400 });
  }
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    return NextResponse.json({ error: "تم الوصول للحد الأقصى لاستخدام هذا الكوبون." }, { status: 400 });
  }
  if (subtotal < coupon.minOrderAmount) {
    return NextResponse.json(
      { error: `هذا الكوبون يتطلب حداً أدنى للطلب ${coupon.minOrderAmount.toLocaleString("en-US")} د.ع.` },
      { status: 400 }
    );
  }

  const discount = coupon.type === "PERCENTAGE" ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
  return NextResponse.json({ discount: Math.min(discount, subtotal), type: coupon.type, value: coupon.value });
}
