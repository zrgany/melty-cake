import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { adminLoginSchema } from "@/lib/validation";
import { verifyPassword, createSessionToken, sessionCookieOptions, ADMIN_COOKIE } from "@/lib/auth";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "بيانات غير صالحة." }, { status: 400 });
  }

  const parsed = adminLoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "يرجى إدخال رقم الهاتف وكلمة المرور." }, { status: 400 });
  }

  const admin = await prisma.adminUser.findUnique({ where: { phone: parsed.data.phone } });
  if (!admin) {
    return NextResponse.json({ error: "رقم الهاتف أو كلمة المرور غير صحيحة." }, { status: 401 });
  }

  const valid = await verifyPassword(parsed.data.password, admin.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "رقم الهاتف أو كلمة المرور غير صحيحة." }, { status: 401 });
  }

  const token = createSessionToken(admin.id, "admin");
  const res = NextResponse.json({ ok: true, admin: { id: admin.id, name: admin.name } });
  res.cookies.set(ADMIN_COOKIE, token, sessionCookieOptions());
  return res;
}
