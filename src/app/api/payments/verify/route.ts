import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { writeCart } from "@/lib/cart";
import { jsonError } from "@/lib/http";
import { z } from "zod";

const schema = z.object({
  orderId: z.string(),
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Invalid payment payload.");

  const ok = verifyPaymentSignature(
    parsed.data.razorpay_order_id,
    parsed.data.razorpay_payment_id,
    parsed.data.razorpay_signature,
  );
  if (!ok) return jsonError("Payment signature did not match.", 400);

  const order = await prisma.order.findUnique({
    where: { id: parsed.data.orderId },
    include: { items: true },
  });
  if (!order) return jsonError("Order not found.", 404);
  if (order.razorpayOrderId !== parsed.data.razorpay_order_id) {
    return jsonError("Order mismatch.", 400);
  }

  if (order.paymentStatus !== "CAPTURED") {
    await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "CAPTURED",
          status: "PAID",
          razorpayPaymentId: parsed.data.razorpay_payment_id,
          razorpaySignature: parsed.data.razorpay_signature,
        },
      }),
      ...order.items.map((item) =>
        prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.qty } },
        }),
      ),
    ]);
    await writeCart([]);
  }

  return NextResponse.json({ ok: true, orderNumber: order.orderNumber });
}
