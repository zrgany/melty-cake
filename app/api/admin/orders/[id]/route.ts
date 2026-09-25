import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { orderStatusUpdateSchema } from "@/lib/validation";
import { updateOrderStatus } from "@/lib/orders";
import { ERROR_MESSAGES } from "@/lib/constants";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح." }, { status: 401 });

  const order = await prisma.order.findUnique({
    where: { id: Number(params.id) },
    include: { items: true, deliveryZone: true, coupon: true },
  });
  if (!order) return NextResponse.json({ error: "الطلب غير موجود." }, { status: 404 });
  return NextResponse.json({ order });
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح." }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: ERROR_MESSAGES.generic }, { status: 400 });
  }

  const parsed = orderStatusUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: ERROR_MESSAGES.generic }, { status: 400 });
  }

  try {
    const order = await updateOrderStatus(Number(params.id), parsed.data.status, {
      id: admin.id,
      name: admin.name,
    });
    return NextResponse.json({ order });
  } catch (err) {
    console.error("Order status update failed:", err);
    return NextResponse.json({ error: ERROR_MESSAGES.generic }, { status: 500 });
  }
}
