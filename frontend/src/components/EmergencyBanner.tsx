import Link from "next/link";
import { Siren } from "lucide-react";

export function EmergencyBanner() {
  return (
    <Link
      href="/emergency"
      className="group relative flex min-h-[88px] items-center justify-between gap-4 overflow-hidden rounded-3xl bg-emergency px-5 py-4 text-white shadow-[0_12px_30px_-12px_rgba(180,35,24,0.7)] focus:outline-none focus-visible:ring-4 focus-visible:ring-emergency/40"
      aria-label="Acil yardım çağır — en yakın veteriner ve pet taksi"
    >
      <span className="absolute -right-6 -top-8 h-28 w-28 rounded-full bg-white/10" aria-hidden />
      <span className="flex items-start gap-3">
        <Siren className="mt-0.5 h-9 w-9 shrink-0" aria-hidden />
        <span>
          <span className="block font-display text-2xl font-semibold leading-tight">
            Acil yardım çağır
          </span>
          <span className="mt-1 block text-sm text-white/90">
            Tek ekran: en yakın açık klinik + pet taksi. En fazla 2 dokunuş.
          </span>
        </span>
      </span>
      <span className="tap hidden shrink-0 items-center rounded-2xl bg-white px-4 text-sm font-bold text-emergency sm:inline-flex">
        Başlat
      </span>
    </Link>
  );
}
