import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/money";
import { ProductStockForm } from "@/components/admin/ProductStockForm";

export const metadata = { title: "Catalogue" };

export default async function AdminProducts() {
  const products = await prisma.product.findMany({ include: { category: true }, orderBy: { name: "asc" } });
  return (
    <div>
      <h1 className="serif text-4xl">Catalogue</h1>
      <div className="mt-6 overflow-x-auto card">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-widest text-muted">
            <tr>
              <th className="p-3">SKU</th>
              <th className="p-3">Name</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Live</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-line">
                <td className="p-3">{p.sku}</td>
                <td className="p-3">
                  {p.name}
                  <span className="block text-xs text-muted">{p.category.name}</span>
                </td>
                <td className="p-3">{formatINR(p.pricePaise)}</td>
                <td className="p-3">
                  <ProductStockForm id={p.id} stock={p.stock} />
                </td>
                <td className="p-3">{p.active ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
