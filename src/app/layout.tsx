import type { Metadata } from "next";
import { Figtree, Instrument_Serif } from "next/font/google";
import { LibraryProvider } from "@/components/LibraryProvider";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Nuvelist",
  description: "A quiet desk for drafting novels, chapters, and story bibles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${figtree.variable} ${instrument.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <LibraryProvider>{children}</LibraryProvider>
      </body>
    </html>
  );
}
