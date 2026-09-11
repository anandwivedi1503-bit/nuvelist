import { NextRequest, NextResponse } from "next/server";
import { cartActionSchema } from "@/lib/validators";
import { getCartDetailed, readCart, writeCart } from "@/lib/cart";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";
import { formatINR, shippingForSubtotal } from "@/lib/money";

export async function GET() {
  const cart = await getCartDetailed();
  const shippingPaise = shippingForSubtotal(cart.subtotalPaise);
  return NextResponse.json({
    count: cart.count,
    subtotalPaise: cart.subtotalPaise,
    shippingPaise,
    totalPaise: cart.subtotalPaise + shippingPaise,
    subtotalLabel: formatINR(cart.subtotalPaise),
    items: cart.items.map((i) => ({
      id: i.product.id,
      slug: i.product.slug,
      name: i.product.name,
      image: i.product.image,
      qty: i.qty,
      pricePaise: i.product.pricePaise,
      linePaise: i.linePaise,
      priceLabel: formatINR(i.product.pricePaise),
      stock: i.product.stock,
    })),
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = cartActionSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid cart request.");

  if (parsed.data.action === "clear") {
    await writeCart([]);
    return GET();
  }

  const product = await prisma.product.findUnique({ where: { id: parsed.data.productId } });
  if (!product || !product.active) return jsonError("Product not available.");

  const lines = await readCart();
  const idx = lines.findIndex((l) => l.productId === product.id);

  if (parsed.data.action === "remove") {
    await writeCart(lines.filter((l) => l.productId !== product.id));
    return GET();
  }

  const nextQty =
    parsed.data.action === "update"
      ? parsed.data.qty ?? 0
      : (idx >= 0 ? lines[idx].qty : 0) + (parsed.data.qty ?? 1);

  const qty = Math.max(0, Math.min(8, Math.min(nextQty, product.stock)));
  if (idx >= 0) {
    lines[idx].qty = qty;
  } else if (qty > 0) {
    lines.push({ productId: product.id, qty });
  }
  await writeCart(lines.filter((l) => l.qty > 0));
  return GET();
}
