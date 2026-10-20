import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PetCare Connect",
  description: "Veteriner, pet taksi, otel & bakıcı, dayanışma ve dijital aşı karnesi.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
