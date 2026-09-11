import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCartDetailed, writeCart } from "@/lib/cart";
import { getSession } from "@/lib/auth";
import { checkoutSchema } from "@/lib/validators";
import { makeOrderNumber, shippingForSubtotal, splitInclusiveGst } from "@/lib/money";
import { getRazorpay, razorpayConfigured } from "@/lib/razorpay";
import { jsonError, clientIp } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const limited = rateLimit(`checkout:${clientIp(req)}`, 12, 10 * 60_000);
  if (!limited.ok) return jsonError("Too many checkout attempts.", 429);

  const body = await req.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message || "Check your address details.");

  const cart = await getCartDetailed();
  if (!cart.items.length) return jsonError("Your cart is empty.");

  for (const item of cart.items) {
    if (item.qty > item.product.stock) {
      return jsonError(`${item.product.name} does not have enough stock.`);
    }
  }

  let discountPaise = 0;
  let couponId: string | undefined;
  let couponCode: string | undefined;
  if (parsed.data.couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: parsed.data.couponCode.trim().toUpperCase() },
    });
    if (!coupon || !coupon.active || (coupon.expiresAt && coupon.expiresAt < new Date())) {
      return jsonError("This coupon is not valid.");
    }
    if (cart.subtotalPaise < coupon.minPaise) {
      return jsonError("Cart does not meet the coupon minimum.");
    }
    discountPaise = Math.round((cart.subtotalPaise * coupon.percentOff) / 100);
    couponId = coupon.id;
    couponCode = coupon.code;
  }

  const shippingPaise = shippingForSubtotal(cart.subtotalPaise - discountPaise);
  const totalPaise = Math.max(100, cart.subtotalPaise - discountPaise + shippingPaise);
  const { gstPaise } = splitInclusiveGst(totalPaise - shippingPaise);

  const session = await getSession();
  const orderNumber = makeOrderNumber();

  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId: session?.id,
      email: parsed.data.email,
      phone: parsed.data.phone,
      status: parsed.data.paymentMethod === "COD" ? "CONFIRMED" : "PENDING_PAYMENT",
      paymentMethod: parsed.data.paymentMethod,
      paymentStatus: parsed.data.paymentMethod === "COD" ? "PENDING" : "PENDING",
      subtotalPaise: cart.subtotalPaise,
      discountPaise,
      shippingPaise,
      taxPaise: gstPaise,
      totalPaise,
      couponId,
      couponCode,
      notes: parsed.data.notes || null,
      shippingName: parsed.data.fullName,
      shippingPhone: parsed.data.phone,
      shippingLine1: parsed.data.line1,
      shippingLine2: parsed.data.line2 || null,
      shippingCity: parsed.data.city,
      shippingState: parsed.data.state,
      shippingPincode: parsed.data.pincode,
      items: {
        create: cart.items.map((i) => ({
          productId: i.product.id,
          name: i.product.name,
          sku: i.product.sku,
          qty: i.qty,
          pricePaise: i.product.pricePaise,
          gstPercent: i.product.gstPercent,
        })),
      },
    },
  });

  if (parsed.data.paymentMethod === "COD") {
    await prisma.$transaction(
      cart.items.map((i) =>
        prisma.product.update({
          where: { id: i.product.id },
          data: { stock: { decrement: i.qty } },
        }),
      ),
    );
    await writeCart([]);
    return NextResponse.json({
      ok: true,
      method: "COD",
      orderId: order.id,
      orderNumber: order.orderNumber,
    });
  }

  if (!razorpayConfigured()) {
    return jsonError(
      "Razorpay keys are not configured yet. Use Cash on Delivery, or add NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
      503,
    );
  }

  const rzp = getRazorpay();
  const rzpOrder = await rzp.orders.create({
    amount: totalPaise,
    currency: "INR",
    receipt: order.orderNumber,
    notes: { orderId: order.id, orderNumber: order.orderNumber },
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { razorpayOrderId: rzpOrder.id },
  });

  return NextResponse.json({
    ok: true,
    method: "RAZORPAY",
    orderId: order.id,
    orderNumber: order.orderNumber,
    razorpayOrderId: rzpOrder.id,
    amount: totalPaise,
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    prefill: {
      name: parsed.data.fullName,
      email: parsed.data.email,
      contact: parsed.data.phone,
    },
  });
}
