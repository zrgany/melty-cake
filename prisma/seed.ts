import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type SeedValue = { label: string; price: number; description?: string; isDefault?: boolean };
type SeedGroup = {
  name: string;
  type: "SINGLE" | "MULTI";
  priceMode: "OVERRIDE" | "DELTA";
  isRequired: boolean;
  values: SeedValue[];
};
type SeedProduct = {
  name: string;
  slug: string;
  description?: string;
  basePrice: number;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  allowCakeMessage?: boolean;
  groups?: SeedGroup[];
};
type SeedCategory = { name: string; slug: string; image?: string; products: SeedProduct[] };

// نكهات أكواب السعادة (بأوصافها كما وردت في القائمة الأصلية)
const CUP_FLAVORS: SeedValue[] = [
  { label: "كلاسيك", price: 0, description: "كريمة شوكولاتة بالحليب مع صوص شوكولاتة غني." },
  { label: "ككو سادة", price: 0, description: "كريمة شوكولاتة ناعمة بطعم الكاكاو الأصيل." },
  { label: "دارك", price: 0, description: "شوكولاتة داكنة بطعم غني وعميق لا يقاوم." },
  { label: "كندر", price: 0, description: "كريمة كندر مع شوكولاتة بالحليب وطبقة مقرمشة." },
  { label: "لوتس", price: 0, description: "كريمة لوتس مع بسكويت لوتس وصوص كراميل خاص." },
  { label: "كراميل", price: 0, description: "كريمة كراميل ناعمة بصوص كراميل غني." },
  { label: "فراولة", price: 0, description: "كريمة فراولة ناعمة مع صوص فراولة طبيعي." },
  { label: "أوريو", price: 0, description: "كريمة وقطع أوريو بمزيج مثالي." },
  { label: "كريم بالككو", price: 0, description: "كريمة ناعمة بطعم الشوكولاتة الغني." },
  { label: "بستاشيو", price: 0, description: "كريمة فستق حلبي فاخرة بطعم لا يُنسى." },
  { label: "مشكل كل النكهات", price: 0, description: "تشكيلة من جميع النكهات في كوب واحد." },
];

const MELTI_BOX_FLAVORS: SeedValue[] = [
  { label: "فراولة", price: 0, description: "كريمة ناعمة مع طبقة فراولة طبيعية." },
  { label: "أوريو", price: 0, description: "كريمة الأوريو مع طبقة بسكويت الأوريو المطحون." },
  { label: "فستق ميلتي", price: 0, description: "كريمة فستق أصلية مع صوص شوكولاتة وقطع فستق محمص." },
  { label: "لوتس", price: 0, description: "كريمة لوتس مع بسكويت لوتس وصوص كراميل خاص." },
  { label: "وايت شوكو", price: 0, description: "شوكولاتة بيضاء مع صوص شوكولاتة ناعمة ورشة كاكاو." },
  { label: "تربل شوكولاتة", price: 0, description: "ثلاث طبقات من الشوكولاتة البيضاء والحليب والداكنة." },
  { label: "دارك شوكولاتة", price: 0, description: "شوكولاتة داكنة غنية لعشاق المذاق الداكن." },
  { label: "شوكولاتة كلاسيك", price: 0, description: "كريمة شوكولاتة بالحليب مع صوص شوكولاتة غني." },
];

const OCCASION_FLAVORS: SeedValue[] = ["فراولة", "فانيليا", "ككو", "كرنش", "كراميل", "بستاشيو"].map(
  (label) => ({ label, price: 0 })
);

const SWEET_FLAVORS: SeedValue[] = [
  "كلاسيك ككو",
  "ككو سادة",
  "دارك",
  "كندر",
  "لوتس",
  "كراميل",
  "فراولة",
  "أوريو",
  "كريم بالككو",
  "بستاشيو",
  "مشكل كل النكهات",
].map((label) => ({ label, price: 0 }));

const HAPPINESS_FLAVORS: SeedValue[] = [
  "كلاسيك ككو",
  "ككو سادة",
  "دارك",
  "كندر",
  "لوتس",
  "كراميل",
  "فراولة",
  "أوريو",
  "كريم بالككو/فانيليا",
  "بستاشيو",
  "مشكل جميع النكهات",
].map((label) => ({ label, price: 0 }));

