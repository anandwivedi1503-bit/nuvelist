import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { contactSchema } from "@/lib/validators";
import { jsonError, clientIp } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const limited = rateLimit(`contact:${clientIp(req)}`, 6, 15 * 60_000);
  if (!limited.ok) return jsonError("Please wait before sending another message.", 429);

  const parsed = contactSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message || "Invalid form.");

  const session = await getSession();
  const inquiry = await prisma.inquiry.create({
    data: {
      userId: session?.id,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      subject: parsed.data.subject,
      message: parsed.data.message,
    },
  });

  return NextResponse.json({ ok: true, id: inquiry.id });
}
