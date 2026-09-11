import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";

export const metadata = { title: "Shop" };

export default async function ShopPage() {
  const products = await prisma.product.findMany({
    where: { active: true },
    include: { category: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="container-nvl py-12">
      <p className="text-xs uppercase tracking-[0.22em] text-teal">All actives</p>
      <h1 className="serif mt-2 text-5xl">Shop Nuvelist</h1>
      <p className="mt-3 max-w-xl text-muted">
        Prices in INR, inclusive of GST. Free shipping across India on orders over ₹999.
      </p>
      <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
