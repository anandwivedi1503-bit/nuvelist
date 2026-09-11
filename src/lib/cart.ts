import { cookies } from "next/headers";
import { prisma } from "./prisma";

export const CART_COOKIE = "nv_cart";

export type CartLine = { productId: string; qty: number };

export async function readCart(): Promise<CartLine[]> {
  const store = await cookies();
  const raw = store.get(CART_COOKIE)?.value;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as CartLine[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((l) => l && typeof l.productId === "string" && Number(l.qty) > 0)
      .map((l) => ({ productId: l.productId, qty: Math.min(8, Math.floor(Number(l.qty))) }));
  } catch {
    return [];
  }
}

export async function writeCart(lines: CartLine[]) {
  const store = await cookies();
  const cleaned = lines.filter((l) => l.qty > 0);
  store.set(CART_COOKIE, JSON.stringify(cleaned), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function getCartDetailed() {
  const lines = await readCart();
  if (!lines.length) return { lines: [], items: [], subtotalPaise: 0, count: 0 };
  const products = await prisma.product.findMany({
    where: { id: { in: lines.map((l) => l.productId) }, active: true },
  });
  const items = lines
    .map((line) => {
      const product = products.find((p) => p.id === line.productId);
      if (!product) return null;
      const qty = Math.min(line.qty, product.stock || line.qty);
      return { product, qty, linePaise: product.pricePaise * qty };
    })
    .filter(Boolean) as {
    product: (typeof products)[number];
    qty: number;
    linePaise: number;
  }[];
  const subtotalPaise = items.reduce((s, i) => s + i.linePaise, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);
  return { lines, items, subtotalPaise, count };
}
