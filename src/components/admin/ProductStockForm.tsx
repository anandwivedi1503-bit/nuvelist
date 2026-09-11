"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ProductStockForm({ id, stock }: { id: string; stock: number }) {
  const [value, setValue] = useState(stock);
  const router = useRouter();
  return (
    <input
      className="input w-24 py-1"
      type="number"
      min={0}
      value={value}
      onChange={(e) => setValue(Number(e.target.value))}
      onBlur={async () => {
        await fetch("/api/admin/products", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, stock: value }),
        });
        router.refresh();
      }}
    />
  );
}
