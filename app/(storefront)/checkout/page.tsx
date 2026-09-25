import { prisma } from "@/lib/db";
import CheckoutForm from "@/components/storefront/CheckoutForm";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const zones = await prisma.deliveryZone.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 font-display text-2xl font-bold text-ink">إتمام الطلب</h1>
      <CheckoutForm
        deliveryZones={zones.map((z) => ({ id: z.id, name: z.name, fee: z.fee, minOrderAmount: z.minOrderAmount }))}
      />
    </div>
  );
}
