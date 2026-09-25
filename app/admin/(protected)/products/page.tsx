import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: true, images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    orderBy: [{ categoryId: "asc" }, { sortOrder: "asc" }],
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink">المنتجات</h1>
        <Link href="/admin/products/new" className="btn-primary">
          <Plus size={18} /> منتج جديد
        </Link>
      </div>

      <div className="card-surface divide-y divide-line">
        {products.map((p) => (
          <Link key={p.id} href={`/admin/products/${p.id}`} className="flex items-center gap-3 p-4 hover:bg-blush/40">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-blush">
              {p.images[0] ? (
                <Image src={p.images[0].url} alt={p.name} fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-xl">🍰</div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{p.name}</p>
              <p className="text-xs text-ink-2/60">{p.category.name}</p>
            </div>
            <p className="shrink-0 text-sm font-semibold text-caramel-dark">{formatCurrency(p.basePrice)}</p>
            {!p.isAvailable && (
              <span className="shrink-0 rounded-full bg-ink-2/10 px-2.5 py-1 text-[11px] font-medium text-ink-2">
                غير متوفر
              </span>
            )}
          </Link>
        ))}

        {products.length === 0 && <p className="p-6 text-center text-sm text-ink-2/60">لا توجد منتجات بعد.</p>}
      </div>
    </div>
  );
}
