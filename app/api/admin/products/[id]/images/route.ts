import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/auth";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "products");
const MAX_SIZE = 5 * 1024 * 1024; // 5 ميغابايت
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح." }, { status: 401 });

  const productId = Number(params.id);
  const product = await prisma.product.findUnique({ where: { id: productId }, include: { images: true } });
  if (!product) return NextResponse.json({ error: "المنتج غير موجود." }, { status: 404 });

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "يرجى اختيار صورة." }, { status: 400 });
  }
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return NextResponse.json({ error: "صيغة الصورة غير مدعومة (jpg, png, webp, gif فقط)." }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "حجم الصورة كبير جداً (الحد الأقصى 5 ميغابايت)." }, { status: 400 });
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const fileName = `${productId}-${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, fileName), buffer);

  const image = await prisma.productImage.create({
    data: {
      productId,
      url: `/uploads/products/${fileName}`,
      isPrimary: product.images.length === 0,
      sortOrder: product.images.length,
    },
  });

  return NextResponse.json({ image });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const imageId = Number(searchParams.get("imageId"));
  if (!imageId) return NextResponse.json({ error: "معرّف الصورة مطلوب." }, { status: 400 });

  const image = await prisma.productImage.findUnique({ where: { id: imageId } });
  if (!image || image.productId !== Number(params.id)) {
    return NextResponse.json({ error: "الصورة غير موجودة." }, { status: 404 });
  }

  await prisma.productImage.delete({ where: { id: imageId } });

  try {
    await unlink(path.join(process.cwd(), "public", image.url));
  } catch {
    // تجاهل إن كان الملف غير موجود مسبقاً على القرص
  }

  if (image.isPrimary) {
    const next = await prisma.productImage.findFirst({
      where: { productId: image.productId },
      orderBy: { sortOrder: "asc" },
    });
    if (next) await prisma.productImage.update({ where: { id: next.id }, data: { isPrimary: true } });
  }

  return NextResponse.json({ deleted: true });
}
