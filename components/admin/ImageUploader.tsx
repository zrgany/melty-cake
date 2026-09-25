"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Upload, Trash2, Star } from "lucide-react";

type ProductImage = { id: number; url: string; isPrimary: boolean };

export default function ImageUploader({ productId, images }: { productId: number; images: ProductImage[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch(`/api/admin/products/${productId}/images`, { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) setError(data.error || "تعذّر رفع الصورة.");
      } catch {
        setError("تعذّر رفع الصورة.");
      }
    }

    setUploading(false);
    router.refresh();
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleDelete(imageId: number) {
    await fetch(`/api/admin/products/${productId}/images?imageId=${imageId}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div>
      <div className="mb-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
        {images.map((img) => (
          <div key={img.id} className="group relative aspect-square overflow-hidden rounded-xl border border-line bg-blush">
            <Image src={img.url} alt="صورة المنتج" fill className="object-cover" />
            {img.isPrimary && (
              <span className="absolute right-1 top-1 rounded-full bg-caramel p-1 text-cream">
                <Star size={12} fill="currentColor" />
              </span>
            )}
            <button
              type="button"
              onClick={() => handleDelete(img.id)}
              className="absolute left-1 top-1 rounded-full bg-ink/70 p-1 text-cream opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="حذف الصورة"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-line text-ink-2/60 hover:border-caramel hover:text-caramel-dark"
        >
          <Upload size={18} />
          <span className="text-[11px]">{uploading ? "جارٍ الرفع..." : "إضافة صورة"}</span>
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {error && <p className="text-xs text-berry">{error}</p>}
      <p className="text-xs text-ink-2/50">الصورة المعلّمة بنجمة هي الصورة الرئيسية المعروضة في القائمة.</p>
    </div>
  );
}
