"use client";

import { INDIAN_STATES } from "@/lib/india";
import { formatINR } from "@/lib/money";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    Razorpay?: new (opts: Record<string, unknown>) => { open: () => void };
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [totals, setTotals] = useState({ totalPaise: 0, count: 0 });
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "Maharashtra",
    pincode: "",
    paymentMethod: "COD" as "COD" | "RAZORPAY",
    couponCode: "",
    notes: "",
  });

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setForm((f) => ({ ...f, fullName: d.user.name, email: d.user.email }));
        }
      });
    fetch("/api/cart")
      .then((r) => r.json())
      .then((d) => setTotals({ totalPaise: d.totalPaise, count: d.count }));
  }, []);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setBusy(false);
      setError(data.error || "Checkout failed");
      return;
    }

    if (data.method === "COD") {
      router.push(`/order/${data.orderId}?success=1`);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => {
      const rzp = new window.Razorpay!({
        key: data.keyId,
        amount: data.amount,
        currency: "INR",
        name: "Nuvelist",
        description: data.orderNumber,
        order_id: data.razorpayOrderId,
        prefill: data.prefill,
        theme: { color: "#0d2c3f" },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const verify = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: data.orderId, ...response }),
          });
          if (verify.ok) router.push(`/order/${data.orderId}?success=1`);
          else setError("Payment received but verification failed. Write to support with your Order ID.");
          setBusy(false);
        },
      });
      rzp.open();
      setBusy(false);
    };
    script.onerror = () => {
      setError("Could not load Razorpay.");
      setBusy(false);
    };
    document.body.appendChild(script);
  }

  return (
    <div className="container-nvl py-12">
      <h1 className="serif text-5xl">Checkout</h1>
      <p className="mt-2 text-sm text-muted">
        Indian addresses only · GST included · {totals.count} item(s) · {formatINR(totals.totalPaise)}
      </p>
      <form onSubmit={pay} className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="space-y-3">
          <input className="input" placeholder="Full name" required value={form.fullName} onChange={(e) => set("fullName", e.target.value)} />
          <input className="input" type="email" placeholder="Email" required value={form.email} onChange={(e) => set("email", e.target.value)} />
          <input className="input" placeholder="10-digit mobile" required value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          <input className="input" placeholder="Address line 1" required value={form.line1} onChange={(e) => set("line1", e.target.value)} />
          <input className="input" placeholder="Landmark / line 2" value={form.line2} onChange={(e) => set("line2", e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <input className="input" placeholder="City" required value={form.city} onChange={(e) => set("city", e.target.value)} />
            <input className="input" placeholder="PIN code" required value={form.pincode} onChange={(e) => set("pincode", e.target.value)} />
          </div>
          <select className="input" value={form.state} onChange={(e) => set("state", e.target.value)}>
            {INDIAN_STATES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <input className="input" placeholder="Coupon (optional) e.g. GLOW10" value={form.couponCode} onChange={(e) => set("couponCode", e.target.value.toUpperCase())} />
          <textarea className="input" placeholder="Delivery notes" value={form.notes} onChange={(e) => set("notes", e.target.value)} />
        </div>
        <div className="card h-fit p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Pay</p>
          <label className="mt-4 flex items-start gap-3 rounded-2xl border border-line p-4">
            <input type="radio" checked={form.paymentMethod === "COD"} onChange={() => set("paymentMethod", "COD")} />
            <span>
              <strong>Cash on Delivery</strong>
              <span className="mt-1 block text-sm text-muted">Pay when your ritual arrives. Popular across India.</span>
            </span>
          </label>
          <label className="mt-3 flex items-start gap-3 rounded-2xl border border-line p-4">
            <input type="radio" checked={form.paymentMethod === "RAZORPAY"} onChange={() => set("paymentMethod", "RAZORPAY")} />
            <span>
              <strong>UPI / Cards / Netbanking</strong>
              <span className="mt-1 block text-sm text-muted">Secure Razorpay checkout. Keys can be added anytime.</span>
            </span>
          </label>
          {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
          <button className="btn btn-primary mt-6 w-full" disabled={busy} type="submit">
            {busy ? "Placing order…" : "Place order"}
          </button>
        </div>
      </form>
    </div>
  );
}
