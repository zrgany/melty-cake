// حالات الطلب بالترتيب الطبيعي لمسارها (للتتبع Timeline)
export const ORDER_STATUS_FLOW = [
  "RECEIVED",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "COMPLETED",
] as const;

export type OrderStatus = (typeof ORDER_STATUS_FLOW)[number] | "CANCELLED";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  RECEIVED: "تم استلام الطلب",
  PREPARING: "قيد التحضير",
  READY: "جاهز",
  OUT_FOR_DELIVERY: "خرج للتوصيل",
  COMPLETED: "مكتمل",
  CANCELLED: "ملغي",
};

export const ORDER_STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  ...ORDER_STATUS_FLOW.map((v) => ({ value: v, label: ORDER_STATUS_LABELS[v] })),
  { value: "CANCELLED", label: ORDER_STATUS_LABELS.CANCELLED },
];

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH_ON_DELIVERY: "الدفع عند الاستلام",
};

export const OPTION_GROUP_TYPES = ["SINGLE", "MULTI"] as const;
export const OPTION_PRICE_MODES = ["OVERRIDE", "DELTA"] as const;
export const COUPON_TYPES = ["PERCENTAGE", "FIXED"] as const;

// نصوص الحالات الفارغة والأخطاء الموحّدة في الموقع (حسب البند 41-43 من المواصفة)
export const EMPTY_STATES = {
  cart: "سلتك فارغة… خلي نختارلك شي طيب ❤️",
  favorites: "ما عندك منتجات مفضلة بعد.",
  orders: "ما عندك طلبات حالياً.",
  search: "ما لقينا اللي تبحث عنه… جرّب كلمة ثانية ❤️",
  noDeliveryZones: "التوصيل غير متاح حالياً بمنطقتك، تواصل معنا مباشرة لإكمال الطلب.",
};

export const ERROR_MESSAGES = {
  generic: "حدث خطأ، حاول مرة أخرى.",
  productUnavailable: "هذا المنتج غير متوفر حالياً.",
  chooseSize: "يرجى اختيار الحجم.",
  chooseFlavor: "يرجى اختيار النكهة.",
  invalidPhone: "رقم الهاتف غير صحيح.",
  invalidCoupon: "رمز الخصم غير صالح.",
};
