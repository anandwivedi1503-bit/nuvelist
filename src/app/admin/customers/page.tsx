import { prisma } from "@/lib/prisma";

export const metadata = { title: "Customers" };

export default async function AdminCustomers() {
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    include: { _count: { select: { orders: true } } },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div>
      <h1 className="serif text-4xl">Customers</h1>
      <div className="mt-6 overflow-x-auto card">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-widest text-muted">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Mobile</th>
              <th className="p-3">Orders</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-t border-line">
                <td className="p-3">{c.name}</td>
                <td className="p-3">{c.email}</td>
                <td className="p-3">{c.phone}</td>
                <td className="p-3">{c._count.orders}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
