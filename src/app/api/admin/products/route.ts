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
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ products });
}

const updateSchema = z.object({
  id: z.string(),
  pricePaise: z.number().int().min(100).optional(),
  mrpPaise: z.number().int().min(100).optional(),
  stock: z.number().int().min(0).optional(),
  active: z.boolean().optional(),
  featured: z.boolean().optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return jsonError("Admin only.", 403);
  }
  const parsed = updateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Invalid product update.");
  const { id, ...data } = parsed.data;
  const product = await prisma.product.update({ where: { id }, data });
  return NextResponse.json({ product });
}
