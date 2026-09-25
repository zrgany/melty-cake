import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { couponInputSchema } from "@/lib/validation";
import { ERROR_MESSAGES } from "@/lib/constants";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح." }, { status: 401 });

  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ coupons });
}

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح." }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: ERROR_MESSAGES.generic }, { status: 400 });
  }

  const parsed = couponInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message || ERROR_MESSAGES.generic }, { status: 400 });
  }

  const existing = await prisma.coupon.findUnique({ where: { code: parsed.data.code } });
  if (existing) {
    return NextResponse.json({ error: "يوجد كوبون بهذا الرمز مسبقاً." }, { status: 400 });
  }

  const coupon = await prisma.coupon.create({
    data: {
      code: parsed.data.code,
      type: parsed.data.type,
      value: parsed.data.value,
      minOrderAmount: parsed.data.minOrderAmount,
      usageLimit: parsed.data.usageLimit ?? null,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
      isActive: parsed.data.isActive,
    },
  });

  return NextResponse.json({ coupon });
}
