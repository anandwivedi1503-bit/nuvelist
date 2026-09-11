import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LogoMark } from "@/components/Brand";
import { LogoutButton } from "@/components/LogoutButton";

const nav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Catalogue" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/inquiries", label: "Inquiries" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/account");

  return (
    <div className="min-h-screen bg-[#f3eee4]">
      <div className="flex min-h-screen">
        <aside className="hidden w-60 flex-col bg-navy p-6 text-white md:flex">
          <Link href="/admin" className="flex items-center gap-2">
            <LogoMark className="h-8 w-8" />
            <span className="text-sm uppercase tracking-[0.18em]">Nuvelist CRM</span>
          </Link>
          <nav className="mt-10 flex flex-col gap-3 text-sm">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="text-white/80 hover:text-white">
                {n.label}
              </Link>
            ))}
            <Link href="/" className="mt-6 text-white/50">
              View store
            </Link>
          </nav>
        </aside>
        <div className="flex-1">
          <header className="flex items-center justify-between border-b border-line px-6 py-4">
            <p className="text-sm text-muted">Signed in as {session.email}</p>
            <LogoutButton />
          </header>
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
