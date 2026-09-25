import { prisma } from "@/lib/db";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";
import BottomNav from "@/components/storefront/BottomNav";

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const [settings, categories] = await Promise.all([
    prisma.businessSettings.findUnique({ where: { id: 1 } }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  const businessName = settings?.name || "Melty Cake";

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        businessName={businessName}
        categories={categories.map((c) => ({ name: c.name, slug: c.slug }))}
      />
      <main className="flex-1">{children}</main>
      <Footer
        settings={{
          name: businessName,
          welcomeMessage: settings?.welcomeMessage ?? null,
          phone: settings?.phone ?? null,
          whatsapp: settings?.whatsapp ?? null,
          instagramUrl: settings?.instagramUrl ?? null,
          address: settings?.address ?? null,
          workingHours: settings?.workingHours ?? null,
        }}
      />
      <BottomNav />
    </div>
  );
}
