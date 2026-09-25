import { prisma } from "./db";
import { slugify } from "./utils";
import type { z } from "zod";
import type { productInputSchema } from "./validation";

type ProductInput = z.infer<typeof productInputSchema>;

export async function generateUniqueSlug(name: string, excludeId?: number): Promise<string> {
  const base = slugify(name) || `product-${Date.now()}`;
  let candidate = base;
  let i = 2;
  // eslint-disable-next-line no-await-in-loop
  while (
    await prisma.product.findFirst({
      where: { slug: candidate, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    })
  ) {
    candidate = `${base}-${i}`;
    i++;
  }
  return candidate;
}

function buildOptionGroupsCreate(groups: ProductInput["optionGroups"]) {
  return groups.map((g, gi) => ({
    name: g.name,
    type: g.type,
    priceMode: g.priceMode,
    isRequired: g.isRequired,
    sortOrder: g.sortOrder ?? gi,
    values: {
      create: g.values.map((v, vi) => ({
        label: v.label,
        price: v.price,
        isDefault: v.isDefault,
        sortOrder: v.sortOrder ?? vi,
      })),
    },
  }));
}

export async function createProduct(input: ProductInput) {
  const slug = await generateUniqueSlug(input.name);
  return prisma.product.create({
    data: {
      name: input.name,
      slug,
      description: input.description || null,
      basePrice: input.basePrice,
      categoryId: input.categoryId,
      isFeatured: input.isFeatured,
      isBestSeller: input.isBestSeller,
      isAvailable: input.isAvailable,
      allowCakeMessage: input.allowCakeMessage,
      sortOrder: input.sortOrder,
      optionGroups: { create: buildOptionGroupsCreate(input.optionGroups) },
    },
    include: { optionGroups: { include: { values: true } }, images: true, category: true },
  });
}

export async function updateProduct(id: number, input: ProductInput) {
  const existing = await prisma.product.findUnique({ where: { id }, select: { slug: true, name: true } });
  if (!existing) throw new Error("المنتج غير موجود");

  const slug = existing.name === input.name ? existing.slug : await generateUniqueSlug(input.name, id);

  // إعادة إنشاء مجموعات الخيارات بالكامل أبسط وأضمن من تحديث جزئي دقيق.
  // هذا آمن تماماً: الطلبات القديمة تحتفظ بلقطة سعر مستقلة (OrderItem.selectedOptions)
  // ولا ترتبط بسجلات ProductOptionValue الحيّة، فحذفها لا يغيّر أي طلب سابق.
  await prisma.productOptionGroup.deleteMany({ where: { productId: id } });

  return prisma.product.update({
    where: { id },
    data: {
      name: input.name,
      slug,
      description: input.description || null,
      basePrice: input.basePrice,
      categoryId: input.categoryId,
      isFeatured: input.isFeatured,
      isBestSeller: input.isBestSeller,
      isAvailable: input.isAvailable,
      allowCakeMessage: input.allowCakeMessage,
      sortOrder: input.sortOrder,
      optionGroups: { create: buildOptionGroupsCreate(input.optionGroups) },
    },
    include: { optionGroups: { include: { values: true } }, images: true, category: true },
  });
}
