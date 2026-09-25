"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Heart, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/", label: "الرئيسية", icon: Home },
  { href: "/#categories", label: "الأقسام", icon: LayoutGrid },
  { href: "/favorites", label: "المفضلة", icon: Heart },
  { href: "/cart", label: "السلة", icon: ShoppingBag },
  { href: "/account", label: "الحساب", icon: User },
];

function isActive(pathname: string, href: string): boolean {
  if (href.includes("#")) return false;
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export default function BottomNav() {
  const pathname = usePathname();
  const { count } = useCart();

  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-lg items-stretch justify-between px-1">
        {ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
                active ? "text-caramel-dark" : "text-ink-2/70"
              )}
            >
              <span className="relative">
                <Icon size={22} strokeWidth={active ? 2.4 : 2} />
                {item.label === "السلة" && count > 0 && (
                  <span className="absolute -left-2 -top-1.5 grid h-4 w-4 place-items-center rounded-full bg-berry text-[9px] font-bold text-cream">
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
