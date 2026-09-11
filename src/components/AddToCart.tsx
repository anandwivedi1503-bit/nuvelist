"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AddToCart({ productId, stock }: { productId: string; stock: number }) {
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const router = useRouter();

  async function add() {
    setBusy(true);
    setMsg("");
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, qty, action: "add" }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setMsg(data.error || "Could not add to bag");
      return;
    }
    router.refresh();
    setMsg("Added to bag");
  }

  return (
    <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="inline-flex items-center rounded-full border border-line">
        <button type="button" className="px-4 py-2" onClick={() => setQty((q) => Math.max(1, q - 1))}>
          −
        </button>
        <span className="min-w-8 text-center">{qty}</span>
        <button
          type="button"
          className="px-4 py-2"
          onClick={() => setQty((q) => Math.min(stock, q + 1))}
        >
          +
        </button>
      </div>
      <button className="btn btn-primary" disabled={busy || stock < 1} onClick={add} type="button">
        {stock < 1 ? "Out of stock" : busy ? "Adding…" : "Add to bag"}
      </button>
      {msg && <p className="text-sm text-teal">{msg}</p>}
    </div>
  );
}
