import Link from "next/link";
import { PawPrint } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-cream/90 backdrop-blur">
      <nav
        className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3"
        aria-label="Ana menü"
      >
        <Link
          href="/"
          className="tap inline-flex items-center gap-2 rounded-xl px-2 text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-trust"
        >
          <PawPrint className="h-7 w-7 text-trust" aria-hidden />
          <span className="font-display text-xl font-semibold">PetCare</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/profile"
            className="tap inline-flex items-center rounded-xl px-3 text-sm font-medium text-muted hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-trust"
          >
            Aşı kartı
          </Link>
          <Link
            href="/emergency"
            className="tap inline-flex items-center justify-center rounded-xl bg-emergency px-4 text-sm font-bold text-white shadow-sm hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emergency"
          >
            ACİL
          </Link>
        </div>
      </nav>
    </header>
  );
}
