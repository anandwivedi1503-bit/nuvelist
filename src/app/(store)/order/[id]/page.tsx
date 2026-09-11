import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/money";
import Link from "next/link";

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  const { id } = await params;
  const { success } = await searchParams;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();

  return (
    <div className="container-nvl py-12">
      {success && (
        <p className="mb-4 rounded-full bg-teal/10 px-4 py-2 text-sm text-teal">
          Thank you. Your Nuvelist order is confirmed.
        </p>
      )}
      <p className="text-xs uppercase tracking-[0.2em] text-muted">{order.orderNumber}</p>
      <h1 className="serif mt-2 text-4xl">Order details</h1>
      <p className="mt-2 text-sm text-muted">
        Status: {order.status.replace("_", " ")} · {order.paymentMethod} · {order.paymentStatus}
      </p>
      <div className="mt-8 card p-6">
        {order.items.map((i) => (
          <div key={i.id} className="flex justify-between border-b border-line py-3 text-sm">
            <span>
              {i.name} × {i.qty}
            </span>
            <span>{formatINR(i.pricePaise * i.qty)}</span>
          </div>
        ))}
        <div className="mt-3 flex justify-between text-sm">
          <span>Discount</span>
          <span>-{formatINR(order.discountPaise)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Shipping</span>
          <span>{order.shippingPaise ? formatINR(order.shippingPaise) : "Free"}</span>
        </div>
        <div className="mt-3 flex justify-between font-medium">
          <span>Total (incl. GST)</span>
          <span>{formatINR(order.totalPaise)}</span>
        </div>
        <p className="mt-6 text-sm leading-6">
          Ship to {order.shippingName}, {order.shippingLine1}, {order.shippingCity}, {order.shippingState}{" "}
          {order.shippingPincode}
        </p>
      </div>
      <Link href="/shop" className="btn btn-ghost mt-8">
        Continue shopping
      </Link>
    </div>
  );
}
