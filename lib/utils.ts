/** يدمج أسماء أصناف CSS ويتجاهل القيم الفارغة */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** يعرض السعر بالأرقام اللاتينية مع فواصل الآلاف، مطابقاً لصيغة قائمة الأسعار الأصلية (7,000 د.ع) */
export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString("en-US")} د.ع`;
}

/** يحوّل نصاً عربياً أو إنجليزياً إلى slug صالح للروابط */
export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^\u0600-\u06FFa-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** يبني رقم الطلب المعروض مثل #MC-000001 من معرّف الطلب في قاعدة البيانات */
export function formatOrderNumber(id: number): string {
  return `MC-${String(id).padStart(6, "0")}`;
}

/** ينسّق تاريخاً ووقتاً بصيغة عربية قصيرة */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("ar-IQ", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

