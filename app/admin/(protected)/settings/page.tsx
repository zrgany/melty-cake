import { prisma } from "@/lib/db";
import SettingsForm from "@/components/admin/SettingsForm";
import DeliveryZonesManager from "@/components/admin/DeliveryZonesManager";
import CouponsManager from "@/components/admin/CouponsManager";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const [settings, zones, coupons] = await Promise.all([
    prisma.businessSettings.findUnique({ where: { id: 1 } }),
    prisma.deliveryZone.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.coupon.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-ink">الإعدادات</h1>

      <SettingsForm
        initial={{
          name: settings?.name ?? "Melty Cake",
          logo: settings?.logo ?? "",
          description: settings?.description ?? "",
          phone: settings?.phone ?? "",
          whatsapp: settings?.whatsapp ?? "",
          secondPhone: settings?.secondPhone ?? "",
          instagramUrl: settings?.instagramUrl ?? "",
          facebookUrl: settings?.facebookUrl ?? "",
          address: settings?.address ?? "",
          workingHours: settings?.workingHours ?? "",
          welcomeMessage: settings?.welcomeMessage ?? "",
          freeDeliveryThreshold:
            settings?.freeDeliveryThreshold != null ? String(settings.freeDeliveryThreshold) : "",
        }}
      />

      <DeliveryZonesManager
        initialZones={zones.map((z) => ({
          id: z.id,
          name: z.name,
          fee: z.fee,
          minOrderAmount: z.minOrderAmount,
          isActive: z.isActive,
        }))}
      />

      <CouponsManager
        initialCoupons={coupons.map((c) => ({
          id: c.id,
          code: c.code,
          type: c.type as "PERCENTAGE" | "FIXED",
          value: c.value,
          minOrderAmount: c.minOrderAmount,
          isActive: c.isActive,
          usedCount: c.usedCount,
          usageLimit: c.usageLimit,
        }))}
      />
    </div>
  );
}
