import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/money";
import { LogoutButton } from "@/components/LogoutButton";

export const metadata = { title: "Account" };

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div className="container-nvl py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-teal">Account</p>
          <h1 className="serif mt-2 text-5xl">Hello, {session.name.split(" ")[0]}</h1>
          <p className="mt-2 text-sm text-muted">{session.email}</p>
        </div>
        <LogoutButton />
      </div>
      <h2 className="mt-10 text-sm uppercase tracking-[0.16em]">Orders</h2>
      <div className="mt-4 space-y-3">
        {orders.length === 0 && <p className="text-sm text-muted">No orders yet.</p>}
        {orders.map((o) => (
          <Link key={o.id} href={`/order/${o.id}`} className="card block p-5">
            <div className="flex justify-between gap-4">
              <div>
                <p className="font-medium">{o.orderNumber}</p>
                <p className="text-sm text-muted">
                  {o.items.map((i) => i.name).join(", ")} · {o.status}
                </p>
              </div>
              <p>{formatINR(o.totalPaise)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
