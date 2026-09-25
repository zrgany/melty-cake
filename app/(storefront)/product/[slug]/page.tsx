import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import ProductOptionsForm from "@/components/storefront/ProductOptionsForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    select: { name: true, description: true },
  });
  if (!product) return {};
  return {
    title: `${product.name} | Melty Cake`,
    description: product.description ?? `اطلب ${product.name} أونلاين من Melty Cake`,
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      optionGroups: {
        orderBy: { sortOrder: "asc" },
        include: { values: { orderBy: { sortOrder: "asc" } } },
      },
      category: true,
    },
  });

  if (!product) notFound();

  const primaryImage = product.images.find((i) => i.isPrimary) ?? product.images[0];

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:py-10">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative aspect-square w-full overflow-hidden rounded-card border border-line bg-blush">
          {primaryImage ? (
            <Image src={primaryImage.url} alt={product.name} fill className="object-cover" priority />
          ) : (
            <div className="flex h-full items-center justify-center text-6xl">🍰</div>
          )}
        </div>

        <div>
          <p className="text-xs font-medium text-caramel-dark">{product.category.name}</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-ink md:text-3xl">{product.name}</h1>
          {product.description && <p className="mt-2 text-sm leading-relaxed text-ink-2">{product.description}</p>}

          <div className="mt-6">
            <ProductOptionsForm
              product={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                basePrice: product.basePrice,
                allowCakeMessage: product.allowCakeMessage,
                isAvailable: product.isAvailable,
                image: primaryImage?.url ?? null,
                optionGroups: product.optionGroups.map((g) => ({
                  id: g.id,
                  name: g.name,
                  type: g.type as "SINGLE" | "MULTI",
                  priceMode: g.priceMode as "OVERRIDE" | "DELTA",
                  isRequired: g.isRequired,
                  values: g.values.map((v) => ({
                    id: v.id,
                    label: v.label,
                    description: v.description,
                    price: v.price,
                    isDefault: v.isDefault,
                  })),
                })),
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
