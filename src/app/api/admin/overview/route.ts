import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { z } from "zod";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return jsonError("Admin only.", 403);
  }

  const [orders, products, customers, inquiries, paid] = await Promise.all([
    prisma.order.count(),
    prisma.product.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.inquiry.count({ where: { status: "NEW" } }),
    prisma.order.findMany({
      where: { paymentStatus: { in: ["CAPTURED", "PENDING"] }, status: { not: "CANCELLED" } },
      select: { totalPaise: true, paymentMethod: true, paymentStatus: true },
    }),
  ]);

  const revenuePaise = paid
    .filter((o) => o.paymentStatus === "CAPTURED" || o.paymentMethod === "COD")
    .reduce((s, o) => s + o.totalPaise, 0);

  const recent = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
    select: {
      id: true,
      orderNumber: true,
      email: true,
      totalPaise: true,
      status: true,
      paymentMethod: true,
      createdAt: true,
    },
  });

  const lowStock = await prisma.product.findMany({
    where: { stock: { lte: 20 } },
    select: { id: true, name: true, sku: true, stock: true },
  });

  return NextResponse.json({
    orders,
    products,
    customers,
    inquiries,
    revenuePaise,
    recent,
    lowStock,
  });
}

const statusSchema = z.object({
  orderId: z.string(),
  status: z.enum([
    "PENDING_PAYMENT",
    "PAID",
    "CONFIRMED",
    "PACKED",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED",
  ]),
});

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return jsonError("Admin only.", 403);
  }
  const parsed = statusSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Invalid status update.");
  const order = await prisma.order.update({
    where: { id: parsed.data.orderId },
    data: { status: parsed.data.status },
  });
  await prisma.auditLog.create({
    data: {
      action: "ORDER_STATUS",
      entity: "Order",
      entityId: order.id,
      meta: parsed.data.status,
    },
  });
  return NextResponse.json({ ok: true });
}
