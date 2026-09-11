export const metadata = { title: "Shipping & returns" };

export default function ShippingPage() {
  return (
    <div className="container-nvl max-w-3xl py-14">
      <h1 className="serif text-5xl">Shipping & returns</h1>
      <p className="mt-6 leading-8">
        We ship across India. Prepaid orders over ₹999 travel free; below that a ₹79 shipping fee
        applies. Cash on Delivery is available on most pin codes. Dispatch is typically 24–48 hours,
        delivery 2–5 working days depending on city.
      </p>
      <p className="mt-4 leading-8">
        Unopened products may be returned within 7 days of delivery. Opened hygiene and lip products
        cannot be resold, so they are only replaced if damaged or incorrect. Write to us from the
        Contact page with your order number.
      </p>
    </div>
  );
}
