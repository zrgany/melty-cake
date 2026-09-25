import { z } from "zod";

// رقم هاتف عراقي: يقبل 07xxxxxxxxx أو بصيغة +964
const phoneRegex = /^(?:\+?964|0)?7\d{9}$/;

export const phoneSchema = z
  .string()
  .trim()
  .regex(phoneRegex, "رقم الهاتف غير صحيح.");

export const adminLoginSchema = z.object({
  phone: z.string().trim().min(3),
  password: z.string().min(1),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, "الاسم قصير جداً"),
  phone: phoneSchema,
  password: z.string().min(6, "كلمة المرور يجب ألا تقل عن 6 أحرف"),
});

export const loginSchema = z.object({
  phone: z.string().trim().min(3),
  password: z.string().min(1),
});

// عنصر واحد داخل السلة عند إرسال الطلب: لا يحتوي على أي سعر، فقط معرّفات وكميات
export const checkoutItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().min(1).max(50),
  selectedOptionValueIds: z.array(z.number().int().positive()).default([]),
  cakeMessage: z.string().trim().max(200).optional().nullable(),
  note: z.string().trim().max(300).optional().nullable(),
});

export const checkoutSchema = z.object({
  customerName: z.string().trim().min(2, "يرجى إدخال الاسم"),
  customerPhone: phoneSchema,
  governorate: z.string().trim().max(120).optional().nullable(),
  district: z.string().trim().max(120).optional().nullable(),
  detailedAddress: z.string().trim().min(4, "يرجى إدخال عنوان تفصيلي"),
  deliveryNotes: z.string().trim().max(300).optional().nullable(),
  deliveryZoneId: z.number().int().positive({ message: "يرجى اختيار منطقة التوصيل" }),
  couponCode: z.string().trim().max(50).optional().nullable(),
  items: z.array(checkoutItemSchema).min(1, "السلة فارغة"),
});

export const couponValidateSchema = z.object({
  code: z.string().trim().min(1),
  subtotal: z.number().int().min(0),
});

// ---- الأدمن: المنتجات ----

export const optionValueSchema = z.object({
  id: z.number().int().positive().optional(), // موجود عند التعديل، غائب عند الإضافة
  label: z.string().trim().min(1),
  price: z.number().int().min(0).default(0),
  isDefault: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

export const optionGroupSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().trim().min(1),
  type: z.enum(["SINGLE", "MULTI"]),
  priceMode: z.enum(["OVERRIDE", "DELTA"]),
  isRequired: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  values: z.array(optionValueSchema).min(1),
});

export const productInputSchema = z.object({
  name: z.string().trim().min(2),
  description: z.string().trim().max(2000).optional().nullable(),
  basePrice: z.number().int().min(0),
  categoryId: z.number().int().positive(),
  isFeatured: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isAvailable: z.boolean().default(true),
  allowCakeMessage: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  optionGroups: z.array(optionGroupSchema).default([]),
});

export const orderStatusUpdateSchema = z.object({
  status: z.enum(["RECEIVED", "PREPARING", "READY", "OUT_FOR_DELIVERY", "COMPLETED", "CANCELLED"]),
});

export const businessSettingsSchema = z.object({
  name: z.string().trim().min(1),
  logo: z.string().trim().optional().nullable(),
  description: z.string().trim().max(500).optional().nullable(),
  phone: z.string().trim().max(30).optional().nullable(),
  whatsapp: z.string().trim().max(30).optional().nullable(),
  secondPhone: z.string().trim().max(30).optional().nullable(),
  instagramUrl: z.string().trim().max(300).optional().nullable(),
  facebookUrl: z.string().trim().max(300).optional().nullable(),
  address: z.string().trim().max(300).optional().nullable(),
  workingHours: z.string().trim().max(200).optional().nullable(),
  welcomeMessage: z.string().trim().max(300).optional().nullable(),
  freeDeliveryThreshold: z.number().int().min(0).optional().nullable(),
});

export const deliveryZoneSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().trim().min(1),
  fee: z.number().int().min(0),
  minOrderAmount: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const couponInputSchema = z.object({
  id: z.number().int().positive().optional(),
  code: z.string().trim().min(2).toUpperCase(),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.number().int().positive(),
  minOrderAmount: z.number().int().min(0).default(0),
  usageLimit: z.number().int().positive().optional().nullable(),
  expiresAt: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});
