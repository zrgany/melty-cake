import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";
import { productInputSchema } from "@/lib/validation";
import { updateProduct } from "@/lib/products";
import { ERROR_MESSAGES } from "@/lib/constants";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح." }, { status: 401 });

  const id = Number(params.id);
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      optionGroups: { orderBy: { sortOrder: "asc" }, include: { values: { orderBy: { sortOrder: "asc" } } } },
    },
  });

  if (!product) return NextResponse.json({ error: "المنتج غير موجود." }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح." }, { status: 401 });

  const id = Number(params.id);
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
    const product = await updateProduct(id, parsed.data);
    await prisma.auditLog.create({
      data: { adminId: admin.id, adminName: admin.name, action: "PRODUCT_UPDATE", entity: "Product", entityId: id },
    });
    return NextResponse.json({ product });
  } catch (err) {
    console.error("Product update failed:", err);
    return NextResponse.json({ error: ERROR_MESSAGES.generic }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح." }, { status: 401 });

  const id = Number(params.id);

  // لا نحذف منتجاً له طلبات سابقة فعلياً (حفاظاً على سلامة السجل التاريخي) — نعطّله بدلاً من ذلك
  const hasOrders = await prisma.orderItem.findFirst({ where: { productId: id } });
  if (hasOrders) {
    await prisma.product.update({ where: { id }, data: { isAvailable: false } });
    await prisma.auditLog.create({
      data: { adminId: admin.id, adminName: admin.name, action: "PRODUCT_DISABLE", entity: "Product", entityId: id },
    });
    return NextResponse.json({ disabled: true, message: "تم تعطيل المنتج بدل حذفه لوجود طلبات سابقة مرتبطة به." });
  }

  await prisma.product.delete({ where: { id } });
  await prisma.auditLog.create({
    data: { adminId: admin.id, adminName: admin.name, action: "PRODUCT_DELETE", entity: "Product", entityId: id },
  });
  return NextResponse.json({ deleted: true });
}
