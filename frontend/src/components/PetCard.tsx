import { ShieldCheck } from "lucide-react";

type Vaccine = { name: string; date: string; next: string };

export function PetCard({
  name,
  species,
  breed,
  weightKg,
  vaccines,
  notes,
  compact = false,
}: {
  name: string;
  species: string;
  breed: string;
  weightKg: number;
  vaccines: Vaccine[];
  notes?: string;
  compact?: boolean;
}) {
  return (
    <article className="rounded-2xl border border-line bg-paper p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold">{name}</h2>
          <p className="text-sm text-muted">
            {species} · {breed} · {weightKg} kg
          </p>
        </div>
        <span className="inline-flex min-h-12 items-center gap-1 rounded-full bg-trust/10 px-3 text-sm font-semibold text-trust">
          <ShieldCheck className="h-4 w-4" aria-hidden />
          Dijital aşı kartı
        </span>
      </div>
      <ul className="mt-3 space-y-2">
        {(compact ? vaccines.slice(0, 2) : vaccines).map((v) => (
          <li key={v.name} className="flex items-center justify-between rounded-xl bg-cream px-3 py-2 text-sm">
            <span className="font-medium">{v.name}</span>
            <span className="text-muted">sonraki {v.next}</span>
          </li>
        ))}
      </ul>
      {!compact && notes ? <p className="mt-3 text-sm text-muted">{notes}</p> : null}
    </article>
  );
}
