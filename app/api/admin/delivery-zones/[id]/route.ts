import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { deliveryZoneSchema } from "@/lib/validation";
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

  const parsed = deliveryZoneSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message || ERROR_MESSAGES.generic }, { status: 400 });
  }

  const zone = await prisma.deliveryZone.update({
    where: { id: Number(params.id) },
    data: {
      name: parsed.data.name,
      fee: parsed.data.fee,
      minOrderAmount: parsed.data.minOrderAmount,
      isActive: parsed.data.isActive,
      sortOrder: parsed.data.sortOrder,
    },
  });

  return NextResponse.json({ zone });
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح." }, { status: 401 });

  const id = Number(params.id);

  // إذا استُخدمت هذه المنطقة في طلبات سابقة، لا نحذفها (لحفظ سلامة السجل)، بل نعطّلها فقط
  const usedInOrders = await prisma.order.findFirst({ where: { deliveryZoneId: id } });
  if (usedInOrders) {
    await prisma.deliveryZone.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ disabled: true });
  }

  await prisma.deliveryZone.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
