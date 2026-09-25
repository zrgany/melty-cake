import Link from "next/link";
import Image from "next/image";
import { Instagram, Truck, Heart, Clock3 } from "lucide-react";
import { prisma } from "@/lib/db";
import ProductCard, { type ProductCardData } from "@/components/storefront/ProductCard";
import CategoryChip from "@/components/storefront/CategoryChip";
import SectionHeading from "@/components/storefront/SectionHeading";

export const dynamic = "force-dynamic";

async function getHomeData() {
  const [settings, categories, bestSellers, featured, desserts, iraqiFood, drinks, banners] =
    await Promise.all([
      prisma.businessSettings.findUnique({ where: { id: 1 } }),
      prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
      prisma.product.findMany({
        where: { isAvailable: true, isBestSeller: true },
        include: { images: { where: { isPrimary: true }, take: 1 }, optionGroups: { select: { id: true } } },
        take: 8,
        orderBy: { sortOrder: "asc" },
      }),
      prisma.product.findMany({
        where: { isAvailable: true, isFeatured: true },
        include: { images: { where: { isPrimary: true }, take: 1 }, optionGroups: { select: { id: true } } },
        take: 8,
        orderBy: { sortOrder: "asc" },
      }),
      prisma.product.findMany({
        where: { isAvailable: true, category: { slug: "desserts" } },
        include: { images: { where: { isPrimary: true }, take: 1 }, optionGroups: { select: { id: true } } },
        take: 6,
        orderBy: { sortOrder: "asc" },
      }),
      prisma.product.findMany({
        where: { isAvailable: true, category: { slug: "iraqi-food" } },
        include: { images: { where: { isPrimary: true }, take: 1 }, optionGroups: { select: { id: true } } },
        take: 6,
        orderBy: { sortOrder: "asc" },
      }),
      prisma.product.findMany({
        where: { isAvailable: true, category: { slug: "drinks" } },
        include: { images: { where: { isPrimary: true }, take: 1 }, optionGroups: { select: { id: true } } },
        take: 8,
        orderBy: { sortOrder: "asc" },
      }),
      prisma.banner.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    ]);

  return { settings, categories, bestSellers, featured, desserts, iraqiFood, drinks, banners };
}

function toCardData(p: {
  slug: string;
  name: string;
  basePrice: number;
  description: string | null;
  isBestSeller: boolean;
  images: { url: string }[];
  optionGroups: { id: number }[];
}): ProductCardData {
  return {
    slug: p.slug,
    name: p.name,
    basePrice: p.basePrice,
    description: p.description,
    image: p.images[0]?.url ?? null,
    isBestSeller: p.isBestSeller,
    hasOptions: p.optionGroups.length > 0,
  };
}

