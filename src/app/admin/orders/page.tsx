import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/money";
import { OrderStatusForm } from "@/components/admin/OrderStatusForm";

export const metadata = { title: "Orders" };

export default async function AdminOrders() {
  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 80,
  });

  return (
    <div>
      <h1 className="serif text-4xl">Orders</h1>
      <div className="mt-6 space-y-4">
        {orders.map((o) => (
          <article key={o.id} className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">{o.orderNumber}</p>
                <p className="text-sm text-muted">
                  {o.email} · {o.phone} · {o.paymentMethod}
                </p>
                <p className="mt-1 text-sm">
                  {o.shippingName}, {o.shippingCity}, {o.shippingState} {o.shippingPincode}
                </p>
                <ul className="mt-2 text-sm">
                  {o.items.map((i) => (
                    <li key={i.id}>
                      {i.name} × {i.qty}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="text-right">
                <p className="text-lg">{formatINR(o.totalPaise)}</p>
                <OrderStatusForm orderId={o.id} status={o.status} />
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
