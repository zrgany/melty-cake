import { requireAdmin } from "@/lib/auth";
import Sidebar from "@/components/admin/Sidebar";

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-cream" dir="rtl">
      <Sidebar adminName={admin.name} />
      <main className="flex-1 pb-20 md:pb-0">
        <div className="mx-auto max-w-6xl p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
