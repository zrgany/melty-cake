"use client";

import Link from "next/link";
import { Search, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/lib/cart-context";

export default function Header({
  businessName,
  categories,
}: {
  businessName: string;
  categories: { name: string; slug: string }[];
}) {
  const { count } = useCart();

  return (
    <header className="pt-safe sticky top-0 z-40 border-b border-line bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-caramel font-display text-base text-cream">
            م
          </span>
          <span className="font-display text-lg font-semibold text-ink">{businessName}</span>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className="rounded-full px-3 py-1.5 text-sm font-medium text-ink-2 hover:bg-blush hover:text-ink"
            >
              {c.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Link href="/search" aria-label="بحث" className="rounded-full p-2.5 text-ink hover:bg-blush">
            <Search size={20} />
          </Link>
          <Link href="/cart" aria-label="السلة" className="relative rounded-full p-2.5 text-ink hover:bg-blush">
            <ShoppingBag size={20} />
            {count > 0 && (
              <span className="absolute -left-0.5 -top-0.5 grid h-5 w-5 place-items-center rounded-full bg-berry text-[11px] font-bold text-cream">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </Link>
          <Link
            href="/account"
            aria-label="حسابي"
            className="hidden rounded-full p-2.5 text-ink hover:bg-blush md:block"
          >
            <User size={20} />
          </Link>
        </div>
      </div>
    </header>
  );
}
