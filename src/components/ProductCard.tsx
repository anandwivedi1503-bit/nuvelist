import Link from "next/link";
import { formatINR } from "@/lib/money";
import type { Product } from "@prisma/client";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="overflow-hidden rounded-[28px] bg-cream">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.name}
          className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-teal">{product.tagline}</p>
          <h3 className="mt-1 text-lg font-medium text-navy">{product.name}</h3>
          <p className="text-sm text-muted">{product.volume}</p>
        </div>
        <div className="text-right">
          <p className="font-medium">{formatINR(product.pricePaise)}</p>
          {product.mrpPaise > product.pricePaise && (
            <p className="text-xs text-muted line-through">{formatINR(product.mrpPaise)}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
