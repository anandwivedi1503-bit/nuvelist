import Link from "next/link";
import { BrandLockup } from "./Brand";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-navy text-[#e8efe8]">
      <div className="container-nvl grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <BrandLockup light />
          <p className="mt-5 max-w-md text-sm leading-6 text-white/70">
            Clinically formulated in India. Dermatologically tested. Fragrance free. pH balanced.
            Built for Indian weather, Indian skin, Indian addresses — GST invoices included.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/50">Shop</p>
          <div className="mt-4 flex flex-col gap-2 text-sm">
            <Link href="/shop">All actives</Link>
            <Link href="/product/daily-barrier-cleanser">Daily Barrier Cleanser</Link>
            <Link href="/product/peptide-lip-repair">Peptide Lip Repair</Link>
            <Link href="/product/clinical-ritual-duo">Clinical Ritual Duo</Link>
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/50">House</p>
          <div className="mt-4 flex flex-col gap-2 text-sm">
            <Link href="/about">Our story</Link>
            <Link href="/clinical">Clinical standard</Link>
            <Link href="/shipping">Shipping & returns</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs tracking-[0.18em] text-white/45">
        CLINICALLY FORMULATED | DERMATOLOGICALLY TESTED | FRAGRANCE FREE | pH BALANCED · #CLEANPROTECTGLOW
      </div>
    </footer>
  );
}
