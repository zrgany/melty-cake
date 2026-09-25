import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const [, , name, phone, password] = process.argv;

  if (!name || !phone || !password) {
    console.log("الاستخدام:");
    console.log('  npm run create-admin -- "الاسم الكامل" "07xxxxxxxxx" "كلمة المرور"');
    process.exit(1);
  }

  if (password.length < 6) {
    console.error("❌ كلمة المرور يجب ألا تقل عن 6 أحرف.");
    process.exit(1);
  }

  const existing = await prisma.adminUser.findUnique({ where: { phone } });
  if (existing) {
    console.error(`❌ يوجد أدمن مسبقاً بهذا الرقم: ${phone}`);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const admin = await prisma.adminUser.create({ data: { name, phone, passwordHash } });

  console.log("✅ تم إنشاء حساب الأدمن بنجاح.");
  console.log(`   الاسم: ${admin.name}`);
  console.log(`   الهاتف: ${admin.phone}`);
  console.log("   يمكنك الآن الدخول من: /admin/login");
}

main()
  .catch((e) => {
    console.error("❌ حدث خطأ:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
