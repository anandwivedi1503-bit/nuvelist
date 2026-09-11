import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/money";
import { AddToCart } from "@/components/AddToCart";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  return { title: product?.name || "Product" };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { reviews: { where: { approved: true }, include: { user: true } } },
  });
  if (!product || !product.active) notFound();

  const gallery = JSON.parse(product.gallery || "[]") as string[];
  const claims = JSON.parse(product.claims || "[]") as string[];
  const actives = JSON.parse(product.actives || "[]") as { name: string; benefit: string }[];

  return (
    <div className="container-nvl py-10">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-4">
          {gallery.map((src) => (
            <div key={src} className="overflow-hidden rounded-[28px] bg-cream">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={product.name} className="w-full object-cover" />
            </div>
          ))}
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-teal">{product.tagline}</p>
          <h1 className="mt-2 text-4xl font-semibold uppercase leading-tight md:text-5xl">{product.name}</h1>
          <p className="mt-2 text-sm text-muted">
            {product.volume} · SKU {product.sku}
          </p>
          <div className="mt-6 flex items-end gap-3">
            <p className="text-3xl">{formatINR(product.pricePaise)}</p>
            {product.mrpPaise > product.pricePaise && (
              <p className="pb-1 text-muted line-through">{formatINR(product.mrpPaise)}</p>
            )}
            <p className="pb-1 text-xs uppercase tracking-widest text-muted">Incl. GST</p>
          </div>
          <p className="mt-6 leading-7 text-navy-2">{product.description}</p>
          <ul className="mt-6 space-y-2 text-sm">
            {claims.map((c) => (
              <li key={c} className="flex gap-2">
                <span className="text-teal">✓</span>
                {c}
              </li>
            ))}
          </ul>
          <AddToCart productId={product.id} stock={product.stock} />
          <p className="mt-3 text-xs text-muted">{product.stock} units in stock · Ships across India in 2–5 days</p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {actives.map((a) => (
              <div key={a.name} className="card p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-teal">{a.name}</p>
                <p className="mt-2 text-sm">{a.benefit}</p>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <h2 className="text-sm uppercase tracking-[0.16em]">How to use</h2>
            <p className="mt-2 text-sm leading-7">{product.howToUse}</p>
          </div>
          <div className="mt-6">
            <h2 className="text-sm uppercase tracking-[0.16em]">Ingredients</h2>
            <p className="mt-2 text-sm leading-7 text-muted">{product.ingredients}</p>
          </div>
        </div>
      </div>

      {product.reviews.length > 0 && (
        <section className="mt-16">
          <h2 className="serif text-3xl">Reviews</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {product.reviews.map((r) => (
              <article key={r.id} className="card p-5">
                <p className="text-sm font-medium">
                  {"★".repeat(r.rating)} {r.title}
                </p>
                <p className="mt-2 text-sm leading-6 text-navy-2">{r.body}</p>
                <p className="mt-3 text-xs uppercase tracking-widest text-muted">{r.user.name}</p>
              </article>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted">*Consumer perception study. Individual results may vary.</p>
        </section>
      )}
    </div>
  );
}
