import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getSession } from "@/lib/auth";
import { getCartDetailed } from "@/lib/cart";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const cart = await getCartDetailed();
  return (
    <>
      <Header user={session} cartCount={cart.count} />
      <main>{children}</main>
      <Footer />
    </>
  );
}
