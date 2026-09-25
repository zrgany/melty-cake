import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export type ProductCardData = {
  slug: string;
  name: string;
  basePrice: number;
  description?: string | null;
  image?: string | null;
  isBestSeller?: boolean;
  hasOptions?: boolean;
};

export default function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block overflow-hidden rounded-card border border-line bg-white transition-shadow hover:shadow-soft"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-blush">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(min-width: 768px) 25vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-3xl">🍰</div>
        )}
        {product.isBestSeller && (
          <span className="absolute right-2 top-2 rounded-full bg-berry px-2.5 py-1 text-[11px] font-semibold text-cream">
            الأكثر طلباً
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="line-clamp-1 text-sm font-semibold text-ink">{product.name}</h3>
        {product.description && (
          <p className="mt-0.5 line-clamp-1 text-xs text-ink-2/70">{product.description}</p>
        )}
        <p className="mt-2 text-sm font-semibold text-caramel-dark">
          {product.hasOptions && <span className="ml-1 text-xs font-normal text-ink-2/60">يبدأ من</span>}
          {formatCurrency(product.basePrice)}
        </p>
      </div>
    </Link>
  );
}
