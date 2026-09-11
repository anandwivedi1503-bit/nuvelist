"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatINR } from "@/lib/money";

type Cart = {
  count: number;
  subtotalPaise: number;
  shippingPaise: number;
  totalPaise: number;
  items: {
    id: string;
    slug: string;
    name: string;
    image: string;
    qty: number;
    pricePaise: number;
    linePaise: number;
    stock: number;
  }[];
};

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);

  async function load() {
    const res = await fetch("/api/cart");
    setCart(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function update(productId: string, qty: number) {
    await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, qty, action: qty < 1 ? "remove" : "update" }),
    });
    await load();
  }

  if (!cart) return <div className="container-nvl py-16">Loading bag…</div>;

  return (
    <div className="container-nvl py-12">
      <h1 className="serif text-5xl">Your bag</h1>
      {!cart.items.length ? (
        <div className="mt-8">
          <p>Your bag is empty.</p>
          <Link href="/shop" className="btn btn-primary mt-6">
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {cart.items.map((item) => (
              <div key={item.id} className="card flex gap-4 p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt="" className="h-28 w-24 rounded-2xl object-cover" />
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <Link href={`/product/${item.slug}`} className="font-medium">
                      {item.name}
                    </Link>
                    <p className="text-sm text-muted">{formatINR(item.pricePaise)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center rounded-full border border-line">
                      <button className="px-3 py-1" onClick={() => update(item.id, item.qty - 1)}>
                        −
                      </button>
                      <span className="px-2">{item.qty}</span>
                      <button className="px-3 py-1" onClick={() => update(item.id, item.qty + 1)}>
                        +
                      </button>
                    </div>
                    <p>{formatINR(item.linePaise)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <aside className="card h-fit p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Summary</p>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal (incl. GST)</span>
                <span>{formatINR(cart.subtotalPaise)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{cart.shippingPaise ? formatINR(cart.shippingPaise) : "Free"}</span>
              </div>
              <div className="flex justify-between border-t border-line pt-3 text-base font-medium">
                <span>To pay</span>
                <span>{formatINR(cart.totalPaise)}</span>
              </div>
            </div>
            <Link href="/checkout" className="btn btn-primary mt-6 w-full">
              Checkout
            </Link>
            <p className="mt-3 text-xs text-muted">UPI, cards, netbanking via Razorpay · Cash on Delivery</p>
          </aside>
        </div>
      )}
    </div>
  );
}
