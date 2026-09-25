import { PrismaClient } from "@prisma/client";

// يمنع إنشاء اتصال جديد بقاعدة البيانات مع كل Hot Reload أثناء التطوير
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
