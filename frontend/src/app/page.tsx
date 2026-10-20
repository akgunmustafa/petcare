import Link from "next/link";
import { Bone, CarFront, Hotel, Stethoscope, IdCard } from "lucide-react";
import { EmergencyBanner } from "@/components/EmergencyBanner";

const modules = [
  {
    href: "/vet",
    title: "Veteriner",
    desc: "Soru-cevap ve tele-vet",
    icon: Stethoscope,
  },
  {
    href: "/taxi",
    title: "Pet Taksi",
    desc: "Fiyat + canlı konum",
    icon: CarFront,
  },
  {
    href: "/boarding",
    title: "Konaklama",
    desc: "Otel ve bakıcı",
    icon: Hotel,
  },
  {
    href: "/supplies",
    title: "Dayanışma",
    desc: "Mama, kan, sahiplendirme",
    icon: Bone,
  },
  {
    href: "/profile",
    title: "Aşı Kartı",
    desc: "Dijital pet kimliği",
    icon: IdCard,
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-trust">Hoş geldin, Ayşe</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Pamuk ve Karabaş için her şey tek yerde
        </h1>
      </header>

      <EmergencyBanner />

      <section aria-labelledby="moduller">
        <h2 id="moduller" className="mb-3 text-sm font-semibold text-muted">
          5 temel modül
        </h2>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {modules.map((m) => (
            <li key={m.href} className={m.href === "/profile" ? "sm:col-span-2" : ""}>
              <Link
                href={m.href}
                className="flex min-h-[88px] items-center gap-4 rounded-2xl border border-line bg-paper p-4 hover:border-trust/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-trust"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cream text-trust">
                  <m.icon className="h-6 w-6" aria-hidden />
                </span>
                <span>
                  <span className="block font-display text-lg font-semibold">{m.title}</span>
                  <span className="text-sm text-muted">{m.desc}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
