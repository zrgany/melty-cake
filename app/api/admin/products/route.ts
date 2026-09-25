import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { productInputSchema } from "@/lib/validation";
import { createProduct } from "@/lib/products";
import { ERROR_MESSAGES } from "@/lib/constants";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح." }, { status: 401 });

  const products = await prisma.product.findMany({
    include: { category: true, images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    orderBy: [{ categoryId: "asc" }, { sortOrder: "asc" }],
  });

  return NextResponse.json({ products });
}

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح." }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: ERROR_MESSAGES.generic }, { status: 400 });
  }

  const parsed = productInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message || ERROR_MESSAGES.generic }, { status: 400 });
  }

  try {
    const product = await createProduct(parsed.data);

    await prisma.auditLog.create({
      data: { adminId: admin.id, adminName: admin.name, action: "PRODUCT_CREATE", entity: "Product", entityId: product.id },
    });

    return NextResponse.json({ product });
  } catch (err) {
    console.error("Product creation failed:", err);
    return NextResponse.json({ error: ERROR_MESSAGES.generic }, { status: 500 });
  }
}
