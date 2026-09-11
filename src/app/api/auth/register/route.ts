import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, hashPassword } from "@/lib/auth";
import { registerSchema } from "@/lib/validators";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp, jsonError } from "@/lib/http";

export async function POST(req: NextRequest) {
  const limited = rateLimit(`register:${clientIp(req)}`, 8, 15 * 60_000);
  if (!limited.ok) return jsonError("Too many attempts. Try again later.", 429);

  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message || "Invalid details");

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return jsonError("An account with this email already exists.");

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      passwordHash: await hashPassword(parsed.data.password),
      role: "CUSTOMER",
    },
  });

  await createSession({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  return NextResponse.json({ ok: true, user: { id: user.id, name: user.name, email: user.email } });
}