export default async function HomePage() {
  const { settings, categories, bestSellers, featured, desserts, iraqiFood, drinks, banners } =
    await getHomeData();

  const businessName = settings?.name || "Melty Cake";
  const welcomeMessage = settings?.welcomeMessage || "أهل الدبس يتدللون ❤️";
  const hasContact = settings?.phone || settings?.whatsapp || settings?.address || settings?.workingHours;

  return (
    <div>
      <section className="relative overflow-hidden bg-ink">
        <div className="pointer-events-none absolute -top-24 left-[-4rem] h-72 w-72 rounded-full bg-caramel/30 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-6rem] right-4 h-72 w-72 rounded-full bg-berry/25 blur-3xl" />
        <div className="relative mx-auto flex max-w-5xl flex-col items-start gap-4 px-4 py-16 md:py-24">
          <span className="rounded-full bg-cream/10 px-3 py-1 text-xs font-medium text-cream/90">
            توصيل لأهل قضاء الدبس
          </span>
          <h1 className="max-w-md font-display text-3xl font-bold leading-tight text-cream md:text-5xl">
            {welcomeMessage}
          </h1>
          <p className="max-w-sm text-sm leading-relaxed text-cream/80 md:text-base">
            كيك، حلويات، وأكواب سعادة، ومأكولات عراقية أصيلة — نجهزها طازجة ونوصلها لباب بيتك.
          </p>
          <Link href="/#categories" className="btn-primary mt-2">
            اطلب الآن
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4">
        <section id="categories" className="scroll-mt-20 py-10">
          <SectionHeading title="الأقسام" />
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((c) => (
              <CategoryChip key={c.slug} name={c.name} slug={c.slug} />
            ))}
          </div>
        </section>

        {bestSellers.length > 0 && (
          <section className="py-6">
            <SectionHeading title="الأكثر طلباً" />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {bestSellers.map((p) => (
                <ProductCard key={p.id} product={toCardData(p)} />
              ))}
            </div>
          </section>
        )}

        {featured.length > 0 && (
          <section className="py-6">
            <SectionHeading title="مختارات ميلتي" />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {featured.map((p) => (
                <ProductCard key={p.id} product={toCardData(p)} />
              ))}
            </div>
          </section>
        )}

        {banners.length > 0 && (
          <section className="py-6">
            <SectionHeading title="عروض وأفكار" />
            <div className="grid gap-4 md:grid-cols-2">
              {banners.map((b) => (
                <div key={b.id} className="card-surface overflow-hidden">
                  {b.image && (
                    <div className="relative aspect-[16/9]">
                      <Image src={b.image} alt={b.title} fill className="object-cover" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-display text-lg font-semibold text-ink">{b.title}</h3>
                    {b.description && <p className="mt-1 text-sm text-ink-2">{b.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {desserts.length > 0 && (
          <section className="py-6">
            <SectionHeading title="الحلويات" href="/category/desserts" />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {desserts.map((p) => (
                <ProductCard key={p.id} product={toCardData(p)} />
              ))}
            </div>
          </section>
        )}

        {iraqiFood.length > 0 && (
          <section className="py-6">
            <SectionHeading title="المأكولات العراقية" href="/category/iraqi-food" />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {iraqiFood.map((p) => (
                <ProductCard key={p.id} product={toCardData(p)} />
              ))}
            </div>
          </section>
        )}

        {drinks.length > 0 && (
          <section className="py-6">
            <SectionHeading title="المشروبات المنعشة" href="/category/drinks" />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {drinks.map((p) => (
                <ProductCard key={p.id} product={toCardData(p)} />
              ))}
            </div>
          </section>
        )}

        <section className="py-10">
          <SectionHeading title={`ليش ${businessName}؟`} />
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="card-surface p-5">
              <Heart className="text-berry" size={22} />
              <h3 className="mt-3 text-sm font-semibold text-ink">وصفات بيتية</h3>
              <p className="mt-1 text-xs leading-relaxed text-ink-2/80">مكونات طازجة ونكهات مدروسة بعناية.</p>
            </div>
            <div className="card-surface p-5">
              <Truck className="text-caramel-dark" size={22} />
              <h3 className="mt-3 text-sm font-semibold text-ink">توصيل لأهل الدبس</h3>
              <p className="mt-1 text-xs leading-relaxed text-ink-2/80">نوصل طلبك بعناية لباب بيتك.</p>
            </div>
            <div className="card-surface p-5">
              <Clock3 className="text-ink-2" size={22} />
              <h3 className="mt-3 text-sm font-semibold text-ink">تحضير يومي</h3>
              <p className="mt-1 text-xs leading-relaxed text-ink-2/80">نجهز طلبك بعد تأكيد الطلب مباشرة.</p>
            </div>
          </div>
        </section>

        {settings?.instagramUrl && (
          <section className="py-6">
            <a
              href={settings.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="card-surface flex items-center justify-between gap-4 p-5 transition-colors hover:border-caramel"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-tr from-caramel to-berry text-cream">
                  <Instagram size={20} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">تابعونا على انستغرام</p>
                  <p className="text-xs text-ink-2/70">meltycakes1</p>
                </div>
              </div>
              <span className="btn-ghost">زيارة الحساب</span>
            </a>
          </section>
        )}

        <section className="py-6" id="contact">
          <SectionHeading title="تواصل معنا" />
          <div className="card-surface flex flex-wrap items-center justify-between gap-4 p-5">
            <div className="space-y-1 text-sm text-ink-2">
              {settings?.phone && <p>هاتف: {settings.phone}</p>}
              {settings?.whatsapp && <p>واتساب: {settings.whatsapp}</p>}
              {settings?.address && <p>{settings.address}</p>}
              {settings?.workingHours && <p>{settings.workingHours}</p>}
              {!hasContact && <p className="text-ink-2/60">تابعونا على انستغرام لأي استفسار</p>}
            </div>
            <Link href="/#categories" className="btn-primary">
              اطلب الآن
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
