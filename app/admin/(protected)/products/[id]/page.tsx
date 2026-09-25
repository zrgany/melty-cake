import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import ProductForm from "@/components/admin/ProductForm";
import ImageUploader from "@/components/admin/ImageUploader";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        optionGroups: { orderBy: { sortOrder: "asc" }, include: { values: { orderBy: { sortOrder: "asc" } } } },
      },
    }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-bold text-ink">تعديل: {product.name}</h1>

      <div className="card-surface p-5">
        <h2 className="mb-3 font-display text-lg font-semibold text-ink">الصور</h2>
        <ImageUploader
          productId={product.id}
          images={product.images.map((i) => ({ id: i.id, url: i.url, isPrimary: i.isPrimary }))}
        />
      </div>

      <ProductForm
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        productId={product.id}
        initial={{
          name: product.name,
          description: product.description ?? "",
          basePrice: product.basePrice,
          categoryId: product.categoryId,
          isFeatured: product.isFeatured,
          isBestSeller: product.isBestSeller,
          isAvailable: product.isAvailable,
          allowCakeMessage: product.allowCakeMessage,
          sortOrder: product.sortOrder,
          optionGroups: product.optionGroups.map((g) => ({
            id: g.id,
            name: g.name,
            type: g.type as "SINGLE" | "MULTI",
            priceMode: g.priceMode as "OVERRIDE" | "DELTA",
            isRequired: g.isRequired,
            values: g.values.map((v) => ({ id: v.id, label: v.label, price: v.price, isDefault: v.isDefault })),
          })),
        }}
      />
    </div>
  );
}