const CATEGORIES: SeedCategory[] = [
  {
    name: "الكيكات",
    slug: "cakes",
    products: [
      {
        name: "كيك سادة",
        slug: "cake-plain",
        description: "كيك طري بطعم مميز لكل الأوقات",
        basePrice: 7000,
      },
      {
        name: "كيك ككو",
        slug: "cake-cocoa",
        description: "كيك غني بتشكيلة من الصوصات الشهية",
        basePrice: 8000,
      },
      {
        name: "كيك بركاني",
        slug: "cake-volcano",
        description: "كيك بطبقات ذائبة وقوام غني",
        basePrice: 9000,
        isBestSeller: true,
      },
      {
        name: "كيك الحليب",
        slug: "cake-milk",
        basePrice: 1500, // أقل سعر متاح (القطعة مفرد)؛ السعر الفعلي دائماً من مجموعة "الحجم" OVERRIDE أدناه
        groups: [
          {
            name: "الحجم",
            type: "SINGLE",
            priceMode: "OVERRIDE",
            isRequired: true,
            values: [
              { label: "صينية (6 قطع)", price: 8500, isDefault: true },
              { label: "القطعة مفرد", price: 1500 },
            ],
          },
        ],
      },
      {
        name: "البسبوسة",
        slug: "basbousa",
        basePrice: 1500, // أقل سعر متاح (القطعة مفرد)؛ السعر الفعلي دائماً من مجموعة "الحجم" OVERRIDE أدناه
        groups: [
          {
            name: "الحجم",
            type: "SINGLE",
            priceMode: "OVERRIDE",
            isRequired: true,
            values: [
              { label: "صينية (6 قطع)", price: 8000, isDefault: true },
              { label: "القطعة مفرد", price: 1500 },
            ],
          },
        ],
      },
      {
        name: "كيك المناسبات",
        slug: "occasion-cake",
        description: "كيك مخصص للمناسبات مع إمكانية كتابة عبارتك عليه",
        basePrice: 7000,
        isFeatured: true,
        isBestSeller: true,
        allowCakeMessage: true,
        groups: [
          {
            name: "الحجم",
            type: "SINGLE",
            priceMode: "OVERRIDE",
            isRequired: true,
            values: [
              { label: "ميني", price: 7000, isDefault: true },
              { label: "وسط", price: 12000 },
              { label: "كبير", price: 16000 },
            ],
          },
          {
            name: "النكهة",
            type: "SINGLE",
            priceMode: "DELTA",
            isRequired: true,
            values: OCCASION_FLAVORS,
          },
        ],
      },
    ],
  },
  {
    name: "الحلويات",
    slug: "desserts",
    products: [
      {
        name: "سينابون",
        slug: "cinnabon",
        description: "صينية عائلية",
        basePrice: 5000,
      },
      {
        name: "خلية النحل",
        slug: "honeycomb",
        basePrice: 4000, // أقل سعر متاح (صحن صغير)؛ السعر الفعلي دائماً من مجموعة "الحجم" OVERRIDE أدناه
        groups: [
          {
            name: "الحجم",
            type: "SINGLE",
            priceMode: "OVERRIDE",
            isRequired: true,
            values: [
              { label: "صينية", price: 6000, isDefault: true },
              { label: "صحن صغير", price: 4000 },
            ],
          },
          {
            name: "النكهة",
            type: "SINGLE",
            priceMode: "DELTA",
            isRequired: true,
            values: [
              { label: "لوتس", price: 0 },
              { label: "ككو", price: 0 },
            ],
          },
        ],
      },
      {
        name: "بان كيك",
        slug: "pancake",
        basePrice: 2000,
        groups: [
          {
            name: "النوع",
            type: "SINGLE",
            priceMode: "OVERRIDE",
            isRequired: true,
            values: [
              { label: "صحن عائلي (مع صوصات مشكلة وموز)", price: 5000 },
              { label: "صحن نفر", price: 2000, isDefault: true },
            ],
          },
        ],
      },
      {
        name: "سويت مقلوبة",
        slug: "sweet-moqalaba",
        description: "طبقات من الكيك والكريمة والنكهات.",
        basePrice: 7500,
        isFeatured: true,
        groups: [
          {
            name: "النكهة",
            type: "SINGLE",
            priceMode: "DELTA",
            isRequired: true,
            values: SWEET_FLAVORS,
          },
        ],
      },
      {
        name: "صحن السعادة بالككو",
        slug: "happiness-plate",
        description: "طبقات من الكيك والكريمة والككو.",
        basePrice: 5000,
        groups: [
          {
            name: "الحجم",
            type: "SINGLE",
            priceMode: "DELTA",
            isRequired: true,
            values: [
              { label: "صغير — يناسب 2-3 أشخاص", price: 0, isDefault: true },
              { label: "وسط — يناسب 6-7 أشخاص", price: 0 },
              { label: "كبير — يناسب 8-10 أشخاص", price: 0 },
            ],
          },
          {
            name: "النكهة",
            type: "SINGLE",
            priceMode: "DELTA",
            isRequired: true,
            values: HAPPINESS_FLAVORS,
          },
          {
            name: "الإضافات",
            type: "MULTI",
            priceMode: "DELTA",
            isRequired: false,
            values: [
              { label: "صوص كراميل خاص", price: 0 },
              { label: "شوكولاتة بلجيكية مبشورة", price: 0 },
              { label: "فستق حلبي", price: 0 },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "أكواب وعلب الكيك",
    slug: "cups-boxes",
    products: [
      {
        name: "أكواب السعادة",
        slug: "happiness-cups",
        basePrice: 1250, // أقل سعر متاح (مربع صغير)؛ السعر الفعلي دائماً من مجموعة "الحجم" OVERRIDE أدناه
        isFeatured: true,
        isBestSeller: true,
        groups: [
          {
            name: "الحجم",
            type: "SINGLE",
            priceMode: "OVERRIDE",
            isRequired: true,
            values: [
              { label: "مربع صغير", price: 1250 },
              { label: "مربع كبير", price: 1500 },
              { label: "كوب صغير", price: 1500, isDefault: true },
              { label: "كوب كبير", price: 2000 },
            ],
          },
          {
            name: "النكهة",
            type: "SINGLE",
            priceMode: "DELTA",
            isRequired: true,
            values: CUP_FLAVORS,
          },
        ],
      },
      {
        name: "علب الكيك المربعة",
        slug: "melti-boxes",
        description: "Melti Boxes — السعر لكل قطعة",
        basePrice: 1500,
        groups: [
          {
            name: "النكهة",
            type: "SINGLE",
            priceMode: "DELTA",
            isRequired: true,
            values: MELTI_BOX_FLAVORS,
          },
        ],
      },
    ],
  },
  {
    name: "المشروبات المنعشة",
    slug: "drinks",
    products: [
      { name: "بلو بيري", slug: "drink-blueberry", description: "موهيتو بنكهة البلو بيري المنعش مع الليمون والنعناع.", basePrice: 2000 },
      { name: "ريد بيري", slug: "drink-redberry", description: "موهيتو بنكهة التوت الأحمر المنعش مع الليمون والنعناع.", basePrice: 2000 },
      { name: "فراولة", slug: "drink-strawberry", description: "موهيتو بنكهة الفراولة المنعشة مع الليمون والنعناع.", basePrice: 2000 },
      { name: "توت", slug: "drink-berries", description: "موهيتو بنكهة التوت المنعشة مع الليمون والنعناع.", basePrice: 2000 },
      { name: "ليمون", slug: "drink-lemon", description: "موهيتو بنكهة الليمون المنعشة مع الليمون والنعناع.", basePrice: 2000 },
      { name: "ليمون ونعناع", slug: "drink-lemon-mint", description: "موهيتو بنكهة الليمون والنعناع المنعشة.", basePrice: 2000 },
      { name: "شاي كركديه مثلج", slug: "drink-hibiscus", description: "شاي كركديه منعش بطعم طبيعي ولون جميل.", basePrice: 2000 },
      { name: "آيس كوفي", slug: "drink-icecoffee", description: "قهوة باردة غنية وممزوجة بالحليب بطعم ناعم ومنعش.", basePrice: 2000, isBestSeller: true },
    ],
  },
  {
    name: "المأكولات العراقية",
    slug: "iraqi-food",
    products: [
      {
        name: "كبة تمن",
        slug: "kubba-timman",
        description: "بنكهة تقليدية مميزة — صحن 20 كباية",
        basePrice: 8000,
      },
      {
        name: "كبة مرك",
        slug: "kubba-marag",
        description: "بطعم البيت العراقي الأصيل",
        basePrice: 6000,
        isBestSeller: true,
        groups: [
          {
            name: "الكمية",
            type: "SINGLE",
            priceMode: "OVERRIDE",
            isRequired: true,
            values: [
              { label: "5 قطع", price: 6000, isDefault: true },
              { label: "10 قطع", price: 11000 },
              { label: "15 قطعة", price: 17000 },
              { label: "20 قطعة", price: 22000 },
            ],
          },
        ],
      },
      {
        name: "الدولمة",
        slug: "dolma",
        description: "طعم أصيل مثل البيت",
        basePrice: 5000, // أقل سعر متاح (سلك - حجم صغير)؛ السعر الفعلي دائماً من مجموعة OVERRIDE أدناه
        groups: [
          {
            name: "النوع والحجم",
            type: "SINGLE",
            priceMode: "OVERRIDE",
            isRequired: true,
            values: [
              { label: "سلك - حجم عادي", price: 7000, isDefault: true },
              { label: "ورق عنب - حجم عادي", price: 8000 },
              { label: "سلك - حجم صغير", price: 5000 },
              { label: "ورق عنب - حجم صغير", price: 6000 },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "المعجنات",
    slug: "pastries",
    products: [
      {
        name: "المعجنات",
        slug: "pastries-tray",
        description: "مخبوزة طازجة يومياً",
        basePrice: 5000,
        groups: [
          {
            name: "الحجم",
            type: "SINGLE",
            priceMode: "OVERRIDE",
            isRequired: true,
            values: [
              { label: "صحن صغير (7 قطع)", price: 5000, isDefault: true },
              { label: "صحن كبير (10 قطع)", price: 7500 },
              { label: "صحن 16 قطعة مشكل", price: 12000 },
            ],
          },
        ],
      },
    ],
  },
];

async function seedCatalog() {
  const existing = await prisma.category.count();
  if (existing > 0) {
    console.log("⏭️  توجد تصنيفات في قاعدة البيانات مسبقاً — تم تخطي زرع القائمة لتفادي التكرار.");
    return;
  }

  for (const [ci, cat] of CATEGORIES.entries()) {
    const category = await prisma.category.create({
      data: { name: cat.name, slug: cat.slug, sortOrder: ci },
    });

    for (const [pi, prod] of cat.products.entries()) {
      await prisma.product.create({
        data: {
          name: prod.name,
          slug: prod.slug,
          description: prod.description ?? null,
          basePrice: prod.basePrice,
          categoryId: category.id,
          isFeatured: prod.isFeatured ?? false,
          isBestSeller: prod.isBestSeller ?? false,
          allowCakeMessage: prod.allowCakeMessage ?? false,
          sortOrder: pi,
          optionGroups: {
            create: (prod.groups ?? []).map((g, gi) => ({
              name: g.name,
              type: g.type,
              priceMode: g.priceMode,
              isRequired: g.isRequired,
              sortOrder: gi,
              values: {
                create: g.values.map((v, vi) => ({
                  label: v.label,
                  description: v.description ?? null,
                  price: v.price,
                  isDefault: v.isDefault ?? false,
                  sortOrder: vi,
                })),
              },
            })),
          },
        },
      });
    }
    console.log(`✔️  ${cat.name}: ${cat.products.length} منتج`);
  }

  console.log(
    "\n⚠️  ملاحظة مهمة: عناصر «البوكسات» (Mini/Family/Party Box) وبعض الإضافات في القائمة الأصلية" +
      "\n   لم تأتِ بأسعار محددة، فلم تُضف إلى القائمة تجنباً لاختراع أسعار." +
      "\n   يمكن لصاحب المشروع إضافتها لاحقاً من لوحة التحكم بالسعر الصحيح.\n"
  );
}

async function seedBusinessSettings() {
  await prisma.businessSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "Melty Cake",
      currency: "IQD",
      welcomeMessage: "أهل الدبس يتدللون ❤️",
      instagramUrl: "https://www.instagram.com/meltycakes1/",
      // الهاتف / واتساب / العنوان / ساعات العمل تُترك فارغة عمداً
      // صاحب المشروع يضيفها من: لوحة التحكم ← الإعدادات
    },
  });
  console.log("✔️  تم ضبط إعدادات المشروع الأساسية (رقم الهاتف وواتساب متروكان فارغين عمداً)");
}

async function seedFirstAdmin() {
  const phone = process.env.FIRST_ADMIN_PHONE?.trim();
  const password = process.env.FIRST_ADMIN_PASSWORD;
  const name = process.env.FIRST_ADMIN_NAME?.trim() || "المدير";

  if (!phone || !password) {
    console.log("ℹ️  لم يتم إنشاء حساب أدمن تلقائياً (FIRST_ADMIN_PHONE/PASSWORD غير مضبوطة).");
    console.log("   استخدم بدلاً من ذلك: npm run create-admin");
    return;
  }

  const exists = await prisma.adminUser.findUnique({ where: { phone } });
  if (exists) {
    console.log(`ℹ️  يوجد أدمن مسبقاً بالرقم ${phone}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.adminUser.create({ data: { name, phone, passwordHash } });
  console.log(`✔️  تم إنشاء حساب أدمن جديد: ${phone}`);
}

async function main() {
  await seedCatalog();
  await seedBusinessSettings();
  await seedFirstAdmin();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
