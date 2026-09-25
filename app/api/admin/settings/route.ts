import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { businessSettingsSchema } from "@/lib/validation";
import { ERROR_MESSAGES } from "@/lib/constants";

export async function PATCH(request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح." }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: ERROR_MESSAGES.generic }, { status: 400 });
  }

  const parsed = businessSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message || ERROR_MESSAGES.generic }, { status: 400 });
  }

  const settings = await prisma.businessSettings.upsert({
    where: { id: 1 },
    update: parsed.data,
    create: { id: 1, ...parsed.data },
  });

  await prisma.auditLog.create({
    data: { adminId: admin.id, adminName: admin.name, action: "SETTINGS_UPDATE", entity: "BusinessSettings", entityId: 1 },
  });

  return NextResponse.json({ settings });
}
