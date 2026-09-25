import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// نفس اسم الكوكي في lib/auth.ts — مكرر هنا عمداً لأن middleware يعمل على Edge runtime
// ولا يمكنه استيراد Prisma / Node crypto. التحقق الفعلي من صحة الجلسة يتم في requireAdmin().
const ADMIN_COOKIE = "mc_admin_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const hasSession = request.cookies.get(ADMIN_COOKIE)?.value;
    if (!hasSession) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
