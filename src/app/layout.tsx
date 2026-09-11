import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "Nuvelist | Clinical Skin Actives",
    template: "%s | Nuvelist",
  },
  description:
    "Nuvelist is an Indian clinical skincare house. Fragrance-free actives that cleanse, repair and protect the skin barrier.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      <body className={`${outfit.variable} ${cormorant.variable} antialiased min-h-screen bg-ivory text-navy`}>
        {children}
      </body>
    </html>
  );
}
