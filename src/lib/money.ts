export const GST_PERCENT = 18;
export const FREE_SHIPPING_OVER_PAISE = 99900;
export const SHIPPING_PAISE = 7900;

export function paiseToRupees(paise: number) {
  return paise / 100;
}

export function formatINR(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paiseToRupees(paise));
}

/** Indian D2C prices are GST-inclusive. Split for invoices. */
export function splitInclusiveGst(inclusivePaise: number, gstPercent = GST_PERCENT) {
  const taxable = Math.round((inclusivePaise * 100) / (100 + gstPercent));
  const gst = inclusivePaise - taxable;
  return { taxablePaise: taxable, gstPaise: gst };
}

export function shippingForSubtotal(subtotalPaise: number) {
  return subtotalPaise >= FREE_SHIPPING_OVER_PAISE ? 0 : SHIPPING_PAISE;
}

export function makeOrderNumber() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `NVL-${y}${m}${day}-${rand}`;
}
