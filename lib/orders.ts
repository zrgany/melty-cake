import { randomBytes } from "crypto";
import { prisma } from "./db";
import { computeOrderPricing } from "./pricing";
import { formatOrderNumber } from "./utils";
import { ORDER_STATUS_LABELS, type OrderStatus } from "./constants";

function generateTrackingToken(): string {
  return randomBytes(16).toString("hex");
}

export type CreateOrderInput = {
  userId?: number | null;
  customerName: string;
  customerPhone: string;
  governorate?: string | null;
  district?: string | null;
  detailedAddress: string;
  deliveryNotes?: string | null;
  deliveryZoneId: number;
  couponCode?: string | null;
  items: {
    productId: number;
    quantity: number;
    selectedOptionValueIds: number[];
    cakeMessage?: string | null;
    note?: string | null;
  }[];
};

/** ينشئ الطلب داخل معاملة واحدة: يحسب السعر من الخادم، يحفظ لقطة الأسعار، وينشئ إشعاراً */
export async function createOrder(input: CreateOrderInput) {
  // كل حساب السعر يتم هنا، من قاعدة البيانات مباشرة - لا نثق بأي رقم قادم من العميل
  const pricing = await computeOrderPricing({
    items: input.items,
    deliveryZoneId: input.deliveryZoneId,
    couponCode: input.couponCode,
  });

  const trackingToken = generateTrackingToken();

  return prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        userId: input.userId ?? null,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        governorate: input.governorate || null,
        district: input.district || null,
        detailedAddress: input.detailedAddress,
        deliveryNotes: input.deliveryNotes || null,
        deliveryZoneId: pricing.deliveryZoneId,
        subtotal: pricing.subtotal,
        deliveryFee: pricing.deliveryFee,
        discount: pricing.discount,
        total: pricing.total,
        couponId: pricing.couponId,
        trackingToken,
        status: "RECEIVED",
        items: {
          create: pricing.lines.map((line) => ({
            productId: line.productId,
            productName: line.productName,
            unitPrice: line.unitPrice,
            quantity: line.quantity,
            selectedOptions: line.selectedOptions,
            cakeMessage: line.cakeMessage,
            note: line.note,
            lineTotal: line.lineTotal,
          })),
        },
      },
      include: { items: true },
    });

    if (pricing.couponId) {
      await tx.coupon.update({
        where: { id: pricing.couponId },
        data: { usedCount: { increment: 1 } },
      });
      await tx.couponUsage.create({
        data: { couponId: pricing.couponId, userId: input.userId ?? null, orderId: created.id },
      });
    }

    if (input.userId) {
      await tx.notification.create({
        data: {
          userId: input.userId,
          title: "تم استلام طلبك",
          body: `طلبك رقم ${formatOrderNumber(created.id)} تم استلامه وسيتم تحضيره قريباً.`,
        },
      });
    }

    return created;
  });
}

export async function updateOrderStatus(
  orderId: number,
  status: OrderStatus,
  admin?: { id: number; name: string }
) {
  const order = await prisma.order.update({ where: { id: orderId }, data: { status } });

  if (order.userId) {
    await prisma.notification.create({
      data: {
        userId: order.userId,
        title: `تحديث طلبك ${formatOrderNumber(order.id)}`,
        body: ORDER_STATUS_LABELS[status],
      },
    });
  }

  await prisma.auditLog.create({
    data: {
      adminId: admin?.id ?? null,
      adminName: admin?.name ?? null,
      action: "ORDER_STATUS_UPDATE",
      entity: "Order",
      entityId: order.id,
      meta: { status },
    },
  });

  return order;
}
