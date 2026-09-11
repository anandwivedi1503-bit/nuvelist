import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";

export default async function HomePage() {
  const products = await prisma.product.findMany({
    where: { active: true, featured: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="container-nvl grid items-center gap-10 py-10 lg:grid-cols-2 lg:py-16">
          <div>
            <p className="serif text-3xl italic text-teal">Clean skin.</p>
            <h1 className="mt-2 max-w-xl text-5xl font-semibold uppercase leading-[0.95] tracking-tight text-navy md:text-7xl">
              Protected
              <br />
              Barrier.
            </h1>
            <p className="mt-6 max-w-md text-sm uppercase tracking-[0.18em] text-muted">
              Gentle today. Healthy tomorrow.
            </p>
            <p className="mt-6 max-w-lg text-[15px] leading-7 text-navy-2">
              Nuvelist formulates clinical skin actives for Indian weather and Indian routines —
              fragrance-free, pH balanced, dermatologically tested. Pay with UPI, cards or Cash on
              Delivery. GST-ready invoices on every order.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/shop" className="btn btn-primary">
                Shop actives
              </Link>
              <Link href="/clinical" className="btn btn-ghost">
                The clinical standard
              </Link>
            </div>
          </div>
          <div className="overflow-hidden rounded-[36px] shadow-[0_20px_60px_rgba(13,44,63,0.12)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/cleanser-hero.jpg" alt="Daily Barrier Cleanser ritual" className="w-full object-cover" />
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-white/50">
        <div className="container-nvl grid grid-cols-2 gap-6 py-8 text-center md:grid-cols-4">
          {[
            ["Dermatologically", "tested"],
            ["pH", "balanced"],
            ["Fragrance", "free"],
            ["Made for", "India"],
          ].map(([a, b]) => (
            <div key={a}>
              <p className="text-xs uppercase tracking-[0.2em] text-muted">{a}</p>
              <p className="serif text-2xl text-navy">{b}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-nvl py-16">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-teal">The collection</p>
            <h2 className="serif mt-2 text-4xl">Clinical actives that care</h2>
          </div>
          <Link href="/shop" className="hidden text-sm uppercase tracking-[0.16em] md:block">
            View all
          </Link>
        </div>
        <div className="mt-10 grid gap-10 md:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="container-nvl grid gap-8 pb-16 lg:grid-cols-2">
        <div className="overflow-hidden rounded-[32px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/lip-hero.jpg" alt="Peptide Lip Repair results" className="h-full w-full object-cover" />
        </div>
        <div className="flex flex-col justify-center rounded-[32px] bg-navy p-8 text-white md:p-12">
          <p className="serif text-3xl italic text-white/80">Lips that feel</p>
          <h2 className="mt-2 text-4xl font-semibold uppercase leading-none md:text-5xl">
            Healthy.
            <br />
            Plump.
            <br />
            Protected.
          </h2>
          <p className="mt-6 max-w-md text-white/70">
            93% of users felt softer, smoother and healthier lips in just 7 days*. Peptide Lip Repair
            with ceramides, hyaluronic acid and panthenol.
          </p>
          <Link href="/product/peptide-lip-repair" className="btn mt-8 w-fit bg-white text-navy">
            Discover lip repair
          </Link>
        </div>
      </section>
    </div>
  );
}
