import Link from "next/link";
import EmptyState from "@/components/storefront/EmptyState";

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 font-display text-2xl font-bold text-ink">حسابي</h1>
      <EmptyState
        message="حسابات العملاء (تسجيل الدخول، الطلبات السابقة، العناوين المحفوظة) قيد الإضافة قريباً. تقدر تطلب الآن كضيف بدون تسجيل، وتتابع طلبك من الرابط اللي توصلك بعد الطلب مباشرة."
        icon="🙂"
        action={
          <Link href="/#categories" className="btn-primary">
            ابدأ طلبك
          </Link>
        }
      />
    </div>
  );
}
