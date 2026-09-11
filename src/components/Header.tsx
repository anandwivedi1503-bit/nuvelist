"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BrandLockup } from "./Brand";
import type { SessionUser } from "@/lib/auth";

const links = [
  { href: "/shop", label: "Shop" },
  { href: "/clinical", label: "Clinical" },
  { href: "/about", label: "Our House" },
  { href: "/contact", label: "Contact" },
];

export function Header({ user, cartCount }: { user: SessionUser | null; cartCount: number }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-[rgba(246,242,235,0.92)] backdrop-blur">
      <div className="container-nvl flex h-[76px] items-center justify-between">
        <Link href="/" onClick={() => setOpen(false)}>
          <BrandLockup />
        </Link>
        <nav className="hidden items-center gap-8 text-[13px] uppercase tracking-[0.16em] text-navy md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-teal">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4 text-[13px] uppercase tracking-[0.14em]">
          {user ? (
            <Link href={user.role === "ADMIN" ? "/admin" : "/account"} className="hidden sm:block">
              {user.role === "ADMIN" ? "CRM" : "Account"}
            </Link>
          ) : (
            <Link href="/login" className="hidden sm:block">
              Sign in
            </Link>
          )}
          <Link href="/cart" className="relative">
            Bag
            {cartCount > 0 && (
              <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-navy px-1 text-[11px] text-white">
                {cartCount}
              </span>
            )}
          </Link>
          <button
            className="md:hidden"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            type="button"
          >
            Menu
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-line bg-ivory px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3 text-sm uppercase tracking-[0.14em]">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ))}
            <Link href={user ? "/account" : "/login"} onClick={() => setOpen(false)}>
              {user ? "Account" : "Sign in"}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
