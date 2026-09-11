import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-razorpay-signature") || "";
  if (!verifyWebhookSignature(body, signature)) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  const event = JSON.parse(body) as {
    event?: string;
    payload?: { payment?: { entity?: { order_id?: string; id?: string; status?: string } } };
  };

  const payment = event.payload?.payment?.entity;
  if (event.event === "payment.captured" && payment?.order_id) {
    const order = await prisma.order.findFirst({
      where: { razorpayOrderId: payment.order_id },
      include: { items: true },
    });
    if (order && order.paymentStatus !== "CAPTURED") {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "CAPTURED",
          status: "PAID",
          razorpayPaymentId: payment.id,
        },
      });
    }
  }

  if (event.event === "payment.failed" && payment?.order_id) {
    await prisma.order.updateMany({
      where: { razorpayOrderId: payment.order_id, paymentStatus: "PENDING" },
      data: { paymentStatus: "FAILED" },
    });
  }

  return NextResponse.json({ received: true });
}
