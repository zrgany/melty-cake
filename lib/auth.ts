import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

// السر المستخدم لتوقيع جلسات الدخول. يجب ضبطه في الإنتاج عبر SESSION_SECRET.
const SECRET = process.env.SESSION_SECRET || "dev-only-insecure-secret-change-me";

export const CUSTOMER_COOKIE = "mc_customer_session";
export const ADMIN_COOKIE = "mc_admin_session";
const THIRTY_DAYS = 60 * 60 * 24 * 30;

type Role = "customer" | "admin";
type SessionPayload = { id: number; role: Role; exp: number };

function sign(payloadB64: string): string {
  return createHmac("sha256", SECRET).update(payloadB64).digest("base64url");
}

/** يبني رمز جلسة موقّعاً (شبيه بـ JWT المبسّط): payload.signature */
export function createSessionToken(id: number, role: Role, maxAgeSeconds = THIRTY_DAYS): string {
  const payload: SessionPayload = {
    id,
    role,
    exp: Math.floor(Date.now() / 1000) + maxAgeSeconds,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = sign(payloadB64);
  return `${payloadB64}.${signature}`;
}

/** يتحقق من صحة توقيع الرمز وصلاحيته قبل الوثوق بمحتواه */
export function verifySessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, signature] = parts;

  const expectedSignature = sign(payloadB64);
  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSignature);
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf-8")) as SessionPayload;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    if (typeof payload.id !== "number" || (payload.role !== "customer" && payload.role !== "admin")) return null;
    return payload;
  } catch {
    return null;
  }
}

export function sessionCookieOptions(maxAgeSeconds = THIRTY_DAYS) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ---- قراءة الجلسة الحالية (Server Components / Route Handlers فقط) ----

export async function getCurrentCustomer() {
  const token = cookies().get(CUSTOMER_COOKIE)?.value;
  const payload = verifySessionToken(token);
  if (!payload || payload.role !== "customer") return null;
  return prisma.user.findUnique({ where: { id: payload.id } });
}

export async function getCurrentAdmin() {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  const payload = verifySessionToken(token);
  if (!payload || payload.role !== "admin") return null;
  return prisma.adminUser.findUnique({ where: { id: payload.id } });
}

/** يُستخدم في أعلى كل صفحة أدمن (Server Component): يحوّل لصفحة الدخول إن لم تكن هناك جلسة صالحة */
export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
