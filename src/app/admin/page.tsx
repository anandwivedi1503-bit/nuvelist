import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/money";
import Link from "next/link";

export const metadata = { title: "CRM" };

export default async function AdminHome() {
  const [orders, products, customers, inquiries, paid] = await Promise.all([
    prisma.order.count(),
    prisma.product.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.inquiry.count({ where: { status: "NEW" } }),
    prisma.order.findMany({
      where: { status: { not: "CANCELLED" } },
      select: { totalPaise: true, paymentStatus: true, paymentMethod: true },
    }),
  ]);
  const revenue = paid
    .filter((o) => o.paymentStatus === "CAPTURED" || o.paymentMethod === "COD")
    .reduce((s, o) => s + o.totalPaise, 0);
  const recent = await prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 8 });

  const cards = [
    ["Orders", String(orders), "/admin/orders"],
    ["Revenue", formatINR(revenue), "/admin/orders"],
    ["Customers", String(customers), "/admin/customers"],
    ["Open inquiries", String(inquiries), "/admin/inquiries"],
    ["SKUs", String(products), "/admin/products"],
  ];

  return (
    <div>
      <h1 className="serif text-4xl">House overview</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map(([l, v, href]) => (
          <Link key={l} href={href} className="card p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted">{l}</p>
            <p className="mt-2 text-2xl">{v}</p>
          </Link>
        ))}
      </div>
      <h2 className="mt-10 text-sm uppercase tracking-[0.16em]">Latest orders</h2>
      <div className="mt-3 overflow-x-auto card">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-widest text-muted">
            <tr>
              <th className="p-3">Order</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Total</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((o) => (
              <tr key={o.id} className="border-t border-line">
                <td className="p-3">{o.orderNumber}</td>
                <td className="p-3">{o.email}</td>
                <td className="p-3">{formatINR(o.totalPaise)}</td>
                <td className="p-3">{o.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
