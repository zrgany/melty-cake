import { NextRequest, NextResponse } from "next/server";
import { checkoutSchema } from "@/lib/validation";
import { createOrder } from "@/lib/orders";
import { PricingError } from "@/lib/pricing";
import { getCurrentCustomer } from "@/lib/auth";
import { formatOrderNumber } from "@/lib/utils";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "بيانات الطلب غير صالحة." }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message || "بيانات الطلب غير صالحة.";
    return NextResponse.json({ error: firstError }, { status: 400 });
  }

  // إذا كان هناك عميل مسجّل دخوله، يُربط الطلب بحسابه؛ خلاف ذلك يبقى طلب ضيف (Guest Checkout)
  const customer = await getCurrentCustomer();

  try {
    const order = await createOrder({
      userId: customer?.id ?? null,
      customerName: parsed.data.customerName,
      customerPhone: parsed.data.customerPhone,
      governorate: parsed.data.governorate,
      district: parsed.data.district,
      detailedAddress: parsed.data.detailedAddress,
      deliveryNotes: parsed.data.deliveryNotes,
      deliveryZoneId: parsed.data.deliveryZoneId,
      couponCode: parsed.data.couponCode,
      items: parsed.data.items,
    });

    return NextResponse.json({
      order: {
        id: order.id,
        orderNumber: formatOrderNumber(order.id),
        trackingToken: order.trackingToken,
        total: order.total,
      },
    });
  } catch (err) {
    if (err instanceof PricingError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("Order creation failed:", err);
    return NextResponse.json({ error: "حدث خطأ، حاول مرة أخرى." }, { status: 500 });
  }
}
