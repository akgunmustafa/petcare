"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PetCard } from "@/components/PetCard";
import { api } from "@/lib/api";

type Profile = {
  owner: { name: string; phone: string; is_verified: boolean };
  pets: {
    id: number;
    name: string;
    species: string;
    breed: string;
    weight_kg: number;
    vaccines_json: string;
    medical_notes: string;
  }[];
};

export default function ProfilePage() {
  const [data, setData] = useState<Profile | null>(null);

  useEffect(() => {
    api<Profile>("/api/profile").then(setData);
  }, []);

  if (!data) return <p>Yükleniyor…</p>;

  return (
    <div className="space-y-5">
      <Link href="/" className="tap inline-flex text-sm font-medium text-muted">
        ← Ana sayfa
      </Link>
      <header>
        <h1 className="font-display text-3xl font-semibold">Dijital Pet Kartı</h1>
        <p className="text-muted">
          {data.owner.name} · {data.owner.phone}
          {data.owner.is_verified ? " · doğrulanmış sahip" : ""}
        </p>
      </header>
      <div className="space-y-3">
        {data.pets.map((p) => (
          <PetCard
            key={p.id}
            name={p.name}
            species={p.species}
            breed={p.breed}
            weightKg={p.weight_kg}
            vaccines={JSON.parse(p.vaccines_json)}
            notes={p.medical_notes}
          />
        ))}
      </div>
    </div>
  );
}
