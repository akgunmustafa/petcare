import type { Metadata } from "next";
import { Figtree, Fraunces } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

const sans = Figtree({ subsets: ["latin", "latin-ext"], variable: "--font-sans" });
const display = Fraunces({ subsets: ["latin", "latin-ext"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "PetCare — Acil veteriner, taksi, konaklama",
  description: "Tek tıkla en yakın veteriner ve pet taksi. Konaklama, aşı kartı ve dayanışma panosu.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className={`${sans.className} ${display.variable} antialiased`}>
        <a className="skip-link" href="#icerik">
          İçeriğe atla
        </a>
        <Navbar />
        <main id="icerik" className="mx-auto w-full max-w-5xl px-4 pb-24 pt-6">
          {children}
        </main>
      </body>
    </html>
  );
}
