import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import ProductCard from "@/components/storefront/ProductCard";
import CategoryChip from "@/components/storefront/CategoryChip";
import EmptyState from "@/components/storefront/EmptyState";

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const [category, allCategories] = await Promise.all([
    prisma.category.findUnique({
      where: { slug: params.slug },
      include: {
        products: {
          where: { isAvailable: true },
          include: {
            images: { where: { isPrimary: true }, take: 1 },
            optionGroups: { select: { id: true } },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
    }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  if (!category || !category.isActive) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {allCategories.map((c) => (
          <CategoryChip key={c.slug} name={c.name} slug={c.slug} active={c.slug === category.slug} />
        ))}
      </div>

      <h1 className="font-display text-2xl font-bold text-ink md:text-3xl">{category.name}</h1>

      {category.products.length === 0 ? (
        <div className="mt-8">
          <EmptyState message="لا توجد منتجات متاحة في هذا القسم حالياً." icon="🍽️" />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {category.products.map((p) => (
            <ProductCard
              key={p.id}
              product={{
                slug: p.slug,
                name: p.name,
                basePrice: p.basePrice,
                description: p.description,
                image: p.images[0]?.url ?? null,
                isBestSeller: p.isBestSeller,
                hasOptions: p.optionGroups.length > 0,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
