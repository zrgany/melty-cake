"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, ClipboardList, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "الرئيسية", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "المنتجات", icon: Package },
  { href: "/admin/orders", label: "الطلبات", icon: ClipboardList },
  { href: "/admin/settings", label: "الإعدادات", icon: Settings },
];

export default function Sidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <>
      <aside className="hidden w-60 shrink-0 flex-col border-l border-line bg-white md:flex">
        <div className="flex items-center gap-2 border-b border-line px-5 py-4">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-caramel font-display text-cream">
            م
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">Melty Cake</p>
            <p className="text-xs text-ink-2/60">لوحة التحكم</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {LINKS.map((l) => {
            const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
            const Icon = l.icon;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium",
                  active ? "bg-caramel text-cream" : "text-ink-2 hover:bg-blush"
                )}
              >
                <Icon size={18} /> {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-line p-3">
          <p className="px-3 pb-2 text-xs text-ink-2/60">{adminName}</p>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-berry hover:bg-berry/10"
          >
            <LogOut size={18} /> تسجيل خروج
          </button>
        </div>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-white md:hidden">
        {LINKS.map((l) => {
          const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
          const Icon = l.icon;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
                active ? "text-caramel-dark" : "text-ink-2/70"
              )}
            >
              <Icon size={20} />
              {l.label}
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-berry"
        >
          <LogOut size={20} />
          خروج
        </button>
      </nav>
    </>
  );
}
