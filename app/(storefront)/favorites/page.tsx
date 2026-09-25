import Link from "next/link";
import EmptyState from "@/components/storefront/EmptyState";

export default function FavoritesPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 font-display text-2xl font-bold text-ink">مفضلتي</h1>
      <EmptyState
        message="ميزة المفضلة قيد الإضافة قريباً — بإمكانك تصفح المنتجات وطلبها مباشرة بالوقت الحالي."
        icon="💛"
        action={
          <Link href="/#categories" className="btn-primary">
            تصفح القائمة
          </Link>
        }
      />
    </div>
  );
}
