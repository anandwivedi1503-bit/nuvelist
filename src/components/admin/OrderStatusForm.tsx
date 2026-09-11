"use client";

import { useRouter } from "next/navigation";

const statuses = [
  "PENDING_PAYMENT",
  "PAID",
  "CONFIRMED",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

export function OrderStatusForm({ orderId, status }: { orderId: string; status: string }) {
  const router = useRouter();
  return (
    <select
      className="input mt-2 max-w-48 text-sm"
      defaultValue={status}
      onChange={async (e) => {
        await fetch("/api/admin/overview", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, status: e.target.value }),
        });
        router.refresh();
      }}
    >
      {statuses.map((s) => (
        <option key={s}>{s}</option>
      ))}
    </select>
  );
}
