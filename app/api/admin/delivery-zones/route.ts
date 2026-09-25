import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { deliveryZoneSchema } from "@/lib/validation";
import { ERROR_MESSAGES } from "@/lib/constants";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح." }, { status: 401 });

  const zones = await prisma.deliveryZone.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ zones });
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

  const parsed = deliveryZoneSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message || ERROR_MESSAGES.generic }, { status: 400 });
  }

  const zone = await prisma.deliveryZone.create({
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
