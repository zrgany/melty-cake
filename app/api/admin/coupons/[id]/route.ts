import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { couponInputSchema } from "@/lib/validation";
import { ERROR_MESSAGES } from "@/lib/constants";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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

  const coupon = await prisma.coupon.update({
    where: { id: Number(params.id) },
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

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح." }, { status: 401 });

  await prisma.coupon.delete({ where: { id: Number(params.id) } });
  return NextResponse.json({ deleted: true });
}
